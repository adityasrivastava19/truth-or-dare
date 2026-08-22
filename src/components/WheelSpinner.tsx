import React, { useEffect, useRef } from 'react';
import { Player } from '../types/game';
import { sounds } from '../utils/sound';

interface WheelSpinnerProps {
  players: Player[];
  targetPlayerId: string | null;
  isSpinning: boolean;
  /** Parallel array to `players` — each entry is the truth/dare assigned to that segment */
  segmentTypes?: ('truth' | 'dare')[];
  onSpinEnd?: () => void;
}

const BASE_SIZE = 420; // logical CSS size in px

export const WheelSpinner: React.FC<WheelSpinnerProps> = ({
  players,
  targetPlayerId,
  isSpinning,
  segmentTypes = []
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rotationRef = useRef<number>(0);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // ── HiDPI / Retina fix ────────────────────────────────────────────────────
    const dpr = Math.min(window.devicePixelRatio || 1, 3); // cap at 3× to avoid OOM
    const SIZE = BASE_SIZE * dpr;
    canvas.width  = SIZE;
    canvas.height = SIZE;
    // Keep CSS display size unchanged so layout is unaffected
    canvas.style.width  = `${BASE_SIZE}px`;
    canvas.style.height = `${BASE_SIZE}px`;
    ctx.scale(dpr, dpr); // all drawing coordinates stay in logical px
    // ─────────────────────────────────────────────────────────────────────────

    const numSegments = Math.max(1, players.length);
    const segmentAngle = (2 * Math.PI) / numSegments;

    // Color palette: truth = teal/blue, dare = pink/red
    const truthColors = ['#0e7490', '#0f766e', '#1e40af', '#6d28d9'];
    const dareColors  = ['#be185d', '#9d174d', '#c2410c', '#b91c1c'];

    const getSegColor = (idx: number, type: 'truth' | 'dare') =>
      type === 'truth' ? truthColors[idx % truthColors.length] : dareColors[idx % dareColors.length];

    const lighten = (hex: string, amt: number) => {
      const n = parseInt(hex.replace('#', ''), 16);
      const r = Math.min(255, (n >> 16) + amt);
      const g = Math.min(255, ((n >> 8) & 0xff) + amt);
      const b = Math.min(255, (n & 0xff) + amt);
      return `rgb(${r},${g},${b})`;
    };

    const drawWheel = (angleOffset: number) => {
      // All coordinates are in logical (CSS) px — ctx.scale(dpr,dpr) handles the rest
      const W = BASE_SIZE;
      const H = BASE_SIZE;
      const radius = W / 2 - 22;
      const cx = W / 2;
      const cy = H / 2;

      ctx.clearRect(0, 0, W, H);

      // ── Outer glow halo ──
      const halo = ctx.createRadialGradient(cx, cy, radius - 8, cx, cy, radius + 24);
      halo.addColorStop(0, 'rgba(236,72,153,0.35)');
      halo.addColorStop(1, 'rgba(139,92,246,0)');
      ctx.beginPath();
      ctx.arc(cx, cy, radius + 22, 0, 2 * Math.PI);
      ctx.fillStyle = halo;
      ctx.fill();

      // ── Segments ──
      players.forEach((player, idx) => {
        const type: 'truth' | 'dare' = segmentTypes[idx] ?? (idx % 2 === 0 ? 'truth' : 'dare');
        const startAngle = angleOffset + idx * segmentAngle;
        const endAngle   = startAngle + segmentAngle;
        const midAngle   = startAngle + segmentAngle / 2;
        const baseColor  = getSegColor(idx, type);

        // Radial gradient fill
        const gx1 = cx + Math.cos(midAngle) * radius * 0.28;
        const gy1 = cy + Math.sin(midAngle) * radius * 0.28;
        const grad = ctx.createRadialGradient(gx1, gy1, 0, cx, cy, radius);
        grad.addColorStop(0, lighten(baseColor, 55));
        grad.addColorStop(1, baseColor);

        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, radius, startAngle, endAngle);
        ctx.closePath();
        ctx.fillStyle = grad;
        ctx.fill();

        // Crisp segment border
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgba(0,0,0,0.45)';
        ctx.stroke();

        // ── Text labels ──
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(midAngle);
        ctx.textAlign = 'right';

        // Text shadow for legibility
        ctx.shadowColor = 'rgba(0,0,0,0.9)';
        ctx.shadowBlur  = 6;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        // Player name
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 15px Outfit, sans-serif';
        ctx.fillText(`${player.avatar} ${player.name}`, radius - 14, -7);

        // Truth / Dare badge
        ctx.fillStyle = type === 'truth' ? '#67e8f9' : '#fda4af';
        ctx.font = 'bold 12px Outfit, sans-serif';
        ctx.fillText(type === 'truth' ? '🧊 TRUTH' : '🔥 DARE', radius - 14, 11);

        ctx.shadowBlur = 0;
        ctx.restore();
      });

      // ── Outer ring chrome ──
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
      ctx.lineWidth = 6;
      ctx.strokeStyle = 'rgba(255,255,255,0.35)';
      ctx.stroke();

      // Inner ring shadow
      ctx.beginPath();
      ctx.arc(cx, cy, radius - 3, 0, 2 * Math.PI);
      ctx.lineWidth = 3;
      ctx.strokeStyle = 'rgba(0,0,0,0.25)';
      ctx.stroke();

      // ── Center hub ──
      const hubGrad = ctx.createRadialGradient(cx - 5, cy - 5, 0, cx, cy, 34);
      hubGrad.addColorStop(0, '#ffffff');
      hubGrad.addColorStop(1, '#d1d5db');
      ctx.beginPath();
      ctx.arc(cx, cy, 34, 0, 2 * Math.PI);
      ctx.fillStyle = hubGrad;
      ctx.fill();
      ctx.lineWidth = 5;
      ctx.strokeStyle = '#ec4899';
      ctx.stroke();

      // Hub icon
      ctx.font = '18px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🎡', cx, cy);
      ctx.textBaseline = 'alphabetic';

      // ── Pointer arrow (top, points into wheel) ──
      ctx.beginPath();
      ctx.moveTo(cx - 16, 5);
      ctx.lineTo(cx + 16, 5);
      ctx.lineTo(cx, 36);
      ctx.closePath();
      const arrowGrad = ctx.createLinearGradient(cx, 5, cx, 36);
      arrowGrad.addColorStop(0, '#fb7185');
      arrowGrad.addColorStop(1, '#be123c');
      ctx.fillStyle = arrowGrad;
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();
    };

    let startTimestamp: number | null = null;
    let targetRotation = rotationRef.current;

    if (isSpinning && targetPlayerId) {
      const targetIndex = players.findIndex((p) => p.id === targetPlayerId);
      const idx = targetIndex >= 0 ? targetIndex : 0;

      const targetSegmentMid = idx * segmentAngle + segmentAngle / 2;
      const finalAngle = 1.5 * Math.PI - targetSegmentMid;
      const normDelta = ((finalAngle - rotationRef.current) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
      const totalSpin = 6 * 2 * Math.PI + normDelta;
      const initialRotation = rotationRef.current;
      targetRotation = initialRotation + totalSpin;

      let lastTickAngle = initialRotation;

      const animate = (timestamp: number) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const elapsed  = timestamp - startTimestamp;
        const duration = 3200;

        if (elapsed < duration) {
          const progress = elapsed / duration;
          const easeOut  = 1 - Math.pow(1 - progress, 5);
          const currentRot = initialRotation + (targetRotation - initialRotation) * easeOut;
          rotationRef.current = currentRot;

          if (Math.abs(currentRot - lastTickAngle) >= segmentAngle / 2) {
            sounds.playTick();
            lastTickAngle = currentRot;
          }

          drawWheel(currentRot);
          animFrameRef.current = requestAnimationFrame(animate);
        } else {
          rotationRef.current = targetRotation;
          drawWheel(targetRotation);
        }
      };

      animFrameRef.current = requestAnimationFrame(animate);
    } else {
      drawWheel(rotationRef.current);
    }

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [players, isSpinning, targetPlayerId, segmentTypes]);

  return (
    <div style={{ textAlign: 'center', position: 'relative', width: '100%', maxWidth: `${BASE_SIZE}px`, aspectRatio: '1/1', margin: '0 auto' }}>
      <canvas
        ref={canvasRef}
        style={{
          borderRadius: '50%',
          width: `${BASE_SIZE}px`,
          height: `${BASE_SIZE}px`,
          filter: 'drop-shadow(0 0 28px rgba(236,72,153,0.55)) drop-shadow(0 0 8px rgba(139,92,246,0.4))'
        }}
      />
    </div>
  );
};

