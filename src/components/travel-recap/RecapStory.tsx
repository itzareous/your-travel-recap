import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { TravelRecapData, TravelDestination, getDestinationDisplayName } from "./types";
import StampCard from "./StampCard";
import { ArrowLeft, Download, Plane, MapPin, ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import html2canvas from "html2canvas";

interface RecapStoryProps {
  data: TravelRecapData;
  onBack: () => void;
  onRestart: () => void;
}

type QuarterKey = 'Q1' | 'Q2' | 'Q3' | 'Q4';

type StorySlide = 
  | { type: 'intro' }
  | { type: 'quarter-intro'; quarter: QuarterKey; quarterName: string; count: number; destinations: TravelDestination[] }
  | { type: 'destination'; destination: TravelDestination; quarter: QuarterKey }
  | { type: 'summary' };

const QUARTER_NAMES: Record<QuarterKey, string> = {
  Q1: 'Beginning of the Year',
  Q2: 'Mid-Year Adventures',
  Q3: 'Late Summer Travels',
  Q4: 'Year-End Journeys'
};

export default function RecapStory({ data, onBack, onRestart }: RecapStoryProps) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [progress, setProgress] = useState(0);
  const slideRef = useRef<HTMLDivElement>(null);

  // Group destinations by quarter based on timestamps
  const quarterlyDestinations = useMemo(() => {
    const quarters: Record<QuarterKey, TravelDestination[]> = {
      Q1: [],
      Q2: [],
      Q3: [],
      Q4: []
    };
    
    data.destinations.forEach(dest => {
      const timestamp = dest.earliestTimestamp;
      if (timestamp) {
        const date = new Date(timestamp);
        const month = date.getMonth() + 1; // 1-12
        
        if (month <= 3) quarters.Q1.push(dest);
        else if (month <= 6) quarters.Q2.push(dest);
        else if (month <= 9) quarters.Q3.push(dest);
        else quarters.Q4.push(dest);
      } else {
        // No timestamp - put in Q4 as fallback
        quarters.Q4.push(dest);
      }
    });
    
    return quarters;
  }, [data.destinations]);

  // Build slides array based on quarters
  const slides: StorySlide[] = useMemo(() => {
    if (data.destinations.length === 0) {
      return [{ type: 'intro' }, { type: 'summary' }];
    }

    const slideList: StorySlide[] = [{ type: 'intro' }];
    
    // Add slides for each quarter that has destinations
    const quarterOrder: QuarterKey[] = ['Q1', 'Q2', 'Q3', 'Q4'];
    
    quarterOrder.forEach(quarter => {
      const dests = quarterlyDestinations[quarter];
      if (dests.length === 0) return;
      
      // Quarter intro slide
      slideList.push({
        type: 'quarter-intro',
        quarter,
        quarterName: QUARTER_NAMES[quarter],
        count: dests.length,
        destinations: dests
      });
      
      // Individual destination slides for this quarter
      dests.forEach(dest => {
        slideList.push({
          type: 'destination',
          destination: dest,
          quarter
        });
      });
    });
    
    slideList.push({ type: 'summary' });
    
    return slideList;
  }, [data.destinations, quarterlyDestinations]);

  // Debug logging for slides
  useEffect(() => {
    console.log('=== RECAP STORY DEBUG ===');
    console.log('Destinations received:', data.destinations.length);
    console.log('Quarterly breakdown:', {
      Q1: quarterlyDestinations.Q1.length,
      Q2: quarterlyDestinations.Q2.length,
      Q3: quarterlyDestinations.Q3.length,
      Q4: quarterlyDestinations.Q4.length
    });
    console.log('Total slides:', slides.length);
    slides.forEach((slide, i) => {
      if (slide.type === 'destination') {
        console.log(`  Slide ${i}: destination - ${slide.destination.name} (${slide.quarter})`);
      } else if (slide.type === 'quarter-intro') {
        console.log(`  Slide ${i}: quarter-intro - ${slide.quarter} (${slide.count} places)`);
      } else {
        console.log(`  Slide ${i}: ${slide.type}`);
      }
    });
  }, [data.destinations, slides, quarterlyDestinations]);

  const currentSlide = slides[currentSlideIndex];

  // Debug current slide
  useEffect(() => {
    console.log(`Current slide: ${currentSlideIndex + 1} of ${slides.length} (type: ${currentSlide?.type})`);
  }, [currentSlideIndex, slides.length, currentSlide?.type]);

  const goToNext = useCallback(() => {
    if (currentSlideIndex < slides.length - 1 && !isAnimating) {
      setIsAnimating(true);
      setProgress(0);
      setTimeout(() => {
        setCurrentSlideIndex(prev => Math.min(prev + 1, slides.length - 1));
        setIsAnimating(false);
      }, 300);
    }
  }, [currentSlideIndex, slides.length, isAnimating]);

  const goToPrev = useCallback(() => {
    if (currentSlideIndex > 0 && !isAnimating) {
      setIsAnimating(true);
      setProgress(0);
      setTimeout(() => {
        setCurrentSlideIndex(prev => Math.max(prev - 1, 0));
        setIsAnimating(false);
      }, 300);
    }
  }, [currentSlideIndex, isAnimating]);

  // Auto-advance timer
  useEffect(() => {
    // Don't auto-advance on summary slide
    if (currentSlide.type === 'summary') {
      return;
    }

    const duration = currentSlide.type === 'quarter-intro' ? 4000 : 5000;
    const interval = 50;
    const increment = (interval / duration) * 100;

    const progressTimer = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + increment;
        if (newProgress >= 100) {
          return 100;
        }
        return newProgress;
      });
    }, interval);

    return () => clearInterval(progressTimer);
  }, [currentSlideIndex, currentSlide.type]);

  // Separate effect to handle slide advancement when progress reaches 100
  useEffect(() => {
    if (progress >= 100 && currentSlide.type !== 'summary') {
      goToNext();
    }
  }, [progress, currentSlide.type, goToNext]);

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
        backgroundColor: '#0F172A',
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
      className="min-h-screen bg-[#0F172A] flex flex-col cursor-pointer select-none"
      onClick={handleTap}
    >
      {/* Progress bars */}
      <div className="absolute top-0 left-0 right-0 z-20 p-3 flex gap-1">
        {slides.map((_, i) => (
          <div key={i} className="flex-1 h-1 bg-[#233038] rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#FF5B04] rounded-full transition-all duration-100"
              style={{ 
                width: i < currentSlideIndex ? '100%' : i === currentSlideIndex ? `${progress}%` : '0%' 
              }}
            />
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="absolute top-8 left-0 right-0 z-20 px-4 flex items-center justify-between">
        <button 
          onClick={(e) => { e.stopPropagation(); onBack(); }}
          className="p-2 bg-[#233038] hover:bg-[#FF5B04] rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-[#FDF6E3]" />
        </button>
        <div className="flex items-center gap-2 bg-[#233038] rounded-full px-4 py-2 border border-[#075056]">
          <span className="text-[#FDF6E3] text-sm font-medium">@{data.profile.username}</span>
        </div>
        <button 
          onClick={(e) => { e.stopPropagation(); handleShare(); }}
          className="p-2 bg-[#233038] hover:bg-[#FF5B04] rounded-full transition-colors"
        >
          <Download className="w-5 h-5 text-[#FDF6E3]" />
        </button>
      </div>

      {/* Slide Content */}
      <div className={`flex-1 flex items-center justify-center transition-opacity duration-300 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
        {currentSlide.type === 'intro' && (
          <IntroSlide profile={data.profile} totalDestinations={data.destinations.length} quarterlyData={quarterlyDestinations} />
        )}
        {currentSlide.type === 'quarter-intro' && (
          <QuarterIntroSlide 
            quarter={currentSlide.quarter}
            quarterName={currentSlide.quarterName}
            count={currentSlide.count}
            destinations={currentSlide.destinations}
          />
        )}
        {currentSlide.type === 'destination' && (
          <DestinationSlide destination={currentSlide.destination} quarter={currentSlide.quarter} />
        )}
        {currentSlide.type === 'summary' && (
          <SummarySlide data={data} quarterlyData={quarterlyDestinations} onShare={handleShare} onRestart={onRestart} />
        )}
      </div>

      {/* Navigation hints */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-8 text-[#D3DBDD] text-sm">
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

type QuarterlyData = Record<QuarterKey, TravelDestination[]>;

function IntroSlide({ profile, totalDestinations, quarterlyData }: { profile: TravelRecapData['profile']; totalDestinations: number; quarterlyData: QuarterlyData }) {
  // Count active quarters
  const activeQuarters = (['Q1', 'Q2', 'Q3', 'Q4'] as QuarterKey[]).filter(q => quarterlyData[q].length > 0);
  
  return (
    <div className="text-center text-[#FDF6E3] p-8">
      <div className="mb-8">
        <div className="w-20 h-20 bg-[#075056] rounded-2xl flex items-center justify-center mx-auto">
          <Plane className="w-10 h-10 text-[#FF5B04]" />
        </div>
      </div>
      <h1 className="text-5xl font-bold mb-4 text-[#FDF6E3]">
        2025 Travel Recap
      </h1>
      <div className="w-16 h-2 bg-[#FF5B04] mx-auto rounded-full mb-4" />
      <p className="text-xl text-[#D3DBDD] mb-6">@{profile.username}</p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-4">
        <div className="inline-flex items-center gap-2 bg-[#233038] border border-[#075056] rounded-full px-6 py-3">
          <MapPin className="w-5 h-5 text-[#2563EB]" />
          <span className="text-lg">{totalDestinations} destinations</span>
        </div>
        {activeQuarters.length > 0 && (
          <div className="inline-flex items-center gap-2 bg-[#233038] border border-[#075056] rounded-full px-6 py-3">
            <Calendar className="w-5 h-5 text-[#F4D47C]" />
            <span className="text-lg">{activeQuarters.length} {activeQuarters.length === 1 ? 'quarter' : 'quarters'}</span>
          </div>
        )}
      </div>
      {/* Quarter preview dots */}
      <div className="flex justify-center gap-2 mt-4">
        {(['Q1', 'Q2', 'Q3', 'Q4'] as QuarterKey[]).map(q => (
          <div 
            key={q}
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              quarterlyData[q].length > 0 
                ? 'bg-[#FF5B04] text-white' 
                : 'bg-[#233038] text-[#D3DBDD]'
            }`}
          >
            {q}
          </div>
        ))}
      </div>
    </div>
  );
}

function QuarterIntroSlide({ quarter, quarterName, count, destinations }: { quarter: QuarterKey; quarterName: string; count: number; destinations: TravelDestination[] }) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-8 text-[#FDF6E3]">
      {/* Quarter badge */}
      <div className="bg-[#FF5B04] text-white px-6 py-2 rounded-full text-sm font-semibold mb-6">
        {quarter}
      </div>
      
      {/* Title */}
      <h2 className="text-4xl font-bold text-[#FDF6E3] mb-4 text-center">
        {quarterName}
      </h2>
      
      {/* Count */}
      <p className="text-[#D3DBDD] text-lg mb-8">
        {count} {count === 1 ? 'place' : 'places'} visited
      </p>
      
      {/* Location list */}
      <div className="flex flex-wrap gap-3 justify-center max-w-2xl">
        {destinations.map((dest) => (
          <div
            key={dest.id}
            className="bg-[#233038] border border-[#075056] px-4 py-2 rounded-full text-[#FDF6E3]"
          >
            {dest.type === 'city' 
              ? `${dest.name}, ${dest.country}`
              : dest.name
            }
          </div>
        ))}
      </div>
    </div>
  );
}

function DestinationSlide({ destination, quarter }: { destination: TravelDestination; quarter: QuarterKey }) {
  const displayName = getDestinationDisplayName(destination);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { images } = destination;
  
  // Cycle through images if multiple
  useEffect(() => {
    if (images.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentImageIndex(prev => (prev + 1) % images.length);
    }, 1500);
    
    return () => clearInterval(interval);
  }, [images.length]);

  // Reset image index when destination changes
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [destination.id]);
  
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-8">
      {images.length > 0 ? (
        <div className="relative w-full max-w-sm aspect-[3/4] rounded-2xl overflow-hidden border border-[#075056]">
          <img 
            src={images[currentImageIndex]} 
            alt={displayName}
            className="w-full h-full object-cover transition-opacity duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/90 via-transparent to-transparent" />
          
          {/* Quarter badge */}
          <div className="absolute top-4 left-4 bg-[#2563EB] px-3 py-1 rounded-full">
            <span className="text-white text-xs font-medium">{quarter}</span>
          </div>
          
          {/* Image counter badge if multiple images */}
          {images.length > 1 && (
            <div className="absolute top-4 right-4 bg-[#FF5B04] px-3 py-1 rounded-full">
              <span className="text-white text-sm font-medium">
                {currentImageIndex + 1} / {images.length}
              </span>
            </div>
          )}
          
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <h2 className="text-3xl font-bold text-[#FDF6E3]">{displayName}</h2>
            {images.length > 1 && (
              <p className="text-[#F4D47C] text-sm mt-1">
                {images.length} memories from this place
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center">
          <StampCard destination={destination} size="lg" isActive />
          <h2 className="text-2xl font-bold text-[#FDF6E3] mt-6">{displayName}</h2>
          <div className="inline-flex items-center gap-2 mt-2 bg-[#2563EB] px-3 py-1 rounded-full">
            <span className="text-white text-xs font-medium">{quarter}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function SummarySlide({ data, quarterlyData, onShare, onRestart }: { data: TravelRecapData; quarterlyData: QuarterlyData; onShare: () => void; onRestart: () => void }) {
  const activeQuarters = (['Q1', 'Q2', 'Q3', 'Q4'] as QuarterKey[]).filter(q => quarterlyData[q].length > 0);
  
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-6 text-[#FDF6E3] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
      <h2 className="text-3xl font-bold mb-2">Your 2025 Journey</h2>
      <p className="text-[#D3DBDD] mb-4">@{data.profile.username}</p>
      
      {/* Quarterly breakdown */}
      {data.destinations.length > 0 && (
        <div className="grid grid-cols-4 gap-2 mb-6 w-full max-w-sm">
          {(['Q1', 'Q2', 'Q3', 'Q4'] as QuarterKey[]).map(q => (
            <div 
              key={q}
              className={`rounded-xl p-3 text-center ${
                quarterlyData[q].length > 0 
                  ? 'bg-[#FF5B04] text-white' 
                  : 'bg-[#233038] text-[#D3DBDD]'
              }`}
            >
              <p className="text-lg font-bold">{quarterlyData[q].length}</p>
              <p className="text-xs">{q}</p>
            </div>
          ))}
        </div>
      )}
      
      {/* Stamp collection preview */}
      {data.destinations.length > 0 ? (
        <div className="flex flex-wrap justify-center gap-2 mb-6 max-w-sm">
          {data.destinations.slice(0, 6).map((dest) => (
            <StampCard key={dest.id} destination={dest} size="sm" />
          ))}
          {data.destinations.length > 6 && (
            <div className="w-24 h-28 bg-[#233038] border border-[#075056] rounded-lg flex items-center justify-center">
              <span className="text-[#D3DBDD]">+{data.destinations.length - 6} more</span>
            </div>
          )}
        </div>
      ) : (
        <div className="mb-6 text-center">
          <div className="w-20 h-20 bg-[#233038] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-10 h-10 text-[#D3DBDD]" />
          </div>
          <p className="text-[#D3DBDD]">No destinations tagged yet</p>
          <p className="text-[#D3DBDD] text-sm opacity-70">Go back and tag your travel photos!</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6 w-full max-w-xs">
        <div className="bg-[#233038] border border-[#075056] rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-[#FF5B04]">{data.destinations.length}</p>
          <p className="text-sm text-[#D3DBDD]">Destinations</p>
        </div>
        <div className="bg-[#233038] border border-[#075056] rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-[#2563EB]">{activeQuarters.length}</p>
          <p className="text-sm text-[#D3DBDD]">Quarters</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3 w-full max-w-xs">
        <Button 
          onClick={onShare}
          disabled={data.destinations.length === 0}
          className="w-full h-12 bg-[#FF5B04] hover:bg-[#E54F03] rounded-full font-semibold disabled:bg-[#233038] disabled:text-[#D3DBDD] transition-colors"
        >
          <Download className="w-5 h-5 mr-2" />
          Download My Recap
        </Button>
        <Button 
          onClick={onRestart}
          variant="outline"
          className="w-full h-12 border-2 border-[#D3DBDD] text-[#D3DBDD] hover:border-[#FF5B04] hover:text-[#FF5B04] bg-transparent rounded-full font-semibold transition-colors"
        >
          Create Another
        </Button>
      </div>
    </div>
  );
}
