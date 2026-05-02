import React, { useEffect, useRef } from 'react';

const ArtBackground: React.FC<{ scrollY: number }> = ({ scrollY }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    let time = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Paint brush strokes
    const strokes = Array.from({ length: 30 }, () => ({
      points: Array.from({ length: 10 }, (_, i) => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 1
      })),
      color: ['#ff6b35', '#f7c59f', '#e63946', '#ffb703', '#219ebc', '#8ecae6'][Math.floor(Math.random() * 6)],
      width: Math.random() * 15 + 3,
      opacity: Math.random() * 0.4 + 0.1,
      life: 0,
      maxLife: 200 + Math.random() * 300
    }));

    const splashes = Array.from({ length: 15 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 60 + 20,
      color: ['#ff6b35', '#f7c59f', '#c77dff', '#e63946'][Math.floor(Math.random() * 4)],
      opacity: Math.random() * 0.15 + 0.05
    }));

    const offscreen = document.createElement('canvas');
    offscreen.width = canvas.width;
    offscreen.height = canvas.height;
    const offCtx = offscreen.getContext('2d')!;

    // Pre-draw canvas texture
    offCtx.fillStyle = '#1a0a0a';
    offCtx.fillRect(0, 0, offscreen.width, offscreen.height);
    for (let i = 0; i < 3000; i++) {
      offCtx.fillStyle = `rgba(255,200,150,${Math.random() * 0.03})`;
      offCtx.fillRect(Math.random() * offscreen.width, Math.random() * offscreen.height, 1, 1);
    }
    splashes.forEach(s => {
      const grad = offCtx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r);
      grad.addColorStop(0, `${s.color}${Math.floor(s.opacity * 255).toString(16).padStart(2,'0')}`);
      grad.addColorStop(1, 'transparent');
      offCtx.fillStyle = grad;
      offCtx.fillRect(s.x - s.r, s.y - s.r, s.r * 2, s.r * 2);
    });

    const draw = () => {
      time += 0.008;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(offscreen, 0, 0);

      const parallax = scrollY * 0.05;

      // Animated paint drips based on scroll
      const drips = Math.floor(scrollY / 200);
      for (let i = 0; i < drips; i++) {
        const x = ((i * 173) % canvas.width);
        const h = (scrollY * 0.3 - i * 30) % canvas.height;
        const color = ['#ff6b35', '#f7c59f', '#e63946'][i % 3];
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.strokeStyle = `${color}40`;
        ctx.lineWidth = 2 + Math.sin(time + i) * 1;
        ctx.stroke();
        // Drip end
        ctx.beginPath();
        ctx.arc(x, h, 4, 0, Math.PI * 2);
        ctx.fillStyle = `${color}60`;
        ctx.fill();
      }

      // Floating brush strokes
      strokes.forEach((s, si) => {
        s.life++;
        if (s.life > s.maxLife) {
          s.life = 0;
          s.points.forEach(p => {
            p.x = Math.random() * canvas.width;
            p.y = Math.random() * canvas.height;
          });
        }
        const progress = s.life / s.maxLife;
        const alpha = progress < 0.1 ? progress * 10 : progress > 0.9 ? (1 - progress) * 10 : 1;

        s.points.forEach(p => {
          p.x += p.vx + Math.sin(time + si) * 0.3;
          p.y += p.vy + parallax * 0.001;
          if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
          if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        });

        ctx.beginPath();
        ctx.moveTo(s.points[0].x, s.points[0].y);
        for (let i = 1; i < s.points.length - 2; i++) {
          const mx = (s.points[i].x + s.points[i + 1].x) / 2;
          const my = (s.points[i].y + s.points[i + 1].y) / 2;
          ctx.quadraticCurveTo(s.points[i].x, s.points[i].y, mx, my);
        }
        ctx.strokeStyle = `${s.color}${Math.floor(s.opacity * alpha * 255).toString(16).padStart(2, '0')}`;
        ctx.lineWidth = s.width;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();
      });

      // Color mixing blobs
      for (let i = 0; i < 5; i++) {
        const bx = canvas.width * 0.2 + i * canvas.width * 0.15 + Math.sin(time * 0.3 + i) * 50;
        const by = canvas.height * 0.5 + Math.cos(time * 0.2 + i) * 100 + scrollY * 0.1;
        const br = 80 + Math.sin(time + i) * 30;
        const grad = ctx.createRadialGradient(bx, by, 0, bx, by, br);
        const colors = ['#ff6b35', '#e63946', '#c77dff', '#ffb703', '#219ebc'];
        grad.addColorStop(0, `${colors[i]}15`);
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(bx, by, br, 0, Math.PI * 2);
        ctx.fill();
      }

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [scrollY]);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }}
    />
  );
};

export default ArtBackground;
