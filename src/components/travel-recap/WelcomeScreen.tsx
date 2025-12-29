import { motion } from "framer-motion";
import { scaleInBounce, fadeInUp, staggerContainer } from "@/utils/animations";

interface WelcomeScreenProps {
  onStart: () => void;
}

// Word animation component for staggered text reveal
const AnimatedWord = ({ word, index }: { word: string; index: number }) => (
  <motion.span
    className="inline-block mr-3"
    initial={{ opacity: 0, y: 50, rotateX: -90 }}
    animate={{ opacity: 1, y: 0, rotateX: 0 }}
    transition={{
      duration: 0.6,
      delay: 0.8 + index * 0.1,
      ease: [0.34, 1.56, 0.64, 1]
    }}
  >
    {word}
  </motion.span>
);

export default function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  const headingWords = "Create your 2025 travel wrapped".split(" ");

  return (
    <div className="min-h-screen bg-[#0B0101] relative overflow-hidden flex items-center justify-center p-8">
      {/* Animated gradient blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="absolute w-96 h-96 bg-gradient-to-br from-[#FF5B04]/20 to-[#2563EB]/20 rounded-full blur-3xl animate-blob top-0 -left-20"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
        <motion.div 
          className="absolute w-96 h-96 bg-gradient-to-br from-[#2563EB]/20 to-[#075056]/20 rounded-full blur-3xl animate-blob animation-delay-2000 top-0 -right-20"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, delay: 0.3, ease: "easeOut" }}
        />
        <motion.div 
          className="absolute w-96 h-96 bg-gradient-to-br from-[#075056]/20 to-[#FF5B04]/20 rounded-full blur-3xl animate-blob animation-delay-4000 bottom-0 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, delay: 0.6, ease: "easeOut" }}
        />
      </div>

      {/* Content */}
      <motion.div 
        className="relative z-10 max-w-2xl mx-auto text-center"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {/* App icon */}
        <motion.div 
          className="w-24 h-24 bg-[#075056] rounded-3xl flex items-center justify-center mx-auto mb-8"
          variants={scaleInBounce}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.1, rotate: 5 }}
        >
          <motion.img 
            src="/images/logo.svg" 
            alt="Logo" 
            className="w-12 h-12 object-contain"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 300, damping: 15 }}
          />
        </motion.div>
        
        {/* Main heading - word by word reveal */}
        <h1 className="text-5xl md:text-6xl font-bold text-[#FDF6E3] mb-6 overflow-hidden">
          {headingWords.map((word, index) => (
            <AnimatedWord key={index} word={word} index={index} />
          ))}
        </h1>
        
        {/* CTA Button */}
        <motion.button 
          onClick={onStart}
          className="bg-[#FF5B04] hover:bg-[#E54F03] text-white font-bold text-lg px-12 py-5 rounded-full transition-colors duration-300"
          initial={{ opacity: 0, scale: 0.8, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 1.6, duration: 0.5, type: "spring", stiffness: 200 }}
          whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(255, 91, 4, 0.5)" }}
          whileTap={{ scale: 0.95 }}
        >
          Create My Stamped Recap
        </motion.button>
        
        {/* Footer text */}
        <motion.p 
          className="text-[#D3DBDD] text-sm mt-8"
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 2 }}
        >
          No sign-up required • Share instantly
        </motion.p>
      </motion.div>
    </div>
  );
}
