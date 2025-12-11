import { useMemo } from "react";
import { TravelDestination, getDestinationDisplayName } from "./types";

interface StampCardProps {
  destination: TravelDestination;
  isActive?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function StampCard({ destination, isActive = false, size = 'md' }: StampCardProps) {
  const sizeClasses = {
    sm: 'w-24 h-28',
    md: 'w-36 h-44',
    lg: 'w-48 h-56'
  };

  const fontSizes = {
    sm: 'text-[8px]',
    md: 'text-xs',
    lg: 'text-sm'
  };

  const displayName = destination.type === 'city' ? destination.name : destination.name;
  const subText = destination.type === 'city' ? destination.country : null;

  // Generate stable rotation based on destination id to avoid re-render jitter
  const rotation = useMemo(() => {
    const hash = destination.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return (hash % 6) - 3;
  }, [destination.id]);

  return (
    <div 
      className={`relative ${sizeClasses[size]} ${isActive ? 'animate-pulse' : ''}`}
      style={{
        transform: isActive ? 'rotate(-3deg)' : `rotate(${rotation}deg)`,
      }}
    >
      {/* Stamp outer border with perforations */}
      <div className="absolute inset-0 bg-white rounded-sm shadow-lg">
        {/* Perforation effect */}
        <div 
          className="absolute inset-0 rounded-sm"
          style={{
            background: 'white',
            clipPath: `polygon(
              0% 4%, 2% 4%, 2% 0%, 6% 0%, 6% 4%, 10% 4%, 10% 0%, 14% 0%, 14% 4%, 18% 4%, 18% 0%, 22% 0%, 22% 4%, 26% 4%, 26% 0%, 30% 0%, 30% 4%, 34% 4%, 34% 0%, 38% 0%, 38% 4%, 42% 4%, 42% 0%, 46% 0%, 46% 4%, 50% 4%, 50% 0%, 54% 0%, 54% 4%, 58% 4%, 58% 0%, 62% 0%, 62% 4%, 66% 4%, 66% 0%, 70% 0%, 70% 4%, 74% 4%, 74% 0%, 78% 0%, 78% 4%, 82% 4%, 82% 0%, 86% 0%, 86% 4%, 90% 4%, 90% 0%, 94% 0%, 94% 4%, 98% 4%, 98% 0%, 100% 0%,
              100% 4%, 96% 4%, 96% 8%, 100% 8%, 100% 12%, 96% 12%, 96% 16%, 100% 16%, 100% 20%, 96% 20%, 96% 24%, 100% 24%, 100% 28%, 96% 28%, 96% 32%, 100% 32%, 100% 36%, 96% 36%, 96% 40%, 100% 40%, 100% 44%, 96% 44%, 96% 48%, 100% 48%, 100% 52%, 96% 52%, 96% 56%, 100% 56%, 100% 60%, 96% 60%, 96% 64%, 100% 64%, 100% 68%, 96% 68%, 96% 72%, 100% 72%, 100% 76%, 96% 76%, 96% 80%, 100% 80%, 100% 84%, 96% 84%, 96% 88%, 100% 88%, 100% 92%, 96% 92%, 96% 96%, 100% 96%, 100% 100%,
              98% 100%, 98% 96%, 94% 96%, 94% 100%, 90% 100%, 90% 96%, 86% 96%, 86% 100%, 82% 100%, 82% 96%, 78% 96%, 78% 100%, 74% 100%, 74% 96%, 70% 96%, 70% 100%, 66% 100%, 66% 96%, 62% 96%, 62% 100%, 58% 100%, 58% 96%, 54% 96%, 54% 100%, 50% 100%, 50% 96%, 46% 96%, 46% 100%, 42% 100%, 42% 96%, 38% 96%, 38% 100%, 34% 100%, 34% 96%, 30% 96%, 30% 100%, 26% 100%, 26% 96%, 22% 96%, 22% 100%, 18% 100%, 18% 96%, 14% 96%, 14% 100%, 10% 100%, 10% 96%, 6% 96%, 6% 100%, 2% 100%, 2% 96%, 0% 96%, 0% 100%,
              0% 96%, 4% 96%, 4% 92%, 0% 92%, 0% 88%, 4% 88%, 4% 84%, 0% 84%, 0% 80%, 4% 80%, 4% 76%, 0% 76%, 0% 72%, 4% 72%, 4% 68%, 0% 68%, 0% 64%, 4% 64%, 4% 60%, 0% 60%, 0% 56%, 4% 56%, 4% 52%, 0% 52%, 0% 48%, 4% 48%, 4% 44%, 0% 44%, 0% 40%, 4% 40%, 4% 36%, 0% 36%, 0% 32%, 4% 32%, 4% 28%, 0% 28%, 0% 24%, 4% 24%, 4% 20%, 0% 20%, 0% 16%, 4% 16%, 4% 12%, 0% 12%, 0% 8%, 4% 8%, 4% 4%, 0% 4%
            )`
          }}
        />
      </div>

      {/* Inner content */}
      <div className="absolute inset-[8%] flex flex-col overflow-hidden rounded-sm">
        {/* Header */}
        <div className="bg-blue-600 text-white px-2 py-1 text-center">
          <span className={`font-bold uppercase tracking-wider ${fontSizes[size]} truncate block`}>
            {displayName}
          </span>
          {subText && size !== 'sm' && (
            <span className={`text-white/70 ${size === 'lg' ? 'text-xs' : 'text-[6px]'} truncate block`}>
              {subText}
            </span>
          )}
        </div>

        {/* Image area */}
        <div className="flex-1 relative bg-slate-100">
          {destination.image ? (
            <img
              src={destination.image}
              alt={getDestinationDisplayName(destination)}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-200 to-slate-300">
              <span className="text-slate-400 text-2xl">{destination.type === 'city' ? '🏙️' : '🌍'}</span>
            </div>
          )}

          {/* Postmark overlay */}
          <div className="absolute top-1 right-1 w-8 h-8 opacity-60">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <circle cx="50" cy="50" r="45" fill="none" stroke="#333" strokeWidth="3" />
              <circle cx="50" cy="50" r="35" fill="none" stroke="#333" strokeWidth="2" />
              <text x="50" y="45" textAnchor="middle" fontSize="12" fill="#333" fontWeight="bold">2025</text>
              <text x="50" y="60" textAnchor="middle" fontSize="8" fill="#333">VISITED</text>
            </svg>
          </div>

          {/* Approved stamp */}
          <div 
            className="absolute bottom-1 left-1 px-1 py-0.5 bg-green-600 text-white transform -rotate-12"
            style={{ fontSize: '6px' }}
          >
            APPROVED
          </div>
        </div>

        {/* Visit order */}
        <div className="bg-white px-2 py-1 flex items-center justify-between border-t border-slate-200">
          <span className={`text-slate-500 ${fontSizes[size]}`}>x{destination.visitOrder}</span>
          <span className={`text-slate-700 font-medium ${fontSizes[size]} truncate max-w-[60%]`}>{displayName}</span>
        </div>
      </div>
    </div>
  );
}
