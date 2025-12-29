import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TravelRecapData, TravelDestination, TravelImage, UserProfile } from "./types";
import WelcomeScreen from "./WelcomeScreen";
import ProfileSetup from "./ProfileSetup";
import ImageUploader from "./ImageUploader";
import TaggingIntro from "./TaggingIntro";
import LocationTagger from "./LocationTagger";
import RecapStory from "./RecapStory";

type Step = 'welcome' | 'profile' | 'upload' | 'tagging-intro' | 'tag' | 'story';

// Page transition variants
const pageVariants = {
  initial: { opacity: 0, x: 50 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -50 }
};

const pageTransition = {
  type: "tween",
  ease: "easeInOut",
  duration: 0.3
};

export default function TravelRecapApp() {
  const [step, setStep] = useState<Step>('welcome');
  const [images, setImages] = useState<TravelImage[]>([]);
  const [recapData, setRecapData] = useState<TravelRecapData>({
    profile: { username: '', platform: 'none' },
    destinations: [],
    year: 2025
  });

  const handleProfileComplete = (profile: UserProfile) => {
    setRecapData(prev => ({ ...prev, profile }));
    setStep('upload');
  };

  const handleImagesUploaded = (uploadedImages: TravelImage[]) => {
    setImages(uploadedImages);
    setStep('tagging-intro');
  };

  const handleTaggingComplete = (destinations: TravelDestination[]) => {
    setRecapData(prev => ({ ...prev, destinations }));
    setStep('story');
  };

  const handleRestart = () => {
    setRecapData({
      profile: { username: '', platform: 'none' },
      destinations: [],
      year: 2025
    });
    setImages([]);
    setStep('welcome');
  };

  const geoTaggedCount = images.filter(img => img.geoTag).length;

  return (
    <div className="min-h-screen bg-[#0B0101] text-[#FDF6E3]">
      {step === 'welcome' && (
        <WelcomeScreen onStart={() => setStep('profile')} />
      )}
      {step === 'profile' && (
        <ProfileSetup 
          onNext={handleProfileComplete}
          onBack={() => setStep('welcome')}
          initialProfile={recapData.profile}
        />
      )}
      {step === 'upload' && (
        <ImageUploader
          onNext={handleImagesUploaded}
          onBack={() => setStep('profile')}
          initialImages={images}
        />
      )}
      {step === 'tagging-intro' && (
        <TaggingIntro
          imageCount={images.length}
          geoTaggedCount={geoTaggedCount}
          onContinue={() => setStep('tag')}
          onBack={() => setStep('upload')}
        />
      )}
      {step === 'tag' && (
        <LocationTagger
          images={images}
          onComplete={handleTaggingComplete}
          onBack={() => setStep('tagging-intro')}
        />
      )}
      {step === 'story' && (
        <RecapStory
          data={recapData}
          onBack={() => setStep('tag')}
          onRestart={handleRestart}
        />
      )}
    </div>
  );
}
