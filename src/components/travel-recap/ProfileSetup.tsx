import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserProfile } from "./types";
import { ArrowLeft, ArrowRight, User } from "lucide-react";
import { fadeInUp, scaleInBounce, rotateIn } from "@/utils/animations";

interface ProfileSetupProps {
  onNext: (profile: UserProfile) => void;
  onBack: () => void;
  initialProfile?: UserProfile;
}

// Word animation component
const AnimatedWord = ({ word, index }: { word: string; index: number }) => (
  <motion.span
    className="inline-block mr-2"
    initial={{ opacity: 0, y: 30, rotateX: -60 }}
    animate={{ opacity: 1, y: 0, rotateX: 0 }}
    transition={{
      duration: 0.5,
      delay: 0.5 + index * 0.08,
      ease: [0.34, 1.56, 0.64, 1]
    }}
  >
    {word}
  </motion.span>
);

export default function ProfileSetup({
  onNext,
  onBack,
  initialProfile,
}: ProfileSetupProps) {
  const [username, setUsername] = useState(initialProfile?.username || "");
  const [progressWidth, setProgressWidth] = useState(0);

  useEffect(() => {
    // Animate progress bar on mount
    const timer = setTimeout(() => setProgressWidth(25), 300);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = () => {
    if (username.trim()) {
      onNext({ username: username.trim(), platform: "none" });
    }
  };

  const headingWords = "Let's personalize your Stamped Recap".split(" ");

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
          className="text-sm text-[#D3DBDD] font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Step 1 of 4
        </motion.span>
        <div className="w-10" />
      </motion.div>
      
      {/* Progress bar */}
      <div className="px-6">
        <div className="h-2 bg-[#233038] rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-[#FF5B04] rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressWidth}%` }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          />
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 flex flex-col justify-center p-6 max-w-md mx-auto w-full">
        <div className="text-center mb-8">
          <motion.div 
            className="inline-flex items-center justify-center w-20 h-20 bg-[#075056] rounded-full mb-6"
            variants={rotateIn}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2 }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, type: "spring", stiffness: 300 }}
            >
              <User className="w-10 h-10 text-[#ffffff]" />
            </motion.div>
          </motion.div>
          
          <h2 className="text-3xl font-bold text-[#FDF6E3] mb-2 overflow-hidden">
            {headingWords.map((word, index) => (
              <AnimatedWord key={index} word={word} index={index} />
            ))}
          </h2>
          
          <motion.p 
            className="text-[#D3DBDD]"
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 1.2 }}
          >
            Add your username so friends can find you
          </motion.p>
        </div>

        {/* Username Input */}
        <motion.div 
          className="space-y-3 mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 0.5 }}
        >
          <Label htmlFor="username" className="text-[#FDF6E3] font-medium">
            Your username
          </Label>
          <motion.div
            whileFocus={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              className="h-14 text-lg rounded-xl bg-[#0B0101] border-[#075056] text-[#FDF6E3] placeholder:text-[#D3DBDD] focus:border-[#FF5B04] focus:ring-[#FF5B04]"
            />
          </motion.div>
        </motion.div>
      </div>
      
      {/* Footer */}
      <motion.div 
        className="p-6"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.6, duration: 0.5, type: "spring" }}
      >
        <motion.div
          whileHover={{ scale: username.trim() ? 1.02 : 1 }}
          whileTap={{ scale: username.trim() ? 0.98 : 1 }}
        >
          <Button
            onClick={handleSubmit}
            disabled={!username.trim()}
            className="w-full h-14 text-lg font-semibold rounded-full bg-[#FF5B04] hover:bg-[#E54F03] text-white disabled:bg-[#233038] disabled:text-[#D3DBDD] transition-colors"
          >
            Continue
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
