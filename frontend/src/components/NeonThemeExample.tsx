import React from 'react';

const NeonThemeExample: React.FC = () => {
  return (
    <div className="bg-neon-dark min-h-screen p-8">
      <div className="container-modern">
        {/* Header with neon glow */}
        <h1 className="text-4xl font-bold text-glow-primary mb-8 text-center animate-neon-glow">
          Neon Tech Fusion
        </h1>
        
        {/* Subtitle */}
        <p className="text-neon-light text-center mb-12 text-lg">
          Experience the future with our neon-themed interface
        </p>
        
        {/* Button Examples */}
        <div className="flex flex-wrap gap-4 justify-center mb-12">
          <button className="btn-neon-primary animate-neon-pulse">
            Primary Neon Button
          </button>
          <button className="btn-neon-secondary">
            Secondary Neon Button
          </button>
          <button className="btn-neon-accent">
            Accent Neon Button
          </button>
        </div>
        
        {/* Card Examples */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="card bg-neon-dark border-neon-primary border-2 glow-neon-primary p-6">
            <h3 className="text-neon-primary text-xl font-semibold mb-3">Neon Card 1</h3>
            <p className="text-neon-light">This card uses neon primary colors with a glowing border effect.</p>
          </div>
          
          <div className="card bg-neon-dark border-neon-secondary border-2 glow-neon-secondary p-6 animate-neon-flicker">
            <h3 className="text-neon-secondary text-xl font-semibold mb-3">Neon Card 2</h3>
            <p className="text-neon-light">This card has a flickering animation effect.</p>
          </div>
          
          <div className="card bg-neon-dark border-neon-accent border-2 glow-neon-accent p-6">
            <h3 className="text-neon-accent text-xl font-semibold mb-3">Neon Card 3</h3>
            <p className="text-neon-light">This card uses the accent neon color scheme.</p>
          </div>
        </div>
        
        {/* Gradient Examples */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="gradient-neon-primary p-6 rounded-lg text-black">
            <h3 className="text-xl font-semibold mb-3">Primary Gradient</h3>
            <p>This uses the primary neon gradient background.</p>
          </div>
          
          <div className="gradient-neon-full p-6 rounded-lg text-black">
            <h3 className="text-xl font-semibold mb-3">Full Neon Gradient</h3>
            <p>This uses all neon colors in a gradient.</p>
          </div>
        </div>
        
        {/* Animated Border Example */}
        <div className="border-4 animate-neon-border p-8 rounded-lg bg-neon-dark text-center">
          <h3 className="text-neon-light text-2xl font-semibold mb-4">Animated Neon Border</h3>
          <p className="text-neon-light">This container has an animated border that cycles through all neon colors.</p>
        </div>
      </div>
    </div>
  );
};

export default NeonThemeExample;