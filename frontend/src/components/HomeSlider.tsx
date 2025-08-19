import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

// Simple, dependency-free slider with autoplay and dots
// Images are served from public/slider
const slides = [
  { id: 0, imageUrl: '/slider/auraglow.jpg' },
  { id: 1, imageUrl: '/slider/slide-2.jpg' },
  { id: 2, imageUrl: '/slider/slide-tv.jpg' },
  { id: 3, imageUrl: '/slider/slide-headphones.jpg' },
];

const AUTOPLAY_MS = 5000;

const HomeSlider: React.FC = () => {
  const [current, setCurrent] = useState(0);
  const [avgColors, setAvgColors] = useState<string[]>(Array(slides.length).fill('transparent'));

  useEffect(() => {
    const id = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, AUTOPLAY_MS);
    return () => clearInterval(id);
  }, []);

  // Compute average color for each slide image once
  useEffect(() => {
    const computeAverageColor = (url: string): Promise<string> => {
      return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = url;
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) return resolve('transparent');
            // sample downscaling for performance
            const w = 64, h = 64;
            canvas.width = w;
            canvas.height = h;
            // Draw with contain-like behavior to preserve aspect
            const ratio = Math.min(w / img.width, h / img.height);
            const dw = Math.round(img.width * ratio);
            const dh = Math.round(img.height * ratio);
            const dx = Math.round((w - dw) / 2);
            const dy = Math.round((h - dh) / 2);
            ctx.drawImage(img, dx, dy, dw, dh);
            const data = ctx.getImageData(0, 0, w, h).data;
            let r = 0, g = 0, b = 0, count = 0;
            for (let i = 0; i < data.length; i += 4) {
              const alpha = data[i + 3];
              if (alpha > 0) {
                r += data[i];
                g += data[i + 1];
                b += data[i + 2];
                count++;
              }
            }
            if (count === 0) return resolve('transparent');
            r = Math.round(r / count);
            g = Math.round(g / count);
            b = Math.round(b / count);
            resolve(`rgb(${r}, ${g}, ${b})`);
          } catch {
            resolve('transparent');
          }
        };
        img.onerror = () => resolve('transparent');
      });
    };

    let cancelled = false;
    (async () => {
      const colors: string[] = [];
      for (const s of slides) {
        const color = await computeAverageColor(s.imageUrl);
        colors.push(color);
      }
      if (!cancelled) setAvgColors(colors);
    })();

    return () => { cancelled = true; };
  }, []);

  return (
    <div className="relative w-full overflow-hidden select-none">
      <div className="relative h-[240px] md:h-[320px] lg:h-[400px]">
        {slides.map((s, idx) => (
          <div
            key={s.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-out ${
              idx === current ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              backgroundImage: `url(${s.imageUrl})`,
              backgroundSize: 'contain',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              backgroundColor: avgColors[idx] || 'transparent',
              transition: 'background-color 300ms ease'
            }}
          >
            <div className="container-modern h-full flex items-center justify-center text-center px-4 bg-black/10">
              {/* <div>
                <h2 className="text-3xl md:text-5xl font-black text-white drop-shadow-sm mb-3">
                  {s.title}
                </h2>
                <p className="text-base md:text-xl text-white/90 mb-6 font-medium">
                  {s.subtitle}
                </p>
                <Link to={s.ctaLink} className="btn-secondary text-base md:text-lg px-6 md:px-8 py-2.5 md:py-3">
                  {s.ctaText}
                </Link>
              </div> */}
            </div>
          </div>
        ))}
      </div>

      {/* Dots */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
        {slides.map((_, idx) => (
          <button
            key={idx}
            aria-label={`Go to slide ${idx + 1}`}
            onClick={() => setCurrent(idx)}
            className={`h-2.5 rounded-full transition-all duration-300 ${
              current === idx ? 'w-8 bg-white' : 'w-3 bg-white/60 hover:bg-white/80'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default HomeSlider;