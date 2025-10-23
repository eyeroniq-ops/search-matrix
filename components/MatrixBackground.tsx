import React, { useRef, useEffect } from 'react';

const MatrixBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = canvas.width = window.innerWidth;
    let h = canvas.height = window.innerHeight;

    const handleResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      // Reset drops on resize
      drops = [];
      for (let i = 0; i < columns; i++) {
        drops[i] = 1;
      }
    };
    window.addEventListener('resize', handleResize);

    const columns = Math.floor(w / 20);
    let drops: number[] = [];
    for (let i = 0; i < columns; i++) {
      drops[i] = 1;
    }

    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.04)';
      ctx.fillRect(0, 0, w, h);
      
      const fontSize = 20;
      ctx.font = `${fontSize}px VT323, monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = characters.charAt(Math.floor(Math.random() * characters.length));
        
        const y = drops[i] * fontSize;

        if (y > h && Math.random() > 0.975) {
          drops[i] = 0;
        }

        // Add a glow effect
        if (Math.random() > 0.95) { // Head of the rain drop
             ctx.fillStyle = '#E4007C';
             ctx.shadowColor = '#E4007C'; 
             ctx.shadowBlur = 15;
        } else {
             ctx.fillStyle = '#E4007C';
             ctx.shadowColor = 'transparent';
             ctx.shadowBlur = 0;
        }

        ctx.fillText(text, i * fontSize, y);
        drops[i]++;
      }
    };

    const intervalId = setInterval(draw, 33);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full -z-10" />;
};

export default MatrixBackground;