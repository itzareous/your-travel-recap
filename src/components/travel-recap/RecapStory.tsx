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

// Fun opening lines for personality
const OPENING_LINES = [
  "Your 2025 was a journey! 🌍",
  "2025 flew by so faaaaast ✈️\nBut we caught the best moments",
  "What a year it's been! 🎉",
  "You really said 'let's travel' in 2025 ✨",
  "Passport status: Very active 🔥",
  "Plot twist: You became a travel icon ✈️",
  "Adventure was your middle name 🗺️"
];

// Quarter context with fun facts - using 3D images for seasonal emojis
const QUARTER_CONTEXT: Record<QuarterKey, { emoji: string; subtitle: string; vibe: string; funFacts: string[] }> = {
  Q1: {
    emoji: "/images/cherry-blossom.webp",
    subtitle: "January - March",
    vibe: "New year, new adventures!",
    funFacts: [
      "Started the year strong! 💪",
      "Winter wanderlust activated ❄️",
      "Fresh starts, fresh stamps ✨",
      "New year, new places to explore 🚀"
    ]
  },
  Q2: {
    emoji: "/images/sun.webp",
    subtitle: "April - June",
    vibe: "Spring into adventure mode",
    funFacts: [
      "Peak travel season energy! 🔥",
      "You said 'summer? I'm ready' 😎",
      "Vacation mode: ACTIVATED ✅",
      "Spring fever hit different 🌷"
    ]
  },
  Q3: {
    emoji: "/images/beach.webp",
    subtitle: "July - September",
    vibe: "Summer adventures unlocked",
    funFacts: [
      "Living your best life! 🌴",
      "Hot girl summer? More like hot TRAVEL summer 🔥",
      "You really went off this quarter 🚀",
      "Main character energy ✨"
    ]
  },
  Q4: {
    emoji: "/images/christmas-tree.webp",
    subtitle: "October - December",
    vibe: "Year-end journeys",
    funFacts: [
      "Ended the year with a bang! 🎉",
      "December travels hit different ✨",
      "Saved the best for last? 👀",
      "Holiday mode: Engaged 🎅"
    ]
  }
};

// Location-specific fun messages based on image count
const getLocationMessage = (imageCount: number): string => {
  if (imageCount === 1) return "One perfect moment 📸";
  if (imageCount === 2) return "Twice as nice ✌️";
  if (imageCount <= 3) return `${imageCount} memories captured ✨`;
  if (imageCount <= 5) return `${imageCount} amazing shots! 🔥`;
  if (imageCount <= 10) return `${imageCount} photos! You loved it here 😍`;
  return `${imageCount} photos! Obsessed much? 📷💕`;
};

// Random helper
const getRandomItem = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

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
        backgroundColor: '#0B0101',
        scale: 2,
        useCORS: true,
        allowTaint: true,
      });
      
      const link = document.createElement('a');
      link.download = `stamped-recap-2025-${data.profile.username}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Failed to capture screenshot:', err);
    }
  };

  return (
    <div 
      ref={slideRef}
      className="min-h-screen bg-[#0B0101] flex flex-col cursor-pointer select-none"
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
  const totalPhotos = Object.values(quarterlyData).flat().reduce((sum, d) => sum + d.images.length, 0);
  
  // Use a consistent random opening (seeded by username)
  const openingIndex = profile.username.length % OPENING_LINES.length;
  const randomOpening = OPENING_LINES[openingIndex];
  
  return (
    <div className="absolute inset-0 bg-[#0B0101] flex flex-col items-center justify-center p-8 text-center">
      {/* Decorative 3D airplane */}
      <img 
        src="/images/airplane.webp" 
        alt="Airplane" 
        className="w-32 h-32 mb-6 animate-bounce object-contain"
      />
      
      {/* Fun opening line */}
      <p className="text-[#D3DBDD] text-xl mb-4 text-center whitespace-pre-line">
        {randomOpening}
      </p>
      
      {/* Main title */}
      <h1 className="text-5xl font-bold text-[#FDF6E3] mb-2">
        Your 2025 Stamped Recap
      </h1>
      
      {/* Username with flair */}
      <p className="text-[#FF5B04] text-2xl mb-8 font-medium">@{profile.username}</p>
      
      {/* Stats cards */}
      <div className="grid grid-cols-2 gap-4 w-full max-w-md mb-6">
        <div className="bg-[#233038] rounded-xl p-6 text-center border border-[#075056] hover:border-[#FF5B04] transition-colors">
          <img src="/images/trophy.webp" alt="Trophy" className="w-12 h-12 mb-2 mx-auto object-contain" />
          <div className="text-[#FF5B04] text-3xl font-bold">{totalDestinations}</div>
          <div className="text-[#D3DBDD] text-sm">Destinations</div>
        </div>
        
        <div className="bg-[#233038] rounded-xl p-6 text-center border border-[#075056] hover:border-[#2563EB] transition-colors">
          <img src="/images/calendar.webp" alt="Calendar" className="w-12 h-12 mb-2 mx-auto object-contain" />
          <div className="text-[#2563EB] text-3xl font-bold">{activeQuarters.length}</div>
          <div className="text-[#D3DBDD] text-sm">Quarters Active</div>
        </div>
      </div>
      
      {/* Quarter preview with enhanced styling */}
      <div className="flex justify-center gap-3 mb-6">
        {(['Q1', 'Q2', 'Q3', 'Q4'] as QuarterKey[]).map(q => (
          <div 
            key={q}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
              quarterlyData[q].length > 0 
                ? 'bg-[#FF5B04] text-white shadow-lg shadow-[#FF5B04]/30' 
                : 'bg-[#233038] text-[#D3DBDD] opacity-50'
            }`}
          >
            {q} {quarterlyData[q].length > 0 && `(${quarterlyData[q].length})`}
          </div>
        ))}
      </div>
      
      {/* Fun fact */}
      <p className="text-[#F4D47C] text-sm mt-2 text-center italic">
        {totalDestinations > 0 
          ? <span className="flex items-center justify-center gap-1">That's {totalDestinations} stamps in your passport! <img src="/images/stamp.webp" alt="Stamp" className="w-5 h-5 inline object-contain" /> {totalPhotos > 0 && <span>• {totalPhotos} memories captured <img src="/images/camera.webp" alt="Camera" className="w-5 h-5 inline object-contain" /></span>}</span>
          : <span className="flex items-center justify-center gap-1">Ready to add some stamps? <img src="/images/stamp.webp" alt="Stamp" className="w-5 h-5 inline object-contain" /></span>
        }
      </p>
    </div>
  );
}

function QuarterIntroSlide({ quarter, quarterName, count, destinations }: { quarter: QuarterKey; quarterName: string; count: number; destinations: TravelDestination[] }) {
  const info = QUARTER_CONTEXT[quarter];
  const randomFact = getRandomItem(info.funFacts);
  
  // Calculate total photos for this quarter
  const photoCount = destinations.reduce((sum, dest) => sum + dest.images.length, 0);
  
  return (
    <div className="absolute inset-0 bg-gradient-to-br from-[#0B0101] to-[#233038] flex flex-col items-center justify-center p-8 text-[#FDF6E3]">
      {/* Large 3D seasonal image */}
      <img 
        src={info.emoji} 
        alt={quarter} 
        className="w-32 h-32 mb-4 object-contain mx-auto"
      />
      
      {/* Quarter badge */}
      <div className="bg-[#FF5B04] text-white px-6 py-2 rounded-full font-bold mb-4 shadow-lg shadow-[#FF5B04]/30">
        {quarter}
      </div>
      
      {/* Subtitle */}
      <p className="text-[#D3DBDD] text-lg mb-2">{info.subtitle}</p>
      
      {/* Title */}
      <h2 className="text-4xl font-bold text-[#FDF6E3] mb-3 text-center">
        {quarterName}
      </h2>
      
      {/* Fun fact */}
      <p className="text-[#F4D47C] text-xl mb-8 text-center font-medium">
        {randomFact}
      </p>
      
      {/* Stats */}
      <div className="flex gap-8 mb-8">
        <div className="text-center">
          <div className="text-[#FF5B04] text-5xl font-bold">{count}</div>
          <div className="text-[#D3DBDD] text-sm">
            {count === 1 ? 'Place' : 'Places'}
          </div>
        </div>
        
        {photoCount > 0 && (
          <div className="text-center">
            <div className="text-[#2563EB] text-5xl font-bold">{photoCount}</div>
            <div className="text-[#D3DBDD] text-sm">
              {photoCount === 1 ? 'Memory' : 'Memories'}
            </div>
          </div>
        )}
      </div>
      
      {/* Destination chips with enhanced styling */}
      <div className="flex flex-wrap gap-3 justify-center max-w-2xl">
        {destinations.map((dest, idx) => (
          <div
            key={dest.id}
            className="bg-[#075056] border-2 border-[#F4D47C] px-4 py-2 rounded-full text-[#FDF6E3] flex items-center gap-2 hover:scale-105 transition-transform"
          >
            <img src="/images/stamp.webp" alt="Pin" className="w-4 h-4 object-contain" />
            <span>
              {dest.type === 'city' 
                ? `${dest.name}, ${dest.country}`
                : dest.name
              }
            </span>
            {dest.images.length > 0 && (
              <span className="text-[#F4D47C] text-xs flex items-center gap-1">({dest.images.length}<img src="/images/camera.webp" alt="Photos" className="w-3 h-3 object-contain" />)</span>
            )}
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
  
  // Get month name from earliest timestamp
  const getMonthName = () => {
    if (destination.earliestTimestamp) {
      return new Date(destination.earliestTimestamp).toLocaleString('default', { month: 'long' });
    }
    return null;
  };
  const monthName = getMonthName();
  
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
  
  const locationMessage = getLocationMessage(images.length);
  
  return (
    <div className="absolute inset-0 bg-black flex flex-col items-center justify-center">
      {images.length > 0 ? (
        <div className="relative w-full h-full">
          {/* Full-screen image */}
          <img 
            src={images[currentImageIndex]} 
            alt={displayName}
            className="w-full h-full object-cover transition-opacity duration-500"
          />
          
          {/* Top badges */}
          <div className="absolute top-20 left-6 right-6 flex justify-between items-start z-10">
            {/* Quarter & Month badge */}
            <div className="bg-[#FF5B04] text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 shadow-lg">
              <span>{quarter}</span>
              {monthName && (
                <>
                  <span>•</span>
                  <span>{monthName}</span>
                </>
              )}
            </div>
            
            {/* Image counter if multiple */}
            {images.length > 1 && (
              <div className="bg-black/60 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-bold">
                {currentImageIndex + 1} / {images.length}
              </div>
            )}
          </div>
          
          {/* Bottom overlay with details */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/90 to-transparent p-8 pb-24">
            {/* Location name */}
            <h2 className="text-white text-4xl font-bold mb-2">
              {destination.name}
            </h2>
            
            {/* Country if city */}
            {destination.type === 'city' && (
              <p className="text-white/80 text-xl mb-4">{destination.country}</p>
            )}
            
            {/* Fun message with accent bar */}
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-[#FF5B04] w-2 h-8 rounded-full"></div>
              <p className="text-white/90 text-lg font-medium">{locationMessage}</p>
            </div>
            
            {/* Additional fun fact based on image count */}
            {images.length >= 5 && (
              <p className="text-[#F4D47C] text-sm italic mt-2">
                This place clearly made an impression! 🌟
              </p>
            )}
            {images.length >= 10 && (
              <p className="text-[#FF5B04] text-sm font-bold mt-1">
                <span className="flex items-center gap-1">Top destination of the year! <img src="/images/trophy.webp" alt="Trophy" className="w-4 h-4 inline object-contain" /></span>
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center p-8">
          <StampCard destination={destination} size="lg" isActive />
          <h2 className="text-3xl font-bold text-[#FDF6E3] mt-6">{displayName}</h2>
          <div className="inline-flex items-center gap-2 mt-4 bg-[#FF5B04] px-4 py-2 rounded-full shadow-lg">
            <span className="text-white font-medium">{quarter}</span>
            {monthName && (
              <>
                <span className="text-white/60">•</span>
                <span className="text-white font-medium">{monthName}</span>
              </>
            )}
          </div>
          <p className="text-[#D3DBDD] mt-4 text-sm flex items-center justify-center gap-1">No photos uploaded for this destination <img src="/images/camera.webp" alt="Camera" className="w-4 h-4 object-contain" /></p>
        </div>
      )}
    </div>
  );
}

function SummarySlide({ data, quarterlyData, onShare, onRestart }: { data: TravelRecapData; quarterlyData: QuarterlyData; onShare: () => void; onRestart: () => void }) {
  const activeQuarters = (['Q1', 'Q2', 'Q3', 'Q4'] as QuarterKey[]).filter(q => quarterlyData[q].length > 0);
  
  // Calculate interesting stats
  const totalPhotos = data.destinations.reduce((sum, d) => sum + d.images.length, 0);
  const countries = [...new Set(data.destinations.map(d => d.country))];
  const cities = data.destinations.filter(d => d.type === 'city');
  
  // Find most visited place (most photos)
  const mostVisited = data.destinations.length > 0 
    ? data.destinations.reduce((max, d) => d.images.length > max.images.length ? d : max)
    : null;
  
  // Find busiest quarter
  const busiestQuarter = (['Q1', 'Q2', 'Q3', 'Q4'] as QuarterKey[])
    .filter(q => quarterlyData[q].length > 0)
    .reduce((max, q) => quarterlyData[q].length > quarterlyData[max].length ? q : max, 'Q1' as QuarterKey);
  
  return (
    <div className="absolute inset-0 bg-[#0B0101] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
      <div className="p-6 pb-48">
        {/* Header with personality */}
        <div className="text-center mb-8">
          <img 
            src="/images/party-popper.webp" 
            alt="Party Popper" 
            className="w-24 h-24 mb-4 mx-auto object-contain"
          />
          <h1 className="text-4xl font-bold text-[#FDF6E3] mb-2">
            Your 2025 Journey
          </h1>
          <p className="text-[#FF5B04] text-xl font-medium">@{data.profile.username}</p>
          <p className="text-[#D3DBDD] text-xs mt-1 opacity-70">Powered by Stamped Recap</p>
          {data.destinations.length > 0 && (
            <p className="text-[#D3DBDD] text-sm mt-2 italic">
              What a year it's been! ✨
            </p>
          )}
        </div>
        
        {data.destinations.length > 0 ? (
          <>
            {/* Main stats grid with emojis */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-[#233038] rounded-2xl p-5 text-center border border-[#075056] hover:border-[#FF5B04] transition-colors">
                <img src="/images/total-destinations.webp" alt="Globe" className="w-12 h-12 mb-2 mx-auto object-contain" />
                <div className="text-[#FF5B04] text-4xl font-bold">{data.destinations.length}</div>
                <div className="text-[#D3DBDD] text-sm">Total Destinations</div>
              </div>
              
              <div className="bg-[#233038] rounded-2xl p-5 text-center border border-[#075056] hover:border-[#2563EB] transition-colors">
                <img src="/images/camera.webp" alt="Camera" className="w-12 h-12 mb-2 mx-auto object-contain" />
                <div className="text-[#2563EB] text-4xl font-bold">{totalPhotos}</div>
                <div className="text-[#D3DBDD] text-sm">Memories Captured</div>
              </div>
              
              <div className="bg-[#233038] rounded-2xl p-5 text-center border border-[#075056] hover:border-[#F4D47C] transition-colors">
                <img src="/images/world-map.webp" alt="World Map" className="w-12 h-12 mb-2 mx-auto object-contain" />
                <div className="text-[#F4D47C] text-4xl font-bold">{countries.length}</div>
                <div className="text-[#D3DBDD] text-sm">{countries.length === 1 ? 'Country' : 'Countries'}</div>
              </div>
              
              <div className="bg-[#233038] rounded-2xl p-5 text-center border border-[#075056] hover:border-[#075056] transition-colors">
                <img src="/images/city-skyline.webp" alt="City Skyline" className="w-12 h-12 mb-2 mx-auto object-contain" />
                <div className="text-[#075056] text-4xl font-bold">{cities.length}</div>
                <div className="text-[#D3DBDD] text-sm">{cities.length === 1 ? 'City' : 'Cities'}</div>
              </div>
            </div>
            
            {/* Fun insights - Top Spot */}
            {mostVisited && mostVisited.images.length > 0 && (
              <div className="bg-gradient-to-r from-[#FF5B04] to-[#E54F03] rounded-2xl p-5 mb-4 shadow-lg">
                <h3 className="text-white text-lg font-bold mb-2 flex items-center gap-2">
                  <img src="/images/trophy.webp" alt="Trophy" className="w-6 h-6 object-contain" /> Your Top Spot
                </h3>
                <p className="text-white text-2xl font-bold">
                  {mostVisited.type === 'city' 
                    ? `${mostVisited.name}, ${mostVisited.country}`
                    : mostVisited.name
                  }
                </p>
                <p className="text-white/80 mt-2">
                  {mostVisited.images.length} photos • You couldn't get enough! <img src="/images/party-popper.webp" alt="Love" className="w-5 h-5 inline object-contain" />
                </p>
              </div>
            )}
            
            {/* Fun insights - Busiest Quarter */}
            {activeQuarters.length > 0 && (
              <div className="bg-gradient-to-r from-[#2563EB] to-[#1E40AF] rounded-2xl p-5 mb-6 shadow-lg">
                <h3 className="text-white text-lg font-bold mb-2 flex items-center gap-2">
                  <img src="/images/calendar.webp" alt="Calendar" className="w-6 h-6 object-contain" /> Busiest Quarter
                </h3>
                <p className="text-white text-2xl font-bold">
                  {busiestQuarter} - {QUARTER_NAMES[busiestQuarter]}
                </p>
                <p className="text-white/80 mt-2">
                  {quarterlyData[busiestQuarter].length} destinations • You were on fire! 🔥
                </p>
              </div>
            )}
            
            {/* Quarterly breakdown with enhanced styling */}
            <h3 className="text-[#FDF6E3] text-xl font-bold mb-4 flex items-center gap-2">
              <img src="/images/chart.webp" alt="Chart" className="w-6 h-6 object-contain" /> Quarter by Quarter
            </h3>
            <div className="grid grid-cols-4 gap-3 mb-6">
              {(['Q1', 'Q2', 'Q3', 'Q4'] as QuarterKey[]).map(q => (
                <div 
                  key={q} 
                  className={`rounded-xl p-4 text-center transition-all ${
                    quarterlyData[q].length > 0 
                      ? 'bg-[#FF5B04] text-white shadow-lg shadow-[#FF5B04]/20' 
                      : 'bg-[#233038] text-[#D3DBDD] opacity-50'
                  }`}
                >
                  <div className="text-3xl font-bold">{quarterlyData[q].length}</div>
                  <div className="text-sm font-medium">{q}</div>
                </div>
              ))}
            </div>
            
            {/* Stamps collection */}
            <h3 className="text-[#FDF6E3] text-xl font-bold mb-4 flex items-center gap-2">
              <img src="/images/stamp.webp" alt="Stamp" className="w-6 h-6 object-contain" /> Your Stamp Collection
            </h3>
            <div className="grid grid-cols-2 gap-4 mb-6">
              {data.destinations.map((dest) => (
                <StampCard key={dest.id} destination={dest} />
              ))}
            </div>
            
            {/* Final message */}
            <div className="bg-[#075056] border-l-4 border-[#F4D47C] rounded-lg p-5 text-center mb-6">
              <p className="text-[#FDF6E3] text-xl mb-2">
                What a year, @{data.profile.username}! <img src="/images/party-popper.webp" alt="Party" className="w-6 h-6 inline object-contain" />
              </p>
              <p className="text-[#D3DBDD]">
                Can't wait to see where 2026 takes you! <img src="/images/airplane.webp" alt="Plane" className="w-5 h-5 inline object-contain" />
              </p>
            </div>
          </>
        ) : (
          <div className="mb-6 text-center py-12">
            <img src="/images/world-map.webp" alt="World Map" className="w-16 h-16 mb-4 mx-auto object-contain" />
            <div className="w-20 h-20 bg-[#233038] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-10 h-10 text-[#D3DBDD]" />
            </div>
            <p className="text-[#FDF6E3] text-xl font-bold mb-2">No destinations tagged yet</p>
            <p className="text-[#D3DBDD] text-sm opacity-70">Go back and tag your travel photos!</p>
            <p className="text-[#F4D47C] text-sm mt-4 italic flex items-center justify-center gap-1">Your adventure awaits! <img src="/images/party-popper.webp" alt="Sparkles" className="w-4 h-4 object-contain" /></p>
          </div>
        )}
      </div>
      
      {/* Fixed bottom buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-[#0B0101] via-[#0B0101] to-transparent p-6 pt-12 space-y-3">
        <Button 
          onClick={onShare}
          disabled={data.destinations.length === 0}
          className="w-full h-14 bg-[#FF5B04] hover:bg-[#E54F03] rounded-xl font-bold text-lg disabled:bg-[#233038] disabled:text-[#D3DBDD] transition-all shadow-lg shadow-[#FF5B04]/30 disabled:shadow-none"
        >
          <Download className="w-5 h-5 mr-2" />
          Download My Recap
        </Button>
        <Button 
          onClick={onRestart}
          variant="outline"
          className="w-full h-14 border-2 border-[#D3DBDD] text-[#D3DBDD] hover:border-[#FF5B04] hover:text-[#FF5B04] bg-transparent rounded-xl font-semibold text-lg transition-all"
        >
          Create Another
        </Button>
      </div>
    </div>
  );
}
