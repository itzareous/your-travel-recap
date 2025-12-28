import { Button } from "@/components/ui/button";
import { ArrowRight, Plane, MapPin, Sparkles, Globe, Camera, Download } from "lucide-react";

interface WelcomeScreenProps {
  onStart: () => void;
}

const headlines = [
  "Your 2025 journey wasn't left behind",
  "Create a recap of your 2025 adventures",
  "Turn your 2025 travels into a story",
  "Every trip has a story. What's yours?",
  "Your adventures deserve more than just photos"
];

export default function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  // Pick a random headline on mount
  const headline = headlines[Math.floor(Math.random() * headlines.length)];

  return (
    <div className="min-h-screen bg-[#0B0101] relative overflow-hidden flex flex-col items-center justify-center p-6">
      {/* Decorative floating elements - solid colors */}
      <Plane className="absolute top-20 left-10 text-[#FF5B04] opacity-20 w-16 h-16 rotate-12" />
      <Plane className="absolute bottom-32 right-20 text-[#2563EB] opacity-30 w-12 h-12 -rotate-45" />
      <MapPin className="absolute top-40 right-32 text-[#F4D47C] opacity-25 w-14 h-14" />
      <Globe className="absolute bottom-20 left-16 text-[#075056] opacity-40 w-20 h-20" />
      <Sparkles className="absolute top-1/4 right-10 text-[#F4D47C] opacity-20 w-10 h-10" />
      <Plane className="absolute top-1/3 left-1/4 text-[#2563EB] opacity-15 w-8 h-8 rotate-90" />

      {/* Main card */}
      <div className="max-w-2xl w-full mx-auto bg-[#233038] rounded-3xl p-8 md:p-12 border border-[#075056] relative z-10">
        {/* Icon */}
        <div className="w-20 h-20 bg-[#075056] rounded-2xl flex items-center justify-center mx-auto mb-8">
          <Plane className="w-10 h-10 text-[#FF5B04]" />
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-[#FDF6E3] text-center mb-4">
          {headline}
        </h1>
        
        {/* Decorative bar */}
        <div className="w-24 h-2 bg-[#FF5B04] mx-auto rounded-full mb-6" />
        
        {/* Subtitle */}
        <p className="text-lg text-[#D3DBDD] text-center mb-8 max-w-lg mx-auto">
          Transform your travel memories into a stunning visual story. From spontaneous weekend trips to epic adventures—every moment matters.
        </p>

        {/* Feature bullets */}
        <div className="space-y-3 mb-10 max-w-md mx-auto">
          <div className="flex items-center gap-3 text-[#D3DBDD]">
            <Camera className="w-5 h-5 text-[#2563EB] flex-shrink-0" />
            <span className="text-sm">Upload your photos and we'll detect locations</span>
          </div>
          <div className="flex items-center gap-3 text-[#D3DBDD]">
            <MapPin className="w-5 h-5 text-[#FF5B04] flex-shrink-0" />
            <span className="text-sm">Tag places you've been—cities or countries</span>
          </div>
          <div className="flex items-center gap-3 text-[#D3DBDD]">
            <Sparkles className="w-5 h-5 text-[#F4D47C] flex-shrink-0" />
            <span className="text-sm">Get a beautiful Instagram-ready story</span>
          </div>
          <div className="flex items-center gap-3 text-[#D3DBDD]">
            <Download className="w-5 h-5 text-[#2563EB] flex-shrink-0" />
            <span className="text-sm">Download and share instantly—no signup required</span>
          </div>
        </div>

        {/* CTA Button */}
        <Button 
          onClick={onStart}
          className="w-full bg-[#FF5B04] hover:bg-[#E54F03] text-white font-semibold text-lg px-8 py-6 rounded-full transition-all duration-300 hover:scale-[1.02]"
        >
          <Sparkles className="w-5 h-5 mr-2" />
          Create My Stamped Recap
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
        
        {/* Helper text */}
        <p className="text-sm text-[#D3DBDD] text-center mt-4 opacity-70">
          No sign-up required • Share instantly
        </p>
      </div>

      {/* Footer */}
      <div className="absolute bottom-6 text-center text-[#D3DBDD] text-sm opacity-50 flex items-center justify-center gap-1">
        <img src="/images/airplane.webp" alt="Plane" className="w-4 h-4 inline object-contain" /> Where did your adventures take you? | Stamped Recap 2025
      </div>
    </div>
  );
}
