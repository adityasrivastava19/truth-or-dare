import React, { useEffect, useRef } from 'react';
import { Player } from '../types/game';
import { sounds } from '../utils/sound';

interface WheelSpinnerProps {
  players: Player[];
  targetPlayerId: string | null;
  isSpinning: boolean;
  onSpinEnd?: () => void;
}

export const WheelSpinner: React.FC<WheelSpinnerProps> = ({
  players,
  targetPlayerId,
  isSpinning
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rotationRef = useRef<number>(0);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const numSegments = Math.max(1, players.length);
    const segmentAngle = (2 * Math.PI) / numSegments;
    const colors = [
      '#ec4899', '#8b5cf6', '#06b6d4', '#f59e0b',
      '#10b981', '#ef4444', '#3b82f6', '#84cc16'
    ];

    const drawWheel = (angleOffset: number) => {
      const width = canvas.width;
      const height = canvas.height;
      const radius = width / 2 - 15;
      const centerX = width / 2;
      const centerY = height / 2;

      ctx.clearRect(0, 0, width, height);

      // Draw Segments
      players.forEach((player, idx) => {
        const startAngle = angleOffset + idx * segmentAngle;
        const endAngle = startAngle + segmentAngle;

        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.closePath();

        ctx.fillStyle = colors[idx % colors.length];
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#090b14';
        ctx.stroke();

        // Draw Player Name & Avatar
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(startAngle + segmentAngle / 2);
        ctx.textAlign = 'right';
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 15px Outfit, sans-serif';
        ctx.fillText(`${player.avatar} ${player.name}`, radius - 20, 5);
        ctx.restore();
      });

      // Draw Outer Glow Circle
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.lineWidth = 6;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.stroke();

      // Draw Center Pin / Hub
      ctx.beginPath();
      ctx.arc(centerX, centerY, 24, 0, 2 * Math.PI);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#ec4899';
      ctx.stroke();

      // Pointer Arrow at top
      ctx.beginPath();
      ctx.moveTo(centerX - 14, 5);
      ctx.lineTo(centerX + 14, 5);
      ctx.lineTo(centerX, 28);
      ctx.closePath();
      ctx.fillStyle = '#f43f5e';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();
    };

    let startTimestamp: number | null = null;
    let targetRotation = rotationRef.current;

    if (isSpinning && targetPlayerId) {
      const targetIndex = players.findIndex((p) => p.id === targetPlayerId);
      const idx = targetIndex >= 0 ? targetIndex : 0;

      // Calculate angle so target lands under pointer (top 270 deg / -90 deg)
      const targetSegmentAngle = idx * segmentAngle + segmentAngle / 2;
      const finalAngle = 1.5 * Math.PI - targetSegmentAngle;
      
      // Add 5 to 7 full rotations for excitement!
      const totalSpin = 6 * (2 * Math.PI) + (finalAngle % (2 * Math.PI));
      const initialRotation = rotationRef.current;
      targetRotation = initialRotation + totalSpin;

      let lastTickAngle = initialRotation;

      const animate = (timestamp: number) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const elapsed = timestamp - startTimestamp;
        const duration = 3200; // 3.2 seconds duration

        if (elapsed < duration) {
          // Quintic ease-out formula for ultra-smooth deceleration physics
          const progress = elapsed / duration;
          const easeOut = 1 - Math.pow(1 - progress, 4);
          const currentRot = initialRotation + (targetRotation - initialRotation) * easeOut;
          rotationRef.current = currentRot;

          // Sound tick whenever passing segment boundary
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
  }, [players, isSpinning, targetPlayerId]);

  return (
    <div style={{ textAlign: 'center', position: 'relative', width: '280px', height: '280px', margin: '0 auto' }}>
      <canvas ref={canvasRef} width={280} height={280} style={{ borderRadius: '50%' }} />
    </div>
  );
};
