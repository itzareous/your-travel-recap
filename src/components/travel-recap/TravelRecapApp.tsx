import { useState } from "react";
import { TravelRecapData, TravelDestination, UserProfile } from "./types";
import WelcomeScreen from "./WelcomeScreen";
import ProfileSetup from "./ProfileSetup";
import DestinationSelector from "./DestinationSelector";
import RecapStory from "./RecapStory";

type Step = 'welcome' | 'profile' | 'destinations' | 'story';

export default function TravelRecapApp() {
  const [step, setStep] = useState<Step>('welcome');
  const [recapData, setRecapData] = useState<TravelRecapData>({
    profile: { username: '', platform: 'none' },
    destinations: [],
    year: 2025
  });

  const handleProfileComplete = (profile: UserProfile) => {
    setRecapData(prev => ({ ...prev, profile }));
    setStep('destinations');
  };

  const handleDestinationsComplete = (destinations: TravelDestination[]) => {
    setRecapData(prev => ({ ...prev, destinations }));
    setStep('story');
  };

  const handleRestart = () => {
    setRecapData({
      profile: { username: '', platform: 'none' },
      destinations: [],
      year: 2025
    });
    setStep('welcome');
  };

  return (
    <div className="min-h-screen">
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
      {step === 'destinations' && (
        <DestinationSelector
          onNext={handleDestinationsComplete}
          onBack={() => setStep('profile')}
          initialDestinations={recapData.destinations}
        />
      )}
      {step === 'story' && (
        <RecapStory
          data={recapData}
          onBack={() => setStep('destinations')}
          onRestart={handleRestart}
        />
      )}
    </div>
  );
}
