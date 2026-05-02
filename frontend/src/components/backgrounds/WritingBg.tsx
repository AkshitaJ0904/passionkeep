import React, { useEffect, useRef } from 'react';

const WritingBackground: React.FC<{ scrollY: number }> = ({ scrollY }) => {
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

    const words = ['imagine', 'create', 'dream', 'write', 'story', 'chapter', 'ink', 'page', 'words', 'journey', 'narrative', 'truth'];
    const floatingWords = Array.from({ length: 20 }, () => ({
      word: words[Math.floor(Math.random() * words.length)],
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 20 + 10,
      opacity: Math.random() * 0.15 + 0.03,
      speed: Math.random() * 0.3 + 0.1,
      drift: (Math.random() - 0.5) * 0.5
    }));

    // Ink particles
    const inkDrops = Array.from({ length: 40 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 4 + 1,
      speed: Math.random() * 1 + 0.2,
      color: Math.random() > 0.5 ? '#58a6ff' : '#f0e68c'
    }));

    const bookShelves = [
      { y: 0.25, books: Array.from({ length: 30 }, () => ({ color: ['#1e3a5f', '#2d4a7a', '#3a5c8a', '#1a2d4f', '#0d1b2e', '#4a6fa5'][Math.floor(Math.random() * 6)], width: 15 + Math.random() * 20, height: 80 + Math.random() * 40 })) },
      { y: 0.5, books: Array.from({ length: 28 }, () => ({ color: ['#2d1515', '#4a2020', '#6b2d2d', '#1a1000', '#3d2b0d'][Math.floor(Math.random() * 5)], width: 12 + Math.random() * 25, height: 90 + Math.random() * 50 })) },
      { y: 0.75, books: Array.from({ length: 32 }, () => ({ color: ['#0a1a0a', '#1a2d0f', '#0d2020', '#1a1a00'][Math.floor(Math.random() * 4)], width: 14 + Math.random() * 22, height: 85 + Math.random() * 45 })) }
    ];

    const draw = () => {
      time += 0.01;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Library atmosphere
      const bg = ctx.createLinearGradient(0, 0, 0, canvas.height);
      bg.addColorStop(0, '#0d1117');
      bg.addColorStop(0.5, '#161b22');
      bg.addColorStop(1, '#090d12');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Bookshelves
      const parallax = scrollY * 0.08;
      bookShelves.forEach(shelf => {
        const shelfY = shelf.y * canvas.height - parallax;
        let xPos = 0;
        shelf.books.forEach(book => {
          const bookTop = shelfY - book.height;
          ctx.fillStyle = book.color;
          ctx.fillRect(xPos, bookTop, book.width - 1, book.height);
          // Book spine highlight
          ctx.fillStyle = 'rgba(255,255,255,0.05)';
          ctx.fillRect(xPos, bookTop, 2, book.height);
          xPos += book.width;
          if (xPos > canvas.width) xPos = 0;
        });
        // Shelf plank
        ctx.fillStyle = '#2d1b0a';
        ctx.fillRect(0, shelfY, canvas.width, 8);
        ctx.fillStyle = 'rgba(255,180,80,0.1)';
        ctx.fillRect(0, shelfY, canvas.width, 1);
      });

      // Warm desk lamp glow
      const lampX = canvas.width * 0.3;
      const lampY = canvas.height * 0.75;
      const lampGrad = ctx.createRadialGradient(lampX, lampY, 0, lampX, lampY, 350);
      lampGrad.addColorStop(0, 'rgba(255, 200, 80, 0.15)');
      lampGrad.addColorStop(0.5, 'rgba(255, 180, 50, 0.06)');
      lampGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = lampGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Floating words
      ctx.font = 'italic 16px "Playfair Display", serif';
      floatingWords.forEach(w => {
        w.y -= w.speed;
        w.x += w.drift;
        if (w.y < -30) { w.y = canvas.height + 30; w.x = Math.random() * canvas.width; }
        ctx.fillStyle = `rgba(88, 166, 255, ${w.opacity})`;
        ctx.font = `italic ${w.size}px "Playfair Display", serif`;
        ctx.fillText(w.word, w.x, w.y);
      });

      // Ink drops
      inkDrops.forEach(d => {
        d.y += d.speed;
        if (d.y > canvas.height) { d.y = -10; d.x = Math.random() * canvas.width; }
        const grad = ctx.createRadialGradient(d.x, d.y, 0, d.x, d.y, d.size);
        grad.addColorStop(0, d.color + '60');
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Typewriter text effect (scroll-based)
      const lineText = "Every word is a journey into the unknown...";
      const charsToShow = Math.min(Math.floor(scrollY / 30), lineText.length);
      ctx.fillStyle = 'rgba(240, 230, 140, 0.2)';
      ctx.font = '22px "Caveat", cursive';
      ctx.fillText(lineText.substring(0, charsToShow), canvas.width * 0.1, canvas.height * 0.9);

      // Dust particles
      for (let i = 0; i < 30; i++) {
        const dx = ((i * 137 + time * 20) % canvas.width);
        const dy = ((i * 97 + time * 15) % canvas.height);
        ctx.fillStyle = 'rgba(255, 220, 150, 0.1)';
        ctx.beginPath();
        ctx.arc(dx, dy, 1, 0, Math.PI * 2);
        ctx.fill();
      }

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => { cancelAnimationFrame(animRef.current); window.removeEventListener('resize', resize); };
  }, [scrollY]);

  return <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }} />;
};

export default WritingBackground;
