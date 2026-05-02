import React, { useEffect, useRef } from 'react';

const DancingBackground: React.FC<{ scrollY: number }> = ({ scrollY }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    let time = 0;

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);

    // Dancer silhouette keyframes (simplified stick figure positions)

    const ribbons = Array.from({ length: 12 }, (_, i) => ({
      angle: (i / 12) * Math.PI * 2,
      length: 200 + Math.random() * 200,
      width: 2 + Math.random() * 4,
      color: ['#c77dff', '#e0aaff', '#ff6b9d', '#7b2fff', '#00d4ff'][i % 5],
      speed: 0.5 + Math.random() * 1.5,
      amplitude: 30 + Math.random() * 60,
      phase: Math.random() * Math.PI * 2
    }));

    const spotlights = [
      { x: 0.2, color: '#c77dff', intensity: 0.3 },
      { x: 0.5, color: '#e0aaff', intensity: 0.4 },
      { x: 0.8, color: '#7b2fff', intensity: 0.3 }
    ];

    const draw = () => {
      time += 0.02;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Deep space background
      const bg = ctx.createLinearGradient(0, 0, 0, canvas.height);
      bg.addColorStop(0, '#0a0a1a');
      bg.addColorStop(0.5, '#150a2d');
      bg.addColorStop(1, '#080810');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Floor (stage)
      const floorY = canvas.height * 0.75;
      const floorGrad = ctx.createLinearGradient(0, floorY, 0, canvas.height);
      floorGrad.addColorStop(0, 'rgba(30, 10, 60, 0.9)');
      floorGrad.addColorStop(1, 'rgba(5, 2, 15, 1)');
      ctx.fillStyle = floorGrad;
      ctx.fillRect(0, floorY, canvas.width, canvas.height - floorY);

      // Stage floor reflection lines
      for (let i = 0; i < 15; i++) {
        ctx.beginPath();
        ctx.moveTo(0, floorY + i * 20);
        ctx.lineTo(canvas.width, floorY + i * 20);
        ctx.strokeStyle = `rgba(199, 125, 255, ${0.05 - i * 0.003})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      // Spotlights from above
      spotlights.forEach(s => {
        const cx = s.x * canvas.width;
        const intensity = (Math.sin(time * 0.7 + s.x * 5) + 1) * 0.5 * s.intensity;
        const grad = ctx.createRadialGradient(cx, 0, 0, cx, floorY * 1.2, 300);
        grad.addColorStop(0, `${s.color}${Math.floor(intensity * 255).toString(16).padStart(2, '0')}`);
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        // Cone shape
        ctx.beginPath();
        ctx.moveTo(cx, 0);
        ctx.lineTo(cx - 150, canvas.height);
        ctx.lineTo(cx + 150, canvas.height);
        ctx.closePath();
        ctx.fillStyle = grad;
        ctx.fill();
      });

      // Dance ribbons
      const centerX = canvas.width * 0.5;
      const centerY = floorY * 0.6 + Math.sin(time * 0.5) * 30;

      ribbons.forEach(r => {
        ctx.beginPath();
        for (let t = 0; t < 1; t += 0.02) {
          const angle = r.angle + time * r.speed + t * Math.PI * 4;
          const wave = Math.sin(t * Math.PI * 6 + time * 2 + r.phase) * r.amplitude;
          const dist = t * r.length;
          const rx = centerX + Math.cos(angle) * dist + Math.sin(angle * 2 + time) * wave * 0.3;
          const ry = centerY + Math.sin(angle) * dist * 0.5 + wave;
          if (t === 0) ctx.moveTo(rx, ry);
          else ctx.lineTo(rx, ry);
        }
        ctx.strokeStyle = `${r.color}60`;
        ctx.lineWidth = r.width;
        ctx.lineCap = 'round';
        ctx.stroke();
      });

      // Glitter particles
      for (let i = 0; i < 50; i++) {
        const gx = (Math.sin(time * 0.3 + i * 1.7) * 0.5 + 0.5) * canvas.width;
        const gy = ((time * 0.2 + i * 0.13) % 1) * canvas.height;
        const gs = Math.random() * 3;
        const colors = ['#c77dff', '#e0aaff', '#ffffff', '#ff6b9d'];
        ctx.fillStyle = colors[i % colors.length] + 'aa';
        ctx.beginPath();
        ctx.arc(gx, gy, gs, 0, Math.PI * 2);
        ctx.fill();
      }

      // Aurora waves (scroll-reactive)
      for (let layer = 0; layer < 3; layer++) {
        ctx.beginPath();
        ctx.moveTo(0, canvas.height * 0.3 + layer * 40);
        for (let x = 0; x <= canvas.width; x += 5) {
          const y = canvas.height * 0.3 + layer * 40 +
            Math.sin(x * 0.005 + time * (0.3 + layer * 0.1)) * 60 +
            Math.sin(x * 0.01 + time * 0.5) * 30;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(canvas.width, 0);
        ctx.lineTo(0, 0);
        ctx.closePath();
        const auroraGrad = ctx.createLinearGradient(0, 0, 0, canvas.height * 0.4);
        auroraGrad.addColorStop(0, `rgba(${layer === 0 ? '199,125,255' : layer === 1 ? '123,47,255' : '224,170,255'},0.08)`);
        auroraGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = auroraGrad;
        ctx.fill();
      }

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => { cancelAnimationFrame(animRef.current); window.removeEventListener('resize', resize); };
  }, [scrollY]);

  return (
    <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }} />
  );
};

export default DancingBackground;