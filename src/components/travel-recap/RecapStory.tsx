import { useState, useEffect, useCallback, useRef } from "react";
import { TravelRecapData, TravelDestination, getDestinationDisplayName } from "./types";
import StampCard from "./StampCard";
import { ArrowLeft, Download, Plane, MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import html2canvas from "html2canvas";

interface RecapStoryProps {
  data: TravelRecapData;
  onBack: () => void;
  onRestart: () => void;
}

type StorySlide = 
  | { type: 'intro' }
  | { type: 'destination'; destination: TravelDestination }
  | { type: 'journey'; from: TravelDestination; to: TravelDestination }
  | { type: 'summary' };

export default function RecapStory({ data, onBack, onRestart }: RecapStoryProps) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [progress, setProgress] = useState(0);
  const slideRef = useRef<HTMLDivElement>(null);

  // Build slides array
  const slides: StorySlide[] = data.destinations.length > 0 
    ? [
        { type: 'intro' },
        ...data.destinations.flatMap((dest, i) => {
          const slideGroup: StorySlide[] = [{ type: 'destination', destination: dest }];
          if (i < data.destinations.length - 1) {
            slideGroup.push({ type: 'journey', from: dest, to: data.destinations[i + 1] });
          }
          return slideGroup;
        }),
        { type: 'summary' }
      ]
    : [
        { type: 'intro' },
        { type: 'summary' }
      ];

  const currentSlide = slides[currentSlideIndex];

  const goToNext = useCallback(() => {
    if (currentSlideIndex < slides.length - 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentSlideIndex(prev => prev + 1);
        setIsAnimating(false);
        setProgress(0);
      }, 300);
    }
  }, [currentSlideIndex, slides.length]);

  const goToPrev = useCallback(() => {
    if (currentSlideIndex > 0) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentSlideIndex(prev => prev - 1);
        setIsAnimating(false);
        setProgress(0);
      }, 300);
    }
  }, [currentSlideIndex]);

  // Auto-advance timer
  useEffect(() => {
    const duration = currentSlide.type === 'journey' ? 3000 : 5000;
    const interval = 50;
    const increment = (interval / duration) * 100;

    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          goToNext();
          return 0;
        }
        return prev + increment;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [currentSlideIndex, currentSlide.type, goToNext]);

  // Handle tap navigation
  const handleTap = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;

    if (x < width / 3) {
      goToPrev();
    } else {
      goToNext();
    }
  };

  const handleShare = async () => {
    if (!slideRef.current) return;
    
    try {
      const canvas = await html2canvas(slideRef.current, {
        backgroundColor: '#000000',
        scale: 2,
        useCORS: true,
        allowTaint: true,
      });
      
      const link = document.createElement('a');
      link.download = `travel-recap-2025-${data.profile.username}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Failed to capture screenshot:', err);
    }
  };

  return (
    <div 
      ref={slideRef}
      className="min-h-screen bg-black flex flex-col cursor-pointer select-none"
      onClick={handleTap}
    >
      {/* Progress bars */}
      <div className="absolute top-0 left-0 right-0 z-20 p-2 flex gap-1">
        {slides.map((_, i) => (
          <div key={i} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white rounded-full transition-all duration-100"
              style={{ 
                width: i < currentSlideIndex ? '100%' : i === currentSlideIndex ? `${progress}%` : '0%' 
              }}
            />
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="absolute top-6 left-0 right-0 z-20 px-4 flex items-center justify-between">
        <button 
          onClick={(e) => { e.stopPropagation(); onBack(); }}
          className="p-2 bg-black/30 backdrop-blur-sm rounded-full"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <div className="flex items-center gap-2 bg-black/30 backdrop-blur-sm rounded-full px-3 py-1">
          <span className="text-white text-sm font-medium">@{data.profile.username}</span>
        </div>
        <button 
          onClick={(e) => { e.stopPropagation(); handleShare(); }}
          className="p-2 bg-black/30 backdrop-blur-sm rounded-full"
        >
          <Download className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Slide Content */}
      <div className={`flex-1 flex items-center justify-center transition-opacity duration-300 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
        {currentSlide.type === 'intro' && (
          <IntroSlide profile={data.profile} totalDestinations={data.destinations.length} />
        )}
        {currentSlide.type === 'destination' && (
          <DestinationSlide destination={currentSlide.destination} />
        )}
        {currentSlide.type === 'journey' && (
          <JourneySlide from={currentSlide.from} to={currentSlide.to} />
        )}
        {currentSlide.type === 'summary' && (
          <SummarySlide data={data} onShare={handleShare} onRestart={onRestart} />
        )}
      </div>

      {/* Navigation hints */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-8 text-white/50 text-sm">
        <div className="flex items-center gap-1">
          <ChevronLeft className="w-4 h-4" />
          <span>Prev</span>
        </div>
        <div className="flex items-center gap-1">
          <span>Next</span>
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
}

function IntroSlide({ profile, totalDestinations }: { profile: TravelRecapData['profile']; totalDestinations: number }) {
  return (
    <div className="text-center text-white p-8">
      <div className="mb-8 animate-bounce">
        <Plane className="w-16 h-16 mx-auto text-purple-400" />
      </div>
      <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
        2025 Travel Recap
      </h1>
      <p className="text-xl text-white/80 mb-6">@{profile.username}</p>
      <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3">
        <MapPin className="w-5 h-5 text-purple-400" />
        <span className="text-lg">{totalDestinations} destinations visited</span>
      </div>
    </div>
  );
}

function DestinationSlide({ destination }: { destination: TravelDestination }) {
  const displayName = getDestinationDisplayName(destination);
  
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-8">
      {destination.image ? (
        <div className="relative w-full max-w-sm aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl">
          <img 
            src={destination.image} 
            alt={displayName}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">{destination.visitOrder}</span>
              </div>
              <span className="text-white/60 text-sm">Stop #{destination.visitOrder}</span>
            </div>
            <h2 className="text-3xl font-bold text-white">{displayName}</h2>
          </div>
        </div>
      ) : (
        <div className="text-center">
          <StampCard destination={destination} size="lg" isActive />
          <h2 className="text-2xl font-bold text-white mt-6">{displayName}</h2>
          <p className="text-white/60">Stop #{destination.visitOrder}</p>
        </div>
      )}
    </div>
  );
}

function JourneySlide({ from, to }: { from: TravelDestination; to: TravelDestination }) {
  const fromName = getDestinationDisplayName(from);
  const toName = getDestinationDisplayName(to);
  
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-8 text-white">
      <div className="flex items-center gap-4 mb-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-2">
            <MapPin className="w-8 h-8 text-blue-400" />
          </div>
          <p className="text-sm text-white/60">From</p>
          <p className="font-semibold">{fromName}</p>
        </div>
        
        <div className="flex-1 relative h-1 bg-white/20 rounded-full max-w-32">
          <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-pulse" style={{ width: '100%' }} />
          <Plane className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/2 w-6 h-6 text-purple-400 animate-bounce" />
        </div>
        
        <div className="text-center">
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-2">
            <MapPin className="w-8 h-8 text-purple-400" />
          </div>
          <p className="text-sm text-white/60">To</p>
          <p className="font-semibold">{toName}</p>
        </div>
      </div>
      
      <p className="text-white/40 text-sm">Next destination...</p>
    </div>
  );
}

function SummarySlide({ data, onShare, onRestart }: { data: TravelRecapData; onShare: () => void; onRestart: () => void }) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-6 text-white" onClick={(e) => e.stopPropagation()}>
      <h2 className="text-2xl font-bold mb-2">Your 2025 Journey</h2>
      <p className="text-white/60 mb-6">@{data.profile.username}</p>
      
      {/* Stamp collection preview */}
      {data.destinations.length > 0 ? (
        <div className="flex flex-wrap justify-center gap-2 mb-8 max-w-sm">
          {data.destinations.slice(0, 6).map((dest) => (
            <StampCard key={dest.id} destination={dest} size="sm" />
          ))}
          {data.destinations.length > 6 && (
            <div className="w-24 h-28 bg-white/10 rounded-lg flex items-center justify-center">
              <span className="text-white/60">+{data.destinations.length - 6} more</span>
            </div>
          )}
        </div>
      ) : (
        <div className="mb-8 text-center">
          <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-10 h-10 text-white/40" />
          </div>
          <p className="text-white/60">No destinations tagged yet</p>
          <p className="text-white/40 text-sm">Go back and tag your travel photos!</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8 w-full max-w-xs">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-purple-400">{data.destinations.length}</p>
          <p className="text-sm text-white/60">Destinations</p>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-blue-400">2025</p>
          <p className="text-sm text-white/60">Year</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3 w-full max-w-xs">
        <Button 
          onClick={onShare}
          disabled={data.destinations.length === 0}
          className="w-full h-12 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-xl font-semibold disabled:opacity-50"
        >
          <Download className="w-5 h-5 mr-2" />
          Download My Recap
        </Button>
        <Button 
          onClick={onRestart}
          variant="outline"
          className="w-full h-12 border-white/20 text-white hover:bg-white/10 rounded-xl font-semibold"
        >
          Create Another
        </Button>
      </div>
    </div>
  );
}
