import React from 'react';

interface MoonOrbitDiagramProps {
  angle: number;
  isVisible: boolean;
  isHintActive: boolean;
  className?: string;
}

export const MoonOrbitDiagram: React.FC<MoonOrbitDiagramProps> = ({
  angle,
  isVisible,
  isHintActive,
  className = ''
}) => {
  return (
    <div
      className={`relative w-full h-32 sm:h-46 md:h-56 flex items-center justify-between px-2.5 sm:px-5 md:px-8 py-2 sm:py-3 rounded-xl sm:rounded-2xl transition-all ${
        isHintActive
          ? 'neon-active bg-zinc-900/95 border-2 border-yellow-400/70 shadow-[0_0_20px_rgba(250,204,21,0.35)]'
          : 'bg-black/65 border-2 border-zinc-800'
      } ${className}`}
    >
      {/* 1. Orbit Zone (Earth at center, Moon on orbit) with ample internal padding */}
      <div className="relative w-26 h-26 sm:w-38 sm:h-38 md:w-44 md:h-44 shrink-0 rounded-full border-2 border-dashed border-zinc-600 flex items-center justify-center bg-zinc-950/85 shadow-inner">
        {/* Earth at center */}
        <div className="relative z-10 w-9 h-9 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/40 border-2 border-blue-300/70 bg-gradient-to-tr from-blue-700 via-sky-600 to-emerald-500">
          <span className="text-xs sm:text-sm md:text-base font-black text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
            지구
          </span>
        </div>

        {/* Moon on Orbit Ring */}
        {isVisible ? (
          <div
            className="absolute inset-0 transition-transform duration-500 ease-out pointer-events-none"
            style={{ transform: `rotate(${angle}deg)` }}
          >
            {/* Moon marker pinned on the right edge of orbit circle */}
            <div className="absolute top-1/2 -right-3.5 sm:-right-4.5 md:-right-5 -translate-y-1/2 flex items-center justify-center">
              <div className="relative w-6.5 h-6.5 sm:w-8.5 sm:h-8.5 md:w-10 md:h-10 rounded-full bg-zinc-200 border-2 border-yellow-300 shadow-[0_0_10px_rgba(253,224,71,0.95)] flex items-center justify-center overflow-hidden">
                <div
                  className="w-full h-full flex items-center justify-center transition-transform duration-500"
                  style={{ transform: `rotate(${-angle}deg)` }}
                >
                  <span className="text-[10px] sm:text-xs md:text-sm font-black text-zinc-950">달</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="absolute text-xl sm:text-2xl md:text-3xl text-zinc-600 font-black select-none">
            ?
          </div>
        )}
      </div>

      {/* 2. Sunlight Ray Stream in central buffer channel */}
      <div className="flex-1 flex flex-col items-center justify-center px-1.5 sm:px-3 md:px-4 select-none">
        <span className="text-xs sm:text-sm md:text-base text-amber-300 font-black mb-1 sm:mb-1.5 tracking-wider drop-shadow-[0_0_5px_rgba(251,191,36,0.7)]">
          햇빛
        </span>
        {/* Directional beam arrows pointing left towards Earth & Moon */}
        <div className="flex items-center text-amber-400 text-sm sm:text-base md:text-xl font-black tracking-wider sm:tracking-widest animate-pulse drop-shadow-[0_0_8px_rgba(251,191,36,0.95)]">
          <span>◀</span>
          <span>◀</span>
          <span>◀</span>
        </div>
      </div>

      {/* 3. Sun Geometric Shape (도형 태양) */}
      <div className="relative shrink-0 flex items-center justify-center pr-0.5 sm:pr-1 select-none">
        {/* Geometric Ray Flare Layer (SVG Corona Rays) */}
        <div className="relative w-14 h-14 sm:w-18 sm:h-18 md:w-22 md:h-22 flex items-center justify-center">
          <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full animate-[spin_24s_linear_infinite] opacity-85">
            <polygon points="50,0 60,35 95,15 75,45 100,50 75,55 95,85 60,65 50,100 40,65 5,85 25,55 0,50 25,45 5,15 40,35" fill="#f59e0b" opacity="0.45" />
            <polygon points="50,5 57,37 90,20 73,47 95,50 73,53 90,80 57,63 50,95 43,63 10,80 27,53 5,50 27,47 10,20 43,37" fill="#fbbf24" opacity="0.35" />
          </svg>

          {/* Central Sun Disc */}
          <div className="relative z-10 w-9.5 h-9.5 sm:w-13 sm:h-13 md:w-16 md:h-16 rounded-full bg-gradient-to-tr from-amber-600 via-orange-500 to-yellow-300 border-2 border-yellow-200 shadow-[0_0_16px_#f59e0b,inset_0_0_8px_rgba(255,255,255,0.8)] flex items-center justify-center">
            <span className="text-xs sm:text-sm md:text-base font-black text-zinc-950 tracking-tighter">
              태양
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
