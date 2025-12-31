import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TravelRecapData, TravelDestination, getDestinationDisplayName } from "./types";
import StampCard from "./StampCard";
import { ArrowLeft, Download, Plane, MapPin, ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import html2canvas from "html2canvas";
import { 
  fadeInUp, 
  scaleInBounce, 
  slideInUp, 
  slideInLeft, 
  slideInRight, 
  bounceDown, 
  staggerContainer, 
  staggerContainerSlow,
  popIn,
  flip3D,
  stampThud,
  animateCounter
} from "@/utils/animations";

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
  | { type: 'summary-intro' }
  | { type: 'top-spot' }
  | { type: 'busiest-quarter' }
  | { type: 'quarter-breakdown' }
  | { type: 'stamp-collection' };

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
      return [{ type: 'intro' }, { type: 'summary-intro' }, { type: 'stamp-collection' }];
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
    
    // Summary slides (5 new slides)
    slideList.push({ type: 'summary-intro' });
    slideList.push({ type: 'top-spot' });
    slideList.push({ type: 'busiest-quarter' });
    slideList.push({ type: 'quarter-breakdown' });
    slideList.push({ type: 'stamp-collection' });
    
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
    // Don't auto-advance on stamp-collection slide (the final slide)
    if (currentSlide.type === 'stamp-collection') {
      return;
    }

    // Calculate dynamic duration - for destinations, base on image count
    const getSlideDuration = () => {
      if (currentSlide.type === 'destination') {
        const imageCount = currentSlide.destination.images.length;
        // Base 8 seconds + 4 seconds per additional image
        // 1 image = 8s, 2 images = 12s, 3 images = 16s, 5 images = 24s
        return 8000 + (imageCount - 1) * 4000;
      }
      if (currentSlide.type === 'quarter-intro') return 14000;
      if (currentSlide.type === 'intro') return 10000;
      if (currentSlide.type === 'stamp-collection') return 16000;
      return 10000;
    };
    const duration = getSlideDuration();
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
    if (progress >= 100 && currentSlide.type !== 'stamp-collection') {
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
        {currentSlide.type === 'summary-intro' && (
          <SummaryIntroSlide data={data} quarterlyData={quarterlyDestinations} />
        )}
        {currentSlide.type === 'top-spot' && (
          <TopSpotSlide data={data} />
        )}
        {currentSlide.type === 'busiest-quarter' && (
          <BusiestQuarterSlide quarterlyData={quarterlyDestinations} />
        )}
        {currentSlide.type === 'quarter-breakdown' && (
          <QuarterBreakdownSlide quarterlyData={quarterlyDestinations} />
        )}
        {currentSlide.type === 'stamp-collection' && (
          <StampCollectionSlide data={data} onShare={handleShare} onRestart={onRestart} />
        )}
      </div>


    </div>
  );
}

type QuarterlyData = Record<QuarterKey, TravelDestination[]>;

// Counter component with animation
function AnimatedCounter({ value, className }: { value: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 1500;
    const startTime = performance.now();
    const startValue = 0;

    const updateCounter = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.round(startValue + (value - startValue) * easeProgress);
      setDisplayValue(currentValue);
      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      }
    };

    requestAnimationFrame(updateCounter);
  }, [value]);

  return <div ref={ref} className={className}>{displayValue}</div>;
}

// Word animation component for titles
const AnimatedTitle = ({ text, delay = 0 }: { text: string; delay?: number }) => {
  const words = text.split(" ");
  return (
    <>
      {words.map((word, index) => (
        <motion.span
          key={index}
          className="inline-block mr-3"
          initial={{ opacity: 0, y: 50, rotateX: -90 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{
            duration: 0.6,
            delay: delay + index * 0.1,
            ease: [0.34, 1.56, 0.64, 1]
          }}
        >
          {word}
        </motion.span>
      ))}
    </>
  );
};

function IntroSlide({ profile, totalDestinations, quarterlyData }: { profile: TravelRecapData['profile']; totalDestinations: number; quarterlyData: QuarterlyData }) {
  // Count active quarters
  const activeQuartersCount = (['Q1', 'Q2', 'Q3', 'Q4'] as QuarterKey[]).filter(q => quarterlyData[q].length > 0).length;
  
  // Get all images for circular photo display
  // Note: d.images is string[] (URLs), not TravelImage objects
  const allImages = useMemo(() => {
    return Object.values(quarterlyData).flat().flatMap(d => d.images);
  }, [quarterlyData]);
  
  // Use a consistent random opening (seeded by username)
  const openingIndex = profile.username.length % OPENING_LINES.length;
  const randomOpening = OPENING_LINES[openingIndex];
  
  // Positions for scattered circular photos (same size as stat circles)
  const photoPositions = [
    { top: '10%', right: '15%' },
    { top: '35%', left: '5%' },
    { top: '45%', left: '45%' },
    { top: '70%', left: '25%' },
    { top: '15%', left: '50%' },
    { top: '60%', right: '25%' },
    { top: '80%', right: '15%' },
    { top: '30%', right: '40%' }
  ];
  
  return (
    <div className="absolute inset-0 bg-[#0B0101] overflow-hidden">
      {/* Animated gradient blobs background */}
      <div className="absolute inset-0">
        <motion.div 
          className="absolute w-96 h-96 bg-gradient-to-br from-[#FF5B04]/20 to-[#2563EB]/20 rounded-full blur-3xl top-0 -left-20"
          animate={{ 
            scale: [1, 1.2, 1],
            x: [0, 30, 0],
            y: [0, 20, 0]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute w-96 h-96 bg-gradient-to-br from-[#2563EB]/20 to-[#075056]/20 rounded-full blur-3xl top-0 -right-20"
          animate={{ 
            scale: [1.2, 1, 1.2],
            x: [0, -20, 0],
            y: [0, 30, 0]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
        <motion.div 
          className="absolute w-96 h-96 bg-gradient-to-br from-[#075056]/20 to-[#FF5B04]/20 rounded-full blur-3xl bottom-0 left-1/2 -translate-x-1/2"
          animate={{ 
            scale: [1, 1.3, 1],
            y: [0, -20, 0]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 4 }}
        />
      </div>
      
      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center p-6 text-center">
        {/* Decorative 3D airplane - flies in from off-screen */}
        <motion.img 
          src="/images/airplane.webp" 
          alt="Airplane" 
          className="w-24 h-24 mb-4 object-contain"
          initial={{ x: -200, y: -100, rotate: -45, opacity: 0 }}
          animate={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
          transition={{ 
            type: "spring", 
            stiffness: 100, 
            damping: 15,
            duration: 1 
          }}
        />
        
        {/* Fun opening line */}
        <motion.p 
          className="text-[#D3DBDD] text-lg mb-3 text-center whitespace-pre-line"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          {randomOpening}
        </motion.p>
        
        {/* Main title - 2 lines */}
        <motion.h1 
          className="text-4xl font-bold text-[#FDF6E3] mb-1 leading-tight"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          Your 2025<br />Stamped Recap
        </motion.h1>
        
        {/* Username with flair */}
        <motion.p 
          className="text-[#FF5B04] text-xl mb-6 font-medium"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.2, type: "spring", stiffness: 200 }}
        >
          @{profile.username}
        </motion.p>
        
        {/* Photo grid with integrated stat circles */}
        <div className="relative w-full max-w-lg mx-auto mt-4">
          <div className="grid grid-cols-4 gap-2 px-4">
            {Array.from({ length: 12 }).map((_, gridIdx) => {
              // Position 4 = Destinations stat (row 2, col 1)
              if (gridIdx === 4) {
                return (
                  <motion.div
                    key="destinations"
                    className="w-20 h-20 flex items-center justify-center"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 1.5, duration: 0.5, type: "spring" }}
                  >
                    <div 
                      className="rounded-full bg-gradient-to-br from-[#FF5B04] to-[#E54F03] flex flex-col items-center justify-center shadow-xl border-4 border-[#233038]"
                      style={{ width: '80px', height: '80px', minWidth: '80px', minHeight: '80px' }}
                    >
                      <AnimatedCounter value={totalDestinations} className="text-white text-2xl font-bold" />
                      <span className="text-white text-[10px] font-medium">Destinations</span>
                    </div>
                  </motion.div>
                );
              }
              
              // Position 5 = Quarters stat (row 2, col 2)
              if (gridIdx === 5) {
                return (
                  <motion.div
                    key="quarters"
                    className="w-20 h-20 flex items-center justify-center"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 1.6, duration: 0.5, type: "spring" }}
                  >
                    <div 
                      className="rounded-full bg-gradient-to-br from-[#2563EB] to-[#1E40AF] flex flex-col items-center justify-center shadow-xl border-4 border-[#233038]"
                      style={{ width: '80px', height: '80px', minWidth: '80px', minHeight: '80px' }}
                    >
                      <AnimatedCounter value={activeQuartersCount} className="text-white text-2xl font-bold" />
                      <span className="text-white text-[10px] font-medium">Quarters</span>
                    </div>
                  </motion.div>
                );
              }
              
              // Photo circles for remaining positions
              // Adjust photo index: positions 0-3 map to photos 0-3, positions 6-11 map to photos 4-9
              const photoIdx = gridIdx < 4 ? gridIdx : gridIdx - 2;
              const imageUrl = allImages[photoIdx];
              
              if (!imageUrl) {
                return <div key={gridIdx} className="w-20 h-20" />;
              }
              
              // Size variants as pixel values for explicit sizing
              const sizeMap: Record<string, number> = {
                'small': 56,
                'medium': 64,
                'large': 72
              };
              
              const sizeVariants = ['medium', 'large', 'small', 'medium', 'large', 'small'];
              const sizeKey = sizeVariants[photoIdx % sizeVariants.length];
              const pixelSize = sizeMap[sizeKey];
              
              return (
                <motion.div
                  key={gridIdx}
                  className="w-20 h-20 flex items-center justify-center"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ 
                    delay: 1.7 + (photoIdx * 0.05), 
                    duration: 0.5,
                    type: "spring",
                    stiffness: 100,
                    damping: 15
                  }}
                >
                  <div 
                    className="rounded-full overflow-hidden border-4 border-[#233038] shadow-xl"
                    style={{ 
                      width: `${pixelSize}px`, 
                      height: `${pixelSize}px`,
                      minWidth: `${pixelSize}px`,
                      minHeight: `${pixelSize}px`,
                      maxWidth: `${pixelSize}px`,
                      maxHeight: `${pixelSize}px`
                    }}
                  >
                    <img 
                      src={imageUrl}
                      alt={`Memory ${photoIdx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
          
          {/* Placeholder circles when no images */}
          {allImages.length === 0 && (
            <div className="grid grid-cols-3 gap-4 px-6">
              {[0, 1, 2, 3, 4, 5].map((idx) => (
                <motion.div
                  key={idx}
                  className="w-20 h-20 flex items-center justify-center"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 0.5 }}
                  transition={{ delay: 1.8 + (idx * 0.1) }}
                >
                  <div className="w-16 h-16 rounded-full bg-[#233038] border-4 border-[#075056] flex items-center justify-center flex-shrink-0">
                    <img src="/images/camera.webp" alt="Photo" className="w-8 h-8 opacity-40" />
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
        

      </div>
    </div>
  );
}

function QuarterIntroSlide({ quarter, quarterName, count, destinations }: { quarter: QuarterKey; quarterName: string; count: number; destinations: TravelDestination[] }) {
  const info = QUARTER_CONTEXT[quarter];
  
  // Memoize the random fact so it doesn't change on re-renders
  const randomFact = useMemo(() => getRandomItem(info.funFacts), [quarter]);
  
  // Calculate total photos for this quarter
  const photoCount = destinations.reduce((sum, dest) => sum + dest.images.length, 0);
  
  // Count-up animation states
  const [placesCount, setPlacesCount] = useState(0);
  const [memoriesCount, setMemoriesCount] = useState(0);
  
  useEffect(() => {
    // Delay start to sync with animation
    const startDelay = setTimeout(() => {
      // Count up animation for Places
      let placesValue = 0;
      const placesInterval = setInterval(() => {
        placesValue += 1;
        if (placesValue >= count) {
          setPlacesCount(count);
          clearInterval(placesInterval);
        } else {
          setPlacesCount(placesValue);
        }
      }, 150);
      
      // Count up animation for Memories
      let memoriesValue = 0;
      const memoriesInterval = setInterval(() => {
        memoriesValue += 1;
        if (memoriesValue >= photoCount) {
          setMemoriesCount(photoCount);
          clearInterval(memoriesInterval);
        } else {
          setMemoriesCount(memoriesValue);
        }
      }, 80);
      
      return () => {
        clearInterval(placesInterval);
        clearInterval(memoriesInterval);
      };
    }, 2000);
    
    return () => clearTimeout(startDelay);
  }, [count, photoCount]);
  
  return (
    <div className="absolute inset-0 bg-[#0B0101] overflow-hidden">
      {/* Single glow at bottom-right */}
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-[#FF5B04]/30 via-[#2563EB]/20 to-transparent rounded-full blur-3xl" />
      
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8 text-[#FDF6E3]">
        {/* Large 3D seasonal image - rotate + scale in */}
        <motion.img 
          src={info.emoji} 
          alt={quarter} 
          className="w-32 h-32 mb-4 object-contain mx-auto"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 150, damping: 12, duration: 1.2 }}
        />
        
        {/* Quarter badge - slide in from top */}
        <motion.div 
          className="bg-[#FF5B04] text-white px-6 py-2 rounded-full font-bold mb-4 shadow-lg shadow-[#FF5B04]/30"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, type: "spring", duration: 0.6 }}
        >
          {quarter}
        </motion.div>
        
        {/* Subtitle */}
        <motion.p 
          className="text-[#D3DBDD] text-lg mb-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          {info.subtitle}
        </motion.p>
        
        {/* Title - character reveal effect */}
        <motion.h2 
          className="text-4xl font-bold text-[#FDF6E3] mb-3 text-center"
          initial={{ opacity: 0, letterSpacing: "0.5em" }}
          animate={{ opacity: 1, letterSpacing: "0em" }}
          transition={{ delay: 1.0, duration: 1.2 }}
        >
          {quarterName}
        </motion.h2>
        
        {/* Fun fact - typewriter style */}
        <motion.p 
          className="text-[#F4D47C] text-xl mb-8 text-center font-medium"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8, duration: 0.6 }}
        >
          {randomFact}
        </motion.p>
        
        {/* Stats with count-up animation */}
        <div className="flex gap-12 mb-8">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 2.0, type: "spring", duration: 0.6 }}
          >
            <div className="text-[#FF5B04] text-6xl font-bold mb-2">
              {placesCount}
            </div>
            <div className="text-[#D3DBDD] text-lg">
              {count === 1 ? 'Place' : 'Places'}
            </div>
          </motion.div>
          
          {photoCount > 0 && (
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 2.2, type: "spring", duration: 0.6 }}
            >
              <div className="text-[#2563EB] text-6xl font-bold mb-2">
                {memoriesCount}
              </div>
              <div className="text-[#D3DBDD] text-lg">
                {photoCount === 1 ? 'Memory' : 'Memories'}
              </div>
            </motion.div>
          )}
        </div>
        
        {/* Destination pills - new style with number circle */}
        <div className="flex flex-wrap gap-3 justify-center max-w-2xl px-4">
          {destinations.map((dest, idx) => (
            <motion.div
              key={dest.id}
              className="bg-[#075056] rounded-full px-5 py-3 flex items-center gap-3"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 3.0 + (idx * 0.12), duration: 0.4, type: "spring" }}
              whileHover={{ scale: 1.05 }}
            >
              {/* Number circle inside pill */}
              <div className="w-8 h-8 rounded-full bg-[#FF5B04] flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-bold">
                  {dest.images.length}
                </span>
              </div>
              
              {/* Location text */}
              <span className="text-[#FDF6E3] font-medium">
                {dest.type === 'city' 
                  ? `${dest.name}, ${dest.country}`
                  : dest.name
                }
              </span>
            </motion.div>
          ))}
        </div>
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
    <div className="absolute inset-0 bg-black flex flex-col items-center justify-center overflow-hidden">
      {images.length > 0 ? (
        <div className="relative w-full h-full">
          {/* Full-screen image with Ken Burns zoom effect */}
          <AnimatePresence mode="wait">
            <motion.img 
              key={currentImageIndex}
              src={images[currentImageIndex]} 
              alt={displayName}
              className="w-full h-full object-cover"
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1.05 }}
              exit={{ opacity: 0 }}
              transition={{ 
                opacity: { duration: 0.5 },
                scale: { duration: 8, ease: "linear" }
              }}
            />
          </AnimatePresence>
          
          {/* Top badges */}
          <div className="absolute top-20 left-6 right-6 flex justify-between items-start z-10">
            {/* Quarter & Month badge - slide in from left */}
            <motion.div 
              className="bg-[#FF5B04] text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 shadow-lg"
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
            >
              <span>{quarter}</span>
              {monthName && (
                <>
                  <span>•</span>
                  <span>{monthName}</span>
                </>
              )}
            </motion.div>
            
            {/* Image counter if multiple */}
            {images.length > 1 && (
              <motion.div 
                className="bg-black/60 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-bold"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                {currentImageIndex + 1} / {images.length}
              </motion.div>
            )}
          </div>
          
          {/* Bottom overlay with details */}
          <motion.div 
            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/90 to-transparent p-8 pb-24"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            {/* Location name with letter spacing animation */}
            <motion.h2 
              className="text-white text-4xl font-bold mb-2"
              initial={{ opacity: 0, letterSpacing: "0.3em" }}
              animate={{ opacity: 1, letterSpacing: "0em" }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              {destination.name}
            </motion.h2>
            
            {/* Country if city */}
            {destination.type === 'city' && (
              <motion.p 
                className="text-white/80 text-xl mb-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                {destination.country}
              </motion.p>
            )}
            
            {/* Fun message with accent bar */}
            <motion.div 
              className="flex items-center gap-3 mb-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 }}
            >
              <div className="bg-[#FF5B04] w-2 h-8 rounded-full"></div>
              <p className="text-white/90 text-lg font-medium">{locationMessage}</p>
            </motion.div>
            
            {/* Additional fun fact based on image count */}
            {images.length >= 5 && (
              <motion.p 
                className="text-[#F4D47C] text-sm italic mt-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
              >
                This place clearly made an impression! 🌟
              </motion.p>
            )}
            {images.length >= 10 && (
              <motion.p 
                className="text-[#FF5B04] text-sm font-bold mt-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.4 }}
              >
                <span className="flex items-center gap-1">Top destination of the year! <img src="/images/trophy.webp" alt="Trophy" className="w-4 h-4 inline object-contain" /></span>
              </motion.p>
            )}
          </motion.div>
        </div>
      ) : (
        <motion.div 
          className="text-center p-8"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <StampCard destination={destination} size="lg" isActive />
          <motion.h2 
            className="text-3xl font-bold text-[#FDF6E3] mt-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {displayName}
          </motion.h2>
          <motion.div 
            className="inline-flex items-center gap-2 mt-4 bg-[#FF5B04] px-4 py-2 rounded-full shadow-lg"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, type: "spring" }}
          >
            <span className="text-white font-medium">{quarter}</span>
            {monthName && (
              <>
                <span className="text-white/60">•</span>
                <span className="text-white font-medium">{monthName}</span>
              </>
            )}
          </motion.div>
          <motion.p 
            className="text-[#D3DBDD] mt-4 text-sm flex items-center justify-center gap-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            No photos uploaded for this destination <img src="/images/camera.webp" alt="Camera" className="w-4 h-4 object-contain" />
          </motion.p>
        </motion.div>
      )}
    </div>
  );
}

// Summary Slide 1: Intro Stats
function SummaryIntroSlide({ data, quarterlyData }: { data: TravelRecapData; quarterlyData: QuarterlyData }) {
  const totalPhotos = data.destinations.reduce((sum, d) => sum + d.images.length, 0);
  const countries = [...new Set(data.destinations.map(d => d.country))];
  const cities = data.destinations.filter(d => d.type === 'city');
  
  // Use a consistent random opening (seeded by username)
  const openingIndex = data.profile.username.length % OPENING_LINES.length;
  const randomMessage = OPENING_LINES[openingIndex];
  
  return (
    <div className="absolute inset-0 bg-[#0B0101] flex flex-col items-center justify-center p-8 overflow-hidden">
      {/* Party popper icon - explode in effect */}
      <motion.img 
        src="/images/party-popper.webp" 
        alt="Celebration" 
        className="w-24 h-24 mb-6 object-contain"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
      />
      
      {/* Title - dramatic scale + fade */}
      <motion.h1 
        className="text-5xl font-bold text-[#FDF6E3] mb-3 text-center"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.6, type: "spring" }}
      >
        Your 2025 Journey
      </motion.h1>
      
      {/* Username - slide in from right */}
      <motion.p 
        className="text-[#FF5B04] text-2xl mb-6"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.6 }}
      >
        @{data.profile.username}
      </motion.p>
      
      {/* Powered by */}
      <motion.p 
        className="text-[#D3DBDD] text-sm mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        Powered by Stamped Recap
      </motion.p>
      
      {/* Fun message - typewriter style */}
      <motion.p 
        className="text-[#FDF6E3] text-xl italic mb-12 text-center whitespace-pre-line"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
      >
        {randomMessage}
      </motion.p>
      
      {/* Stats grid - 2x2 with staggered 3D flip reveal */}
      <motion.div 
        className="grid grid-cols-2 gap-4 w-full max-w-md"
        variants={staggerContainerSlow}
        initial="hidden"
        animate="visible"
      >
        <motion.div 
          className="bg-[#233038] rounded-2xl p-6 text-center"
          variants={flip3D}
          transition={{ delay: 1.2 }}
          whileHover={{ scale: 1.05 }}
        >
          <motion.img 
            src="/images/total-destinations.webp" 
            alt="Destinations" 
            className="w-12 h-12 mx-auto mb-3 object-contain"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1.4, type: "spring" }}
          />
          <AnimatedCounter value={data.destinations.length} className="text-[#FF5B04] text-4xl font-bold" />
          <div className="text-[#D3DBDD]">Total Destinations</div>
        </motion.div>
        
        <motion.div 
          className="bg-[#233038] rounded-2xl p-6 text-center"
          variants={flip3D}
          transition={{ delay: 1.4 }}
          whileHover={{ scale: 1.05 }}
        >
          <motion.img 
            src="/images/camera.webp" 
            alt="Photos" 
            className="w-12 h-12 mx-auto mb-3 object-contain"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1.6, type: "spring" }}
          />
          <AnimatedCounter value={totalPhotos} className="text-[#2563EB] text-4xl font-bold" />
          <div className="text-[#D3DBDD]">Memories Captured</div>
        </motion.div>
        
        <motion.div 
          className="bg-[#233038] rounded-2xl p-6 text-center"
          variants={flip3D}
          transition={{ delay: 1.6 }}
          whileHover={{ scale: 1.05 }}
        >
          <motion.img 
            src="/images/world-map.webp" 
            alt="Countries" 
            className="w-12 h-12 mx-auto mb-3 object-contain"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1.8, type: "spring" }}
          />
          <AnimatedCounter value={countries.length} className="text-[#F4D47C] text-4xl font-bold" />
          <div className="text-[#D3DBDD]">{countries.length === 1 ? 'Country' : 'Countries'}</div>
        </motion.div>
        
        <motion.div 
          className="bg-[#233038] rounded-2xl p-6 text-center"
          variants={flip3D}
          transition={{ delay: 1.8 }}
          whileHover={{ scale: 1.05 }}
        >
          <motion.img 
            src="/images/city-skyline.webp" 
            alt="Cities" 
            className="w-12 h-12 mx-auto mb-3 object-contain"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 2, type: "spring" }}
          />
          <AnimatedCounter value={cities.length} className="text-[#075056] text-4xl font-bold" />
          <div className="text-[#D3DBDD]">{cities.length === 1 ? 'City' : 'Cities'}</div>
        </motion.div>
      </motion.div>
    </div>
  );
}

// Summary Slide 2: Top Spot
function TopSpotSlide({ data }: { data: TravelRecapData }) {
  // Find most visited place (most photos)
  const mostVisited = data.destinations.length > 0 
    ? data.destinations.reduce((max, d) => d.images.length > max.images.length ? d : max)
    : null;
  
  if (!mostVisited || mostVisited.images.length === 0) {
    return (
      <motion.div 
        className="absolute inset-0 bg-gradient-to-br from-[#FF5B04] to-[#E54F03] flex flex-col items-center justify-center p-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.img 
          src="/images/trophy.webp" 
          alt="Trophy" 
          className="w-24 h-24 mb-6 object-contain"
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
        />
        <motion.h2 
          className="text-white text-2xl font-bold mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Your Top Spot
        </motion.h2>
        <motion.p 
          className="text-white/80 text-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          No photos uploaded yet!
        </motion.p>
        <motion.p 
          className="text-white/60 mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          Add photos to see your favorite destination
        </motion.p>
      </motion.div>
    );
  }
  
  return (
    <div className="absolute inset-0 bg-gradient-to-br from-[#FF5B04] to-[#E54F03] flex flex-col items-center justify-center p-8 overflow-hidden">
      {/* Trophy icon - drop from top + bounce + shine */}
      <motion.img 
        src="/images/trophy.webp" 
        alt="Trophy" 
        className="w-24 h-24 mb-6 object-contain"
        initial={{ y: -200, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
      />
      
      {/* Header - slide in from left */}
      <motion.h2 
        className="text-white text-2xl font-bold mb-12 flex items-center gap-2"
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.3, type: "spring" }}
      >
        <img src="/images/trophy.webp" alt="Trophy" className="w-8 h-8 object-contain" />
        Your Top Spot
      </motion.h2>
      
      {/* Location name - split reveal with glow */}
      <motion.h1 
        className="text-white text-6xl font-bold text-center mb-6"
        initial={{ opacity: 0, letterSpacing: "0.5em", textShadow: "0 0 0px rgba(255,255,255,0)" }}
        animate={{ opacity: 1, letterSpacing: "0em", textShadow: "0 0 30px rgba(255,255,255,0.5)" }}
        transition={{ delay: 0.6, duration: 1 }}
      >
        {mostVisited.name}
      </motion.h1>
      
      {/* Country if city */}
      {mostVisited.type === 'city' && (
        <motion.p 
          className="text-white/90 text-3xl mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          {mostVisited.country}
        </motion.p>
      )}
      
      {/* Stats - typewriter with emoji pop */}
      <motion.p 
        className="text-white text-2xl flex items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.3 }}
      >
        {mostVisited.images.length} photos • You couldn't get enough! 
        <motion.img 
          src="/images/party-popper.webp" 
          alt="Love" 
          className="w-8 h-8 object-contain"
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 1.6, type: "spring", stiffness: 300 }}
        />
      </motion.p>
    </div>
  );
}

// Summary Slide 3: Busiest Quarter
function BusiestQuarterSlide({ quarterlyData }: { quarterlyData: QuarterlyData }) {
  const activeQuarters = (['Q1', 'Q2', 'Q3', 'Q4'] as QuarterKey[]).filter(q => quarterlyData[q].length > 0);
  
  if (activeQuarters.length === 0) {
    return (
      <motion.div 
        className="absolute inset-0 bg-gradient-to-br from-[#2563EB] to-[#1E40AF] flex flex-col items-center justify-center p-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.img 
          src="/images/calendar.webp" 
          alt="Calendar" 
          className="w-24 h-24 mb-6 object-contain"
          initial={{ rotateY: 90, opacity: 0 }}
          animate={{ rotateY: 0, opacity: 1 }}
          transition={{ type: "spring" }}
        />
        <motion.h2 
          className="text-white text-2xl font-bold mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Busiest Quarter
        </motion.h2>
        <motion.p 
          className="text-white/80 text-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          No destinations tagged yet!
        </motion.p>
      </motion.div>
    );
  }
  
  const busiestQuarter = activeQuarters.reduce((max, q) => 
    quarterlyData[q].length > quarterlyData[max].length ? q : max, activeQuarters[0]);
  
  return (
    <div className="absolute inset-0 bg-gradient-to-br from-[#2563EB] to-[#1E40AF] flex flex-col items-center justify-center p-8 overflow-hidden">
      {/* Calendar icon - flip in */}
      <motion.img 
        src="/images/calendar.webp" 
        alt="Calendar" 
        className="w-24 h-24 mb-6 object-contain"
        initial={{ rotateY: 90, opacity: 0 }}
        animate={{ rotateY: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200 }}
      />
      
      {/* Header */}
      <motion.h2 
        className="text-white text-2xl font-bold mb-12 flex items-center gap-2"
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <img src="/images/calendar.webp" alt="Calendar" className="w-8 h-8 object-contain" />
        Busiest Quarter
      </motion.h2>
      
      {/* Quarter name - pulse + glow */}
      <motion.h1 
        className="text-white text-6xl font-bold mb-6"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ 
          scale: 1, 
          opacity: 1,
          textShadow: ["0 0 0px rgba(255,255,255,0)", "0 0 20px rgba(255,255,255,0.5)", "0 0 0px rgba(255,255,255,0)"]
        }}
        transition={{ 
          scale: { delay: 0.5, type: "spring" },
          textShadow: { delay: 0.8, duration: 1.5, repeat: Infinity }
        }}
      >
        {busiestQuarter}
      </motion.h1>
      
      {/* Quarter name - letter spacing expand */}
      <motion.p 
        className="text-white/90 text-3xl mb-12"
        initial={{ opacity: 0, letterSpacing: "-0.1em" }}
        animate={{ opacity: 1, letterSpacing: "0.05em" }}
        transition={{ delay: 0.8, duration: 0.6 }}
      >
        {QUARTER_NAMES[busiestQuarter]}
      </motion.p>
      
      {/* Stats - count up */}
      <motion.p 
        className="text-white text-2xl mb-8 flex items-center gap-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
      >
        {quarterlyData[busiestQuarter].length} destinations • You were on fire! 🔥
      </motion.p>
      
      {/* Quarter breakdown mini grid - wave cascade */}
      <motion.div 
        className="grid grid-cols-4 gap-3 mt-8"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4 }}
      >
        {(['Q1', 'Q2', 'Q3', 'Q4'] as QuarterKey[]).map((q, i) => (
          <motion.div 
            key={q} 
            className={`rounded-xl p-4 text-center ${q === busiestQuarter ? 'bg-white' : 'bg-white/20'}`}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: 1, 
              opacity: 1,
              boxShadow: q === busiestQuarter ? ["0 0 0px rgba(255,255,255,0)", "0 0 15px rgba(255,255,255,0.5)", "0 0 0px rgba(255,255,255,0)"] : "none"
            }}
            transition={{ 
              delay: 1.5 + i * 0.1, 
              type: "spring",
              boxShadow: q === busiestQuarter ? { delay: 1.8, duration: 1.5, repeat: Infinity } : {}
            }}
            whileHover={{ scale: 1.1 }}
          >
            <div className={`text-3xl font-bold ${q === busiestQuarter ? 'text-[#2563EB]' : 'text-white'}`}>
              {quarterlyData[q]?.length || 0}
            </div>
            <div className={`text-sm ${q === busiestQuarter ? 'text-[#2563EB]' : 'text-white/80'}`}>{q}</div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

// Summary Slide 4: Quarter by Quarter
function QuarterBreakdownSlide({ quarterlyData }: { quarterlyData: QuarterlyData }) {
  return (
    <div className="absolute inset-0 bg-[#0B0101] flex flex-col items-center justify-center p-8 overflow-hidden">
      {/* Header - slide in */}
      <motion.h2 
        className="text-[#FDF6E3] text-3xl font-bold mb-8 text-center flex items-center gap-2"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring" }}
      >
        <motion.img 
          src="/images/chart.webp" 
          alt="Chart" 
          className="w-10 h-10 object-contain"
          initial={{ rotate: -90, scale: 0 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
        />
        Quarter by Quarter
      </motion.h2>
      
      {/* Large quarter grid - 3D flip reveal in sequence */}
      <motion.div 
        className="grid grid-cols-2 gap-6 w-full max-w-md"
        variants={staggerContainerSlow}
        initial="hidden"
        animate="visible"
      >
        {(['Q1', 'Q2', 'Q3', 'Q4'] as QuarterKey[]).map((q, i) => (
          <motion.div 
            key={q} 
            className="bg-[#233038] rounded-2xl p-8 text-center border-2 border-[#075056]"
            variants={flip3D}
            transition={{ delay: 0.4 + i * 0.2 }}
            whileHover={{ scale: 1.05, borderColor: "#FF5B04" }}
          >
            <AnimatedCounter value={quarterlyData[q]?.length || 0} className="text-[#FF5B04] text-7xl font-bold mb-3" />
            <motion.div 
              className="text-[#D3DBDD] text-xl font-semibold"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 + i * 0.2 }}
            >
              {q}
            </motion.div>
            <motion.div 
              className="text-[#D3DBDD]/60 text-sm mt-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 + i * 0.2 }}
            >
              {quarterlyData[q]?.length === 1 ? 'place' : 'places'}
            </motion.div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

// Summary Slide 5: Stamp Collection + Download
function StampCollectionSlide({ data, onShare, onRestart }: { data: TravelRecapData; onShare: () => void; onRestart: () => void }) {
  return (
    <div className="absolute inset-0 bg-[#0B0101] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
      <div className="p-8 pb-32">
        {/* Header - slide in */}
        <motion.h2 
          className="text-[#FDF6E3] text-3xl font-bold mb-6 text-center flex items-center justify-center gap-2"
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring" }}
        >
          <motion.img 
            src="/images/stamp.webp" 
            alt="Stamp" 
            className="w-10 h-10 object-contain"
            initial={{ rotate: -45, scale: 0 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
          />
          Your Stamp Collection
        </motion.h2>
        
        {data.destinations.length > 0 ? (
          <>
            {/* Stamps grid - masonry cascade with stamp thud effect */}
            <motion.div 
              className="grid grid-cols-2 gap-4 mb-8"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              {data.destinations.map((dest, i) => (
                <motion.div
                  key={dest.id}
                  variants={stampThud}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  whileHover={{ scale: 1.05, rotate: 2 }}
                >
                  <StampCard destination={dest} />
                </motion.div>
              ))}
            </motion.div>
            
            {/* Final message - slide up from bottom */}
            <motion.div 
              className="bg-[#075056] border-l-4 border-[#F4D47C] rounded-lg p-6 text-center mb-6"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 + data.destinations.length * 0.1 }}
            >
              <p className="text-[#FDF6E3] text-xl mb-2 flex items-center justify-center gap-2">
                What a year, @{data.profile.username}! 
                <motion.img 
                  src="/images/party-popper.webp" 
                  alt="Party" 
                  className="w-6 h-6 object-contain"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.8 + data.destinations.length * 0.1, type: "spring" }}
                />
              </p>
              <p className="text-[#D3DBDD] flex items-center justify-center gap-1">
                Can't wait to see where 2026 takes you! 
                <motion.img 
                  src="/images/airplane.webp" 
                  alt="Plane" 
                  className="w-5 h-5 object-contain"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 1 + data.destinations.length * 0.1 }}
                />
              </p>
            </motion.div>
          </>
        ) : (
          <motion.div 
            className="text-center py-12"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.img 
              src="/images/world-map.webp" 
              alt="World Map" 
              className="w-16 h-16 mb-4 mx-auto object-contain"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring" }}
            />
            <div className="w-20 h-20 bg-[#233038] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-10 h-10 text-[#D3DBDD]" />
            </div>
            <motion.p 
              className="text-[#FDF6E3] text-xl font-bold mb-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              No destinations tagged yet
            </motion.p>
            <motion.p 
              className="text-[#D3DBDD] text-sm opacity-70"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Go back and tag your travel photos!
            </motion.p>
            <motion.p 
              className="text-[#F4D47C] text-sm mt-4 italic flex items-center justify-center gap-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              Your adventure awaits! 
              <img src="/images/party-popper.webp" alt="Sparkles" className="w-4 h-4 object-contain" />
            </motion.p>
          </motion.div>
        )}
      </div>
      
      {/* Fixed bottom buttons - staggered scale in */}
      <motion.div 
        className="fixed bottom-0 left-0 right-0 bg-[#233038] p-6 space-y-3"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.8, type: "spring" }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1 }}
          whileHover={{ scale: data.destinations.length > 0 ? 1.02 : 1 }}
          whileTap={{ scale: data.destinations.length > 0 ? 0.98 : 1 }}
        >
          <Button 
            onClick={onShare}
            disabled={data.destinations.length === 0}
            className="w-full h-14 bg-[#FF5B04] hover:bg-[#E54F03] rounded-xl font-bold text-lg disabled:bg-[#233038] disabled:text-[#D3DBDD] transition-all"
          >
            <Download className="w-6 h-6 mr-2" />
            Download My Recap
          </Button>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.1 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button 
            onClick={onRestart}
            variant="outline"
            className="w-full h-14 border-2 border-[#D3DBDD] text-[#D3DBDD] hover:border-[#FF5B04] hover:text-[#FF5B04] bg-transparent rounded-xl font-semibold text-lg transition-all"
          >
            Create Another
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
