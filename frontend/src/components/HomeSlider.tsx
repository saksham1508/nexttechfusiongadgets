import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

// Simple, dependency-free slider with autoplay and dots
// Images are served from public/slider
const slides = [
  {
    id: 1,
    imageUrl: '/slider/slide-1.jpg',
    title: 'Solar inverter',
    subtitle: 'Off-grid / Hybrid inverter / Home energy storage system',
    ctaText: 'View More',
    ctaLink: '/products',
  },
  {
    id: 2,
    imageUrl: '/slider/slide-2.jpg',
    title: 'SOLAR INVERTER',
    subtitle: 'Off-grid inverter / Hybrid-inverter / Home energy storage system',
    ctaText: 'Explore',
    ctaLink: '/products',
  },
  {
    id: 3,
    imageUrl: '/slider/slide-3.jpg',
    title: 'SOLAR INVERTER FAMILY',
    subtitle: 'Multiple models to fit your needs',
    ctaText: 'Shop Now',
    ctaLink: '/products',
  },
];

const AUTOPLAY_MS = 5000;

const HomeSlider: React.FC = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, AUTOPLAY_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative w-full overflow-hidden select-none">
      <div className="relative h-[360px] md:h-[480px] lg:h-[560px]">
        {slides.map((s, idx) => (
          <div
            key={s.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-out ${
              idx === current ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              backgroundImage: `url(${s.imageUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
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