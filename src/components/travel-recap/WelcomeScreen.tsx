import { Button } from "@/components/ui/button";
import { Plane, MapPin, Sparkles } from "lucide-react";

interface WelcomeScreenProps {
  onStart: () => void;
}

export default function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 flex flex-col items-center justify-center p-6 text-white">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 animate-bounce delay-100">
          <Plane className="w-8 h-8 text-white/30" />
        </div>
        <div className="absolute top-40 right-20 animate-bounce delay-300">
          <MapPin className="w-6 h-6 text-white/20" />
        </div>
        <div className="absolute bottom-40 left-20 animate-bounce delay-500">
          <Sparkles className="w-10 h-10 text-white/25" />
        </div>
        <div className="absolute bottom-20 right-10 animate-bounce delay-700">
          <Plane className="w-12 h-12 text-white/20 rotate-45" />
        </div>
      </div>

      <div className="relative z-10 text-center max-w-md">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full mb-6">
            <Plane className="w-12 h-12 text-white" />
          </div>
        </div>

        <h1 className="text-4xl font-bold mb-4">
          Your 2025 Travel Recap
        </h1>
        
        <p className="text-lg text-white/80 mb-8">
          Create a beautiful stamp collection of all the places you've visited this year and share it with your friends!
        </p>

        <div className="flex flex-col gap-4">
          <Button 
            onClick={onStart}
            size="lg"
            className="bg-white text-purple-600 hover:bg-white/90 font-semibold text-lg px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Create My Recap
          </Button>
          
          <p className="text-sm text-white/60">
            No sign-up required • Share instantly
          </p>
        </div>
      </div>

      <div className="absolute bottom-8 text-center text-white/40 text-sm">
        ✈️ Where did your adventures take you?
      </div>
    </div>
  );
}
