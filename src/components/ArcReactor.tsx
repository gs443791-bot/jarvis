import React from 'react';
import { playJarvisBeep } from '../utils/audio';

interface ArcReactorProps {
  size?: number;
  isSpeaking?: boolean;
  isListening?: boolean;
  energyPercent?: number;
  onClick?: () => void;
  title?: string;
}

export const ArcReactor: React.FC<ArcReactorProps> = ({
  size = 180,
  isSpeaking = false,
  isListening = false,
  energyPercent = 100,
  onClick,
  title = 'Reator Arc J.A.R.V.I.S.'
}) => {
  const handleClick = () => {
    playJarvisBeep(1200, 0.05);
    if (onClick) onClick();
  };

  // Color scheme: cyan by default, pulses gold when speaking, pulses green/blue when listening
  const mainColor = isListening ? '#10b981' : isSpeaking ? '#38bdf8' : '#06b6d4';
  const glowColor = isListening ? 'rgba(16, 185, 129, 0.5)' : isSpeaking ? 'rgba(56, 189, 248, 0.6)' : 'rgba(6, 182, 212, 0.45)';

  return (
    <div
      onClick={handleClick}
      title={title}
      className="relative flex items-center justify-center cursor-pointer select-none group"
      style={{ width: size, height: size }}
    >
      {/* Outer ambient glow */}
      <div
        className="absolute inset-0 rounded-full transition-all duration-700 pointer-events-none"
        style={{
          boxShadow: `0 0 ${isSpeaking ? '45px' : '25px'} ${glowColor}`,
          filter: 'blur(8px)',
          opacity: isSpeaking ? 0.9 : 0.6
        }}
      />

      {/* SVG Arc Reactor Structure */}
      <svg
        viewBox="0 0 200 200"
        className="w-full h-full relative z-10"
        style={{ filter: `drop-shadow(0 0 10px ${mainColor})` }}
      >
        {/* Outer Static Rim */}
        <circle
          cx="100"
          cy="100"
          r="92"
          fill="none"
          stroke="#0f2942"
          strokeWidth="4"
        />
        <circle
          cx="100"
          cy="100"
          r="92"
          fill="none"
          stroke={mainColor}
          strokeWidth="1.5"
          strokeDasharray="4 8"
          opacity="0.8"
        />

        {/* Outer Rotating Segmented Ring */}
        <g className="animate-spin-slow origin-center">
          {[0, 36, 72, 108, 144, 180, 216, 252, 288, 324].map((angle, idx) => (
            <rect
              key={idx}
              x="96"
              y="12"
              width="8"
              height="14"
              rx="2"
              fill={idx % 2 === 0 ? mainColor : '#0284c7'}
              opacity={isSpeaking ? '1' : '0.75'}
              transform={`rotate(${angle} 100 100)`}
            />
          ))}
          <circle
            cx="100"
            cy="100"
            r="82"
            fill="none"
            stroke={mainColor}
            strokeWidth="1.5"
            strokeDasharray="12 4"
            opacity="0.6"
          />
        </g>

        {/* Counter-rotating Inner Ring */}
        <g className="animate-spin-reverse-slow origin-center">
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, idx) => (
            <line
              key={idx}
              x1="100"
              y1="34"
              x2="100"
              y2="46"
              stroke={mainColor}
              strokeWidth="2.5"
              strokeLinecap="round"
              opacity="0.9"
              transform={`rotate(${angle} 100 100)`}
            />
          ))}
          <circle
            cx="100"
            cy="100"
            r="65"
            fill="none"
            stroke="#0369a1"
            strokeWidth="3"
            strokeDasharray="6 3"
          />
        </g>

        {/* Middle Triangular Core Frame */}
        <g className={isSpeaking ? 'animate-pulse origin-center' : ''}>
          {[0, 120, 240].map((angle, idx) => (
            <polygon
              key={idx}
              points="100,50 110,68 90,68"
              fill={mainColor}
              opacity="0.8"
              transform={`rotate(${angle} 100 100)`}
            />
          ))}
        </g>

        {/* Inner Glass Chamber */}
        <circle
          cx="100"
          cy="100"
          r="45"
          fill="#031526"
          stroke={mainColor}
          strokeWidth="2"
        />

        {/* Central Core Glow & Rings */}
        <circle
          cx="100"
          cy="100"
          r="34"
          fill="none"
          stroke={mainColor}
          strokeWidth="1"
          strokeDasharray="3 3"
          opacity="0.7"
        />

        {/* Central Pure White-Cyan Nucleus */}
        <circle
          cx="100"
          cy="100"
          r={isSpeaking ? 22 : 18}
          fill="url(#coreGradient)"
          className="transition-all duration-300"
        />

        {/* Defs for rich gradients */}
        <defs>
          <radialGradient id="coreGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="35%" stopColor="#67e8f9" stopOpacity="0.95" />
            <stop offset="70%" stopColor={mainColor} stopOpacity="0.8" />
            <stop offset="100%" stopColor="#082f49" stopOpacity="0.9" />
          </radialGradient>
        </defs>
      </svg>

      {/* Center status text or audio waves */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-20">
        {isSpeaking ? (
          <div className="flex items-center gap-0.5">
            <span className="w-1 h-3 bg-cyan-200 animate-pulse rounded-full" />
            <span className="w-1 h-5 bg-white animate-pulse rounded-full" />
            <span className="w-1 h-4 bg-cyan-200 animate-pulse rounded-full" />
          </div>
        ) : isListening ? (
          <div className="text-[10px] font-hud text-emerald-400 font-bold tracking-widest animate-pulse">
            OUVINDO
          </div>
        ) : (
          <div className="text-[10px] font-hud text-cyan-300 font-bold tracking-wider opacity-90 group-hover:opacity-100">
            {energyPercent}%
          </div>
        )}
      </div>
    </div>
  );
};
