import React, { useEffect, useRef } from 'react';

const MusicBackground: React.FC<{ scrollY: number }> = ({ scrollY }) => {
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

    // Simulated frequency bars
    const BAR_COUNT = 60;
    const bars = Array.from({ length: BAR_COUNT }, (_, i) => ({
      freq: Math.random(),
      phase: (i / BAR_COUNT) * Math.PI * 2,
      speed: 1 + Math.random() * 3
    }));

    // Music notes floating
    const notes = ['♩', '♪', '♫', '♬', '𝄞', '𝄢'];
    const floatNotes = Array.from({ length: 25 }, () => ({
      note: notes[Math.floor(Math.random() * notes.length)],
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 30 + 15,
      opacity: Math.random() * 0.2 + 0.05,
      vx: (Math.random() - 0.5) * 0.5,
      vy: -(Math.random() * 0.8 + 0.2),
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.02
    }));

    const draw = () => {
      time += 0.02;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Dark green forest/garden bg
      const bg = ctx.createLinearGradient(0, 0, 0, canvas.height);
      bg.addColorStop(0, '#0a1a0a');
      bg.addColorStop(0.6, '#0d2b1a');
      bg.addColorStop(1, '#060f06');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Sound wave rings from center
      const cx = canvas.width * 0.5;
      const cy = canvas.height * 0.5;
      for (let ring = 0; ring < 8; ring++) {
        const progress = ((time * 0.5 + ring * 0.125) % 1);
        const r = progress * Math.min(canvas.width, canvas.height) * 0.7;
        const alpha = (1 - progress) * 0.15;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0, 255, 136, ${alpha})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Equalizer bars at bottom
      const parallax = scrollY * 0.05;
      const barW = canvas.width / BAR_COUNT;
      bars.forEach((b, i) => {
        const freq = (
          Math.sin(time * b.speed + b.phase) * 0.3 +
          Math.sin(time * b.speed * 0.7 + b.phase * 1.3) * 0.2 +
          Math.sin(time * 2 + i * 0.3) * 0.3 +
          0.5
        );
        const h = freq * (canvas.height * 0.4) * (1 + scrollY * 0.001);
        const x = i * barW;
        const y = canvas.height - h - 20;

        const grad = ctx.createLinearGradient(0, y, 0, canvas.height);
        grad.addColorStop(0, '#00ff88');
        grad.addColorStop(0.5, '#00cc66');
        grad.addColorStop(1, '#004422');
        ctx.fillStyle = grad;
        ctx.fillRect(x + 1, y, barW - 2, h);

        // Reflection
        ctx.fillStyle = `rgba(0, 255, 136, 0.05)`;
        ctx.fillRect(x + 1, canvas.height - 20, barW - 2, Math.min(freq * 40, 40));
      });

      // Music notes
      floatNotes.forEach(n => {
        n.x += n.vx;
        n.y += n.vy;
        n.rotation += n.rotSpeed;
        if (n.y < -50) { n.y = canvas.height + 50; n.x = Math.random() * canvas.width; }
        if (n.x < -20 || n.x > canvas.width + 20) n.vx *= -1;

        ctx.save();
        ctx.translate(n.x, n.y);
        ctx.rotate(n.rotation);
        ctx.fillStyle = `rgba(0, 255, 136, ${n.opacity})`;
        ctx.font = `${n.size}px serif`;
        ctx.fillText(n.note, 0, 0);
        ctx.restore();
      });

      // Vinyl record spin
      const recordX = canvas.width * 0.8;
      const recordY = canvas.height * 0.3;
      const recordR = 120;
      ctx.save();
      ctx.translate(recordX, recordY);
      ctx.rotate(time * 0.5);

      // Record body
      const recordGrad = ctx.createRadialGradient(0, 0, recordR * 0.1, 0, 0, recordR);
      recordGrad.addColorStop(0, '#1a2d1a');
      recordGrad.addColorStop(0.3, '#0a1a0a');
      recordGrad.addColorStop(0.31, '#00ff88');
      recordGrad.addColorStop(0.32, '#0a1a0a');
      recordGrad.addColorStop(1, '#050a05');
      ctx.fillStyle = recordGrad;
      ctx.beginPath();
      ctx.arc(0, 0, recordR, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(0, 255, 136, 0.1)';
      for (let r = 30; r < recordR; r += 8) {
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();

      // Glow around record
      const glowGrad = ctx.createRadialGradient(recordX, recordY, 0, recordX, recordY, recordR + 60);
      glowGrad.addColorStop(0, 'rgba(0, 255, 136, 0.1)');
      glowGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(recordX, recordY, recordR + 60, 0, Math.PI * 2);
      ctx.fill();

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => { cancelAnimationFrame(animRef.current); window.removeEventListener('resize', resize); };
  }, [scrollY]);

  return <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }} />;
};

export default MusicBackground;
