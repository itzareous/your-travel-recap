import { useState } from "react";
import { TravelRecapData, TravelDestination, TravelImage, UserProfile } from "./types";
import WelcomeScreen from "./WelcomeScreen";
import ProfileSetup from "./ProfileSetup";
import ImageUploader from "./ImageUploader";
import TaggingIntro from "./TaggingIntro";
import LocationTagger from "./LocationTagger";
import RecapStory from "./RecapStory";

type Step = 'welcome' | 'profile' | 'upload' | 'tagging-intro' | 'tag' | 'story';

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
    <div className="min-h-screen bg-[#0F172A] text-[#FDF6E3]">
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
