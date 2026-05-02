import React, { useEffect, useRef } from 'react';

const PhotographyBackground: React.FC<{ scrollY: number }> = ({ scrollY }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const particlesRef = useRef<any[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Create bokeh particles (camera lens blur circles)
    particlesRef.current = Array.from({ length: 80 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 40 + 5,
      opacity: Math.random() * 0.3 + 0.05,
      speed: Math.random() * 0.5 + 0.1,
      color: ['#00d4ff', '#7b2fff', '#ff6b9d', '#00ff88'][Math.floor(Math.random() * 4)],
      phase: Math.random() * Math.PI * 2
    }));

    // Buildings
    const buildings = Array.from({ length: 20 }, (_, i) => ({
      x: (i / 20) * window.innerWidth * 1.2 - window.innerWidth * 0.1,
      width: 40 + Math.random() * 80,
      height: 100 + Math.random() * 300,
      windows: Array.from({ length: Math.floor(Math.random() * 15 + 5) }, () => ({
        lit: Math.random() > 0.4,
        x: Math.random(),
        y: Math.random()
      }))
    }));

    let time = 0;

    const draw = () => {
      time += 0.01;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const depth = Math.min(scrollY / 2000, 1);

      // Sky gradient - deeper as you scroll
      const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      skyGrad.addColorStop(0, `hsl(${220 + depth * 20}, 70%, ${5 - depth * 3}%)`);
      skyGrad.addColorStop(1, `hsl(${240 + depth * 30}, 80%, ${8 - depth * 4}%)`);
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Stars
      for (let i = 0; i < 150; i++) {
        const x = ((i * 137.508 + time * 0.5) % canvas.width);
        const y = (i * 73.2) % (canvas.height * 0.7);
        const twinkle = Math.sin(time * 2 + i) * 0.5 + 0.5;
        ctx.beginPath();
        ctx.arc(x, y, 0.5 + twinkle, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200, 220, 255, ${0.3 + twinkle * 0.5})`;
        ctx.fill();
      }

      // City buildings (parallax based on scroll)
      const parallax = scrollY * 0.1;
      buildings.forEach(b => {
        const bx = b.x - parallax * 0.3;
        const ground = canvas.height;
        const top = ground - b.height - 50;

        // Building silhouette
        const buildGrad = ctx.createLinearGradient(bx, top, bx, ground);
        buildGrad.addColorStop(0, `rgba(15, 20, 40, 0.95)`);
        buildGrad.addColorStop(1, `rgba(5, 8, 20, 1)`);
        ctx.fillStyle = buildGrad;
        ctx.fillRect(bx, top, b.width, b.height + 50);

        // Windows
        b.windows.forEach((w, wi) => {
          if (w.lit) {
            const wx = bx + w.x * (b.width - 10) + 2;
            const wy = top + w.y * (b.height - 20) + 10;
            const flicker = Math.sin(time * 3 + wi) > 0.95;
            ctx.fillStyle = flicker ? 'rgba(255, 200, 80, 0.1)' : 'rgba(255, 200, 80, 0.6)';
            ctx.fillRect(wx, wy, 6, 8);
          }
        });
      });

      // Ground reflection
      const groundGrad = ctx.createLinearGradient(0, canvas.height - 80, 0, canvas.height);
      groundGrad.addColorStop(0, 'rgba(0, 212, 255, 0.1)');
      groundGrad.addColorStop(1, 'rgba(0, 0, 0, 0.8)');
      ctx.fillStyle = groundGrad;
      ctx.fillRect(0, canvas.height - 80, canvas.width, 80);

      // Bokeh circles
      particlesRef.current.forEach(p => {
        p.y -= p.speed;
        if (p.y < -p.r * 2) p.y = canvas.height + p.r;
        const wobble = Math.sin(time * 0.5 + p.phase) * 20;

        const grad = ctx.createRadialGradient(p.x + wobble, p.y, 0, p.x + wobble, p.y, p.r);
        grad.addColorStop(0, `${p.color}${Math.floor(p.opacity * 255).toString(16).padStart(2, '0')}`);
        grad.addColorStop(0.5, `${p.color}${Math.floor(p.opacity * 0.5 * 255).toString(16).padStart(2, '0')}`);
        grad.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(p.x + wobble, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        // Bokeh ring
        ctx.beginPath();
        ctx.arc(p.x + wobble, p.y, p.r, 0, Math.PI * 2);
        ctx.strokeStyle = `${p.color}20`;
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // Camera shutter overlay effect
      if (Math.sin(time * 0.3) > 0.98) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // Lens flare
      const flareX = canvas.width * 0.7;
      const flareGrad = ctx.createRadialGradient(flareX, 100, 0, flareX, 100, 200);
      flareGrad.addColorStop(0, 'rgba(0, 212, 255, 0.15)');
      flareGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = flareGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height * 0.5);

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0, left: 0,
        width: '100%', height: '100%',
        zIndex: 0,
        pointerEvents: 'none'
      }}
    />
  );
};

export default PhotographyBackground;
