import { useEffect, useRef } from "react";

const PARTICLE_COUNT = 60;
const MAX_DIST = 200;
const CORAL = "#F05A78";
const MINT = "#7EDDB8";

export default function ConstellationCanvasAH() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animId;

    const resize = () => {
      const parent = canvas.parentElement;
      canvas.width = parent ? parent.offsetWidth : window.innerWidth;
      canvas.height = parent ? parent.offsetHeight : window.innerHeight;
    };
    resize();

    const ro = new ResizeObserver(resize);
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      r: Math.random() * 3 + 2,
      color: Math.random() > 0.5 ? CORAL : MINT,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
      });

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MAX_DIST) {
            const alpha = (1 - dist / MAX_DIST) * 0.18;
            // line colour blends between the two particle colours
            const col = particles[i].color === particles[j].color
              ? particles[i].color
              : CORAL;
            ctx.strokeStyle = col.replace(")", `,${alpha})`).replace("rgb", "rgba").replace("#F05A78", `rgba(240,90,120,${alpha})`).replace("#7EDDB8", `rgba(126,221,184,${alpha})`);

            // simpler: just pick one colour with alpha
            const r = particles[i].color === CORAL ? "240,90,120" : "126,221,184";
            ctx.strokeStyle = `rgba(${r},${alpha})`;
            ctx.lineWidth = 0.9;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      particles.forEach((p) => {
        const isCoral = p.color === CORAL;
        ctx.fillStyle = isCoral
          ? `rgba(240,90,120,0.7)`
          : `rgba(126,221,184,0.7)`;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
}
