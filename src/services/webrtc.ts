import { socket } from './socket';

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
    { urls: 'stun:stun.services.mozilla.com' }
  ]
};

export class WebRTCManager {
  private localStream: MediaStream | null = null;
  private peerConnections: Map<string, RTCPeerConnection> = new Map();
  private remoteStreams: Map<string, MediaStream> = new Map();
  private pendingCandidates: Map<string, RTCIceCandidateInit[]> = new Map();
  private onRemoteStreamCallbacks: Map<string, (stream: MediaStream) => void> = new Map();
  private onPeerDisconnectedCallbacks: Map<string, () => void> = new Map();
  private isScreenSharing: boolean = false;
  private originalVideoTrack: MediaStreamTrack | null = null;

  public async initLocalStream(videoDeviceId?: string, audioDeviceId?: string): Promise<MediaStream> {
    try {
      const constraints: MediaStreamConstraints = {
        audio: audioDeviceId
          ? { deviceId: { exact: audioDeviceId }, echoCancellation: true, noiseSuppression: true, autoGainControl: true }
          : { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
        video: videoDeviceId
          ? { deviceId: { exact: videoDeviceId }, width: { ideal: 1280 }, height: { ideal: 720 } }
          : { width: { ideal: 1280 }, height: { ideal: 720 } }
      };

      this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
      return this.localStream;
    } catch (err) {
      console.warn('[WebRTC] Native camera/mic access failed or denied, creating virtual fallback stream:', err);
      this.localStream = this.createFallbackStream();
      return this.localStream;
    }
  }

  // Generate fallback canvas animation stream for testing on devices without dual cameras
  private createFallbackStream(): MediaStream {
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext('2d')!;

    let hue = Math.floor(Math.random() * 360);
    const draw = () => {
      hue = (hue + 1) % 360;
      ctx.fillStyle = `hsl(${hue}, 70%, 15%)`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 32px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('✨ Virtual Camera Mode', canvas.width / 2, canvas.height / 2 - 20);

      ctx.font = '18px Inter, sans-serif';
      ctx.fillStyle = '#a1a1aa';
      ctx.fillText('Truth or Dare Stream Active', canvas.width / 2, canvas.height / 2 + 20);

      requestAnimationFrame(draw);
    };
    draw();

    const canvasStream = canvas.captureStream(30);
    
    // Create silent dummy audio track
    const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const dst = audioCtx.createMediaStreamDestination();
    osc.connect(dst);
    osc.start();
    const audioTrack = dst.stream.getAudioTracks()[0];
    audioTrack.enabled = false; // Muted by default for fallback

    canvasStream.addTrack(audioTrack);
    return canvasStream;
  }

  public getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  public registerRemoteStreamHandler(peerId: string, onStream: (stream: MediaStream) => void, onDisconnect?: () => void) {
    this.onRemoteStreamCallbacks.set(peerId, onStream);
    if (onDisconnect) {
      this.onPeerDisconnectedCallbacks.set(peerId, onDisconnect);
    }
  }

  public async connectToPeer(peerId: string, isInitiator: boolean) {
    if (this.peerConnections.has(peerId)) {
      console.log(`[WebRTC] Connection with peer ${peerId} already exists`);
      return;
    }

    console.log(`[WebRTC] Creating connection with peer ${peerId} (Initiator: ${isInitiator})`);
    const pc = new RTCPeerConnection(ICE_SERVERS);
    this.peerConnections.set(peerId, pc);

    // Add local stream tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        pc.addTrack(track, this.localStream!);
      });
    }

    // ICE Candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('signal-ice-candidate', { targetId: peerId, candidate: event.candidate });
      }
    };

    // Remote Stream track received
    pc.ontrack = (event) => {
      console.log(`[WebRTC] Received track from peer ${peerId}:`, event.track.kind);
      let stream = this.remoteStreams.get(peerId);
      if (!stream) {
        stream = new MediaStream();
        this.remoteStreams.set(peerId, stream);
      }
      
      // Remove stale track of same kind if exists
      const existing = stream.getTracks().filter((t) => t.kind === event.track.kind);
      existing.forEach((t) => stream!.removeTrack(t));
      stream.addTrack(event.track);

      // Also grab tracks from event stream if provided
      if (event.streams && event.streams[0]) {
        event.streams[0].getTracks().forEach((t) => {
          if (!stream!.getTracks().some((st) => st.id === t.id)) {
            stream!.addTrack(t);
          }
        });
      }

      const cb = this.onRemoteStreamCallbacks.get(peerId);
      if (cb) cb(new MediaStream(stream.getTracks()));
    };

    pc.oniceconnectionstatechange = () => {
      console.log(`[WebRTC] ICE Connection State with ${peerId}:`, pc.iceConnectionState);
      if (pc.iceConnectionState === 'disconnected' || pc.iceConnectionState === 'failed' || pc.iceConnectionState === 'closed') {
        this.closePeerConnection(peerId);
      }
    };

    if (isInitiator) {
      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit('signal-offer', { targetId: peerId, offer });
      } catch (err) {
        console.error(`[WebRTC] Error creating offer for ${peerId}:`, err);
      }
    }
  }

  public async handleOffer(senderId: string, offer: RTCSessionDescriptionInit) {
    let pc = this.peerConnections.get(senderId);
    if (!pc) {
      await this.connectToPeer(senderId, false);
      pc = this.peerConnections.get(senderId);
    }
    if (!pc) return;

    // Ensure local stream tracks are added to peer connection
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        if (!pc!.getSenders().some((s) => s.track === track)) {
          pc!.addTrack(track, this.localStream!);
        }
      });
    }

    try {
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      await this.flushPendingCandidates(senderId);
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit('signal-answer', { targetId: senderId, answer });
    } catch (err) {
      console.error(`[WebRTC] Error handling offer from ${senderId}:`, err);
    }
  }

  public async handleAnswer(senderId: string, answer: RTCSessionDescriptionInit) {
    const pc = this.peerConnections.get(senderId);
    if (pc && pc.signalingState !== 'stable') {
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
        await this.flushPendingCandidates(senderId);
      } catch (err) {
        console.error(`[WebRTC] Error setting remote answer from ${senderId}:`, err);
      }
    }
  }

  public async handleIceCandidate(senderId: string, candidate: RTCIceCandidateInit) {
    const pc = this.peerConnections.get(senderId);
    if (pc && pc.remoteDescription && pc.remoteDescription.type) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.error(`[WebRTC] Error adding ICE candidate from ${senderId}:`, err);
      }
    } else {
      console.log(`[WebRTC] Queueing ICE candidate for ${senderId} until remote description set`);
      const queue = this.pendingCandidates.get(senderId) || [];
      queue.push(candidate);
      this.pendingCandidates.set(senderId, queue);
    }
  }

  private async flushPendingCandidates(peerId: string) {
    const pc = this.peerConnections.get(peerId);
    const queue = this.pendingCandidates.get(peerId);
    if (pc && queue && queue.length > 0) {
      console.log(`[WebRTC] Flushing ${queue.length} pending ICE candidates for ${peerId}`);
      for (const cand of queue) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(cand));
        } catch (e) {
          console.warn(`[WebRTC] Error applying flushed candidate:`, e);
        }
      }
      this.pendingCandidates.delete(peerId);
    }
  }

  public toggleAudio(enabled: boolean) {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach((t) => {
        t.enabled = enabled;
      });
    }
  }

  public toggleVideo(enabled: boolean) {
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach((t) => {
        t.enabled = enabled;
      });
    }
  }

  public async toggleScreenShare(): Promise<boolean> {
    if (!this.localStream) return false;

    if (this.isScreenSharing) {
      // Revert to original video track
      if (this.originalVideoTrack) {
        const screenTrack = this.localStream.getVideoTracks()[0];
        screenTrack.stop();
        this.localStream.removeTrack(screenTrack);
        this.localStream.addTrack(this.originalVideoTrack);

        // Replace track in peer connections
        this.peerConnections.forEach((pc) => {
          const sender = pc.getSenders().find((s) => s.track?.kind === 'video');
          if (sender && this.originalVideoTrack) {
            sender.replaceTrack(this.originalVideoTrack);
          }
        });
        this.originalVideoTrack = null;
      }
      this.isScreenSharing = false;
      return false;
    } else {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const screenTrack = screenStream.getVideoTracks()[0];

        this.originalVideoTrack = this.localStream.getVideoTracks()[0];
        this.localStream.removeTrack(this.originalVideoTrack);
        this.localStream.addTrack(screenTrack);

        // Replace track in all peer connections
        this.peerConnections.forEach((pc) => {
          const sender = pc.getSenders().find((s) => s.track?.kind === 'video');
          if (sender) {
            sender.replaceTrack(screenTrack);
          }
        });

        screenTrack.onended = () => {
          this.toggleScreenShare();
        };

        this.isScreenSharing = true;
        return true;
      } catch (err) {
        console.warn('[WebRTC] Screen share cancelled or failed:', err);
        return false;
      }
    }
  }

  public closePeerConnection(peerId: string) {
    const pc = this.peerConnections.get(peerId);
    if (pc) {
      pc.close();
      this.peerConnections.delete(peerId);
    }
    const disconnectCb = this.onPeerDisconnectedCallbacks.get(peerId);
    if (disconnectCb) {
      disconnectCb();
      this.onPeerDisconnectedCallbacks.delete(peerId);
    }
    this.onRemoteStreamCallbacks.delete(peerId);
  }

  public closeAll() {
    this.peerConnections.forEach((pc) => pc.close());
    this.peerConnections.clear();
    this.onRemoteStreamCallbacks.clear();
    this.onPeerDisconnectedCallbacks.clear();

    if (this.localStream) {
      this.localStream.getTracks().forEach((t) => t.stop());
      this.localStream = null;
    }
  }
}

export const rtcManager = new WebRTCManager();
