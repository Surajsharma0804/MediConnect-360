import React, { useEffect, useRef } from 'react';
import { useTheme } from '../../context/ThemeContext';

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  speed: number;
}

const StarfieldBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme, prefersReducedMotion } = useTheme();
  const starsRef = useRef<Star[]>([]);
  const animationFrameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initStars();
    };

    const initStars = () => {
      const starCount = Math.min(window.innerWidth, window.innerHeight) / 3;
      starsRef.current = Array.from({ length: starCount }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.8 + 0.2,
        speed: Math.random() * 0.05 + 0.01,
      }));
    };

    const drawStars = () => {
      if (!ctx || !canvas) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Set background gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      
      if (theme === 'dark') {
        gradient.addColorStop(0, 'rgba(10, 10, 40, 1)');
        gradient.addColorStop(1, 'rgba(30, 20, 60, 1)');
      } else {
        gradient.addColorStop(0, 'rgba(224, 231, 255, 1)');
        gradient.addColorStop(1, 'rgba(214, 211, 255, 1)');
      }
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw stars
      starsRef.current.forEach((star) => {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        
        if (theme === 'dark') {
          ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
        } else {
          ctx.fillStyle = `rgba(89, 65, 169, ${star.opacity})`;
        }
        
        ctx.fill();
        
        // Only animate if reduced motion is not preferred
        if (!prefersReducedMotion) {
          star.y += star.speed;
          
          // Reset stars that go off screen
          if (star.y > canvas.height) {
            star.y = 0;
            star.x = Math.random() * canvas.width;
          }
        }
      });
      
      // Add occasional shooting star
      if (!prefersReducedMotion && Math.random() < 0.005) {
        addShootingStar(ctx, canvas);
      }
      
      animationFrameRef.current = requestAnimationFrame(drawStars);
    };
    
    const addShootingStar = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
      const x = Math.random() * canvas.width;
      const y = Math.random() * (canvas.height / 3);
      const length = Math.random() * 50 + 50;
      const angle = Math.PI / 4;
      
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length);
      ctx.strokeStyle = theme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(89, 65, 169, 0.7)';
      ctx.lineWidth = 2;
      ctx.stroke();
    };

    resizeCanvas();
    drawStars();
    
    window.addEventListener('resize', resizeCanvas);
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [theme, prefersReducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full -z-10"
      style={{ pointerEvents: 'none' }}
    />
  );
};

export default StarfieldBackground;