import React, { useEffect, useRef } from 'react';

interface MovingTirangaProps {
  width?: number;
  height?: number;
  showPole?: boolean;
  className?: string;
}

export const MovingTiranga: React.FC<MovingTirangaProps> = ({
  width = 160,
  height = 110,
  showPole = true,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Retina / High-DPI support
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Proportions: 3:2 flag aspect ratio
    const poleWidth = showPole ? 4.5 : 0;
    const poleX = showPole ? 20 : 0;
    const poleTopY = showPole ? 10 : 2;
    const poleBottomY = showPole ? height - 6 : height;

    const flagH = showPole ? height * 0.62 : height - 4;
    const flagW = flagH * 1.5; // 3:2 official Indian flag ratio
    const originX = showPole ? poleX + poleWidth / 2 : 2;
    const originY = showPole ? poleTopY + 8 : 2;

    // Pre-render static Indian flag texture on an offscreen canvas
    const offscreen = document.createElement('canvas');
    offscreen.width = flagW * 2;
    offscreen.height = flagH * 2;
    const octx = offscreen.getContext('2d');
    if (!octx) return;
    octx.scale(2, 2);

    const bandH = flagH / 3;

    // 1. Saffron (Kesari)
    octx.fillStyle = '#FF9933';
    octx.fillRect(0, 0, flagW, bandH);

    // 2. White (Shwet)
    octx.fillStyle = '#FFFFFF';
    octx.fillRect(0, bandH, flagW, bandH);

    // 3. Green (Hara)
    octx.fillStyle = '#138808';
    octx.fillRect(0, bandH * 2, flagW, bandH);

    // 4. Ashoka Chakra (Navy Blue, 24 spokes) in the center of white band
    const chakraCenterX = flagW / 2;
    const chakraCenterY = flagH / 2;
    const chakraRadius = bandH * 0.44;

    // Outer circle
    octx.strokeStyle = '#000080';
    octx.lineWidth = Math.max(1, flagH * 0.025);
    octx.beginPath();
    octx.arc(chakraCenterX, chakraCenterY, chakraRadius, 0, Math.PI * 2);
    octx.stroke();

    // Central hub
    octx.fillStyle = '#000080';
    octx.beginPath();
    octx.arc(chakraCenterX, chakraCenterY, chakraRadius * 0.18, 0, Math.PI * 2);
    octx.fill();

    // 24 spokes
    octx.lineWidth = Math.max(0.6, flagH * 0.012);
    for (let i = 0; i < 24; i++) {
      const angle = (i * Math.PI * 2) / 24;
      octx.beginPath();
      octx.moveTo(chakraCenterX, chakraCenterY);
      octx.lineTo(
        chakraCenterX + Math.cos(angle) * chakraRadius,
        chakraCenterY + Math.sin(angle) * chakraRadius
      );
      octx.stroke();
    }

    let animId: number;
    let t = 0;

    const render = () => {
      t += 0.055;
      ctx.clearRect(0, 0, width, height);

      // Render Pole & Stand if requested
      if (showPole) {
        // Golden Finial ball
        const finialGrad = ctx.createRadialGradient(
          poleX - 1,
          poleTopY - 1,
          1,
          poleX,
          poleTopY,
          5.5
        );
        finialGrad.addColorStop(0, '#FFF9C4');
        finialGrad.addColorStop(0.4, '#F59E0B');
        finialGrad.addColorStop(1, '#92400E');
        ctx.fillStyle = finialGrad;
        ctx.beginPath();
        ctx.arc(poleX, poleTopY, 5.5, 0, Math.PI * 2);
        ctx.fill();

        // Pole cap
        ctx.fillStyle = '#B45309';
        ctx.fillRect(poleX - 4, poleTopY + 4, 8, 2);

        // Stainless steel metallic flagpole
        const poleGrad = ctx.createLinearGradient(
          poleX - poleWidth / 2,
          0,
          poleX + poleWidth / 2,
          0
        );
        poleGrad.addColorStop(0, '#94A3B8');
        poleGrad.addColorStop(0.4, '#F8FAFC');
        poleGrad.addColorStop(1, '#64748B');
        ctx.fillStyle = poleGrad;
        ctx.fillRect(
          poleX - poleWidth / 2,
          poleTopY + 6,
          poleWidth,
          poleBottomY - poleTopY - 6
        );

        // Pedestal / Base
        const baseW = 24;
        const baseH = 6;
        const baseGrad = ctx.createLinearGradient(
          poleX - baseW / 2,
          0,
          poleX + baseW / 2,
          0
        );
        baseGrad.addColorStop(0, '#64748B');
        baseGrad.addColorStop(0.5, '#CBD5E1');
        baseGrad.addColorStop(1, '#475569');
        ctx.fillStyle = baseGrad;
        ctx.beginPath();
        ctx.roundRect(
          poleX - baseW / 2,
          poleBottomY - baseH,
          baseW,
          baseH,
          [3, 3, 1, 1]
        );
        ctx.fill();
      }

      // Realistic Waving Cloth Physics (Slice rendering)
      const slices = 60;
      const sliceW = flagW / slices;

      for (let i = 0; i < slices; i++) {
        const sx = (i * flagW) / slices;
        const progress = i / slices; // 0 = pole anchor, 1 = fly tip

        // Dual sine waves for natural wind gust ripple
        const wave1 = Math.sin(progress * 4.6 - t * 2.0);
        const wave2 = Math.cos(progress * 7.2 - t * 2.8) * 0.25;
        const amplitude = Math.pow(progress, 1.15) * (flagH * 0.11);
        const dy = (wave1 + wave2) * amplitude;

        // Dynamic 3D cloth lighting (crest highlight & trough shadow)
        const slope = Math.cos(progress * 4.6 - t * 2.0);
        const light = Math.max(-0.35, Math.min(0.35, slope * 0.35));

        const dx = originX + i * sliceW;
        const dyPos = originY + dy;

        // Draw vertical slice from offscreen buffer (2x source resolution)
        ctx.drawImage(
          offscreen,
          sx * 2,
          0,
          sliceW * 2,
          flagH * 2,
          dx,
          dyPos,
          sliceW + 0.3, // 0.3px overlap prevents subpixel gaps
          flagH
        );

        // Apply realistic fold lighting / shading
        if (light > 0) {
          ctx.fillStyle = `rgba(255, 255, 255, ${light * 0.65})`;
        } else {
          ctx.fillStyle = `rgba(0, 0, 0, ${-light * 0.55})`;
        }
        ctx.fillRect(dx, dyPos, sliceW + 0.3, flagH);
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [width, height, showPole]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width, height }}
      className={`select-none pointer-events-none ${className}`}
    />
  );
};
