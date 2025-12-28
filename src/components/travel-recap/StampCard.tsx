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
  
  // Get first image from images array
  const firstImage = destination.images?.[0] || null;
  const imageCount = destination.images?.length || 0;

  return (
    <div 
      className={`relative ${sizeClasses[size]} ${isActive ? 'scale-105' : ''} transition-transform duration-300`}
    >
      {/* Card container */}
      <div className="absolute inset-0 bg-[#233038] rounded-xl border border-[#075056] overflow-hidden">
        {/* Inner content */}
        <div className="flex flex-col h-full">
          {/* Image area */}
          <div className="flex-1 relative bg-[#0B0101]">
            {firstImage ? (
              <>
                <img
                  src={firstImage}
                  alt={getDestinationDisplayName(destination)}
                  className="w-full h-full object-cover"
                />
                {/* Image count badge if multiple images */}
                {imageCount > 1 && (
                  <div className="absolute top-1 right-1 bg-[#FF5B04] w-5 h-5 rounded-full flex items-center justify-center">
                    <span className="text-[8px] font-bold text-white">{imageCount}</span>
                  </div>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-[#075056]">
                <img 
                  src={destination.type === 'city' ? '/images/city-skyline.webp' : '/images/total-destinations.webp'} 
                  alt={destination.type === 'city' ? 'City' : 'Globe'} 
                  className="w-12 h-12 object-contain"
                />
              </div>
            )}

            {/* Visit order badge */}
            <div className="absolute bottom-1 left-1 bg-[#FF5B04] px-2 py-0.5 rounded-full">
              <span className="text-[8px] font-bold text-white">#{destination.visitOrder}</span>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-[#233038] px-2 py-2 border-t border-[#075056]">
            <p className={`font-bold text-[#FDF6E3] ${fontSizes[size]} truncate`}>
              {displayName}
            </p>
            {subText && size !== 'sm' && (
              <p className={`text-[#D3DBDD] ${size === 'lg' ? 'text-xs' : 'text-[6px]'} truncate`}>
                {subText}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
