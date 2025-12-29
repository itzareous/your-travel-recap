import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MapPin, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { bounceDown, fadeInUp } from "@/utils/animations";

interface TaggingIntroProps {
  imageCount: number;
  geoTaggedCount: number;
  onContinue: () => void;
  onBack: () => void;
}

// Word animation component
const AnimatedWord = ({ word, index }: { word: string; index: number }) => (
  <motion.span
    className="inline-block mr-2"
    initial={{ opacity: 0, y: 30, rotateX: -60 }}
    animate={{ opacity: 1, y: 0, rotateX: 0 }}
    transition={{
      duration: 0.5,
      delay: 0.6 + index * 0.1,
      ease: [0.34, 1.56, 0.64, 1]
    }}
  >
    {word}
  </motion.span>
);

export default function TaggingIntro({ imageCount, geoTaggedCount, onContinue, onBack }: TaggingIntroProps) {
  const [progressWidth, setProgressWidth] = useState(50);

  useEffect(() => {
    const timer = setTimeout(() => setProgressWidth(75), 300);
    return () => clearTimeout(timer);
  }, []);

  const headingWords = "Let's Tag Your Locations".split(" ");

  return (
    <div className="min-h-screen bg-[#0B0101] flex flex-col">
      {/* Header */}
      <motion.div 
        className="p-4 flex items-center justify-between"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <motion.button 
          onClick={onBack}
          className="p-2 hover:bg-[#233038] rounded-full transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <ArrowLeft className="w-6 h-6 text-[#D3DBDD]" />
        </motion.button>
        <motion.span 
          className="text-sm text-[#D3DBDD]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Step 3 of 4
        </motion.span>
        <div className="w-10" />
      </motion.div>

      {/* Progress bar */}
      <div className="px-6 mb-4">
        <div className="h-2 bg-[#233038] rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-[#FF5B04] rounded-full"
            initial={{ width: "50%" }}
            animate={{ width: `${progressWidth}%` }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          />
        </div>
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="max-w-2xl mx-auto text-center">
          {/* Icon - bounce drop from top */}
          <motion.div 
            className="w-20 h-20 bg-[#075056] rounded-2xl flex items-center justify-center mx-auto mb-8"
            variants={bounceDown}
            initial="hidden"
            animate="visible"
          >
            <motion.div
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.4, type: "spring", stiffness: 300 }}
            >
              <MapPin className="w-10 h-10 text-[#FF5B04]" />
            </motion.div>
          </motion.div>
          
          {/* Title - word by word reveal */}
          <h1 className="text-4xl font-bold text-[#FDF6E3] mb-4 overflow-hidden">
            {headingWords.map((word, index) => (
              <AnimatedWord key={index} word={word} index={index} />
            ))}
          </h1>
          
          {/* Description */}
          <motion.p 
            className="text-lg text-[#D3DBDD] mb-8"
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 1.2 }}
          >
            {geoTaggedCount > 0 ? (
              <>We found location data in <span className="text-[#F4D47C] font-semibold">{geoTaggedCount}</span> of your <span className="text-[#FDF6E3] font-semibold">{imageCount}</span> photos. Let's confirm and complete the rest!</>
            ) : (
              <>You uploaded <span className="text-[#FDF6E3] font-semibold">{imageCount}</span> photos. Let's tag where each one was taken!</>
            )}
          </motion.p>
          
          {/* CTA - scale + glow pulse */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              boxShadow: ["0 0 0px rgba(255, 91, 4, 0)", "0 0 30px rgba(255, 91, 4, 0.4)", "0 0 0px rgba(255, 91, 4, 0)"]
            }}
            transition={{ 
              opacity: { delay: 1.4, duration: 0.5 },
              scale: { delay: 1.4, duration: 0.5, type: "spring" },
              boxShadow: { delay: 1.6, duration: 1.5, repeat: Infinity, ease: "easeInOut" }
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={onContinue}
              className="bg-[#FF5B04] hover:bg-[#E54F03] text-white font-semibold px-12 py-6 rounded-full transition-all text-lg"
            >
              Let's Go! →
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
