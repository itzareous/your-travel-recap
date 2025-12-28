import { MapPin, Camera, Check, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TaggingIntroProps {
  imageCount: number;
  geoTaggedCount: number;
  onContinue: () => void;
  onBack: () => void;
}

export default function TaggingIntro({ imageCount, geoTaggedCount, onContinue, onBack }: TaggingIntroProps) {
  return (
    <div className="min-h-screen bg-[#0B0101] flex flex-col">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-[#233038] rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-[#D3DBDD]" />
        </button>
        <span className="text-sm text-[#D3DBDD]">Step 3 of 4</span>
        <div className="w-10" />
      </div>

      {/* Progress bar */}
      <div className="px-6 mb-4">
        <div className="h-2 bg-[#233038] rounded-full overflow-hidden">
          <div className="h-full w-2/4 bg-[#FF5B04] rounded-full" />
        </div>
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="max-w-2xl mx-auto text-center">
          {/* Icon */}
          <div className="w-20 h-20 bg-[#075056] rounded-2xl flex items-center justify-center mx-auto mb-8">
            <MapPin className="w-10 h-10 text-[#FF5B04]" />
          </div>
          
          {/* Title */}
          <h1 className="text-4xl font-bold text-[#FDF6E3] mb-4">
            Let's Tag Your Locations
          </h1>
          
          {/* Description */}
          <p className="text-lg text-[#D3DBDD] mb-8">
            {geoTaggedCount > 0 ? (
              <>We found location data in <span className="text-[#F4D47C] font-semibold">{geoTaggedCount}</span> of your <span className="text-[#FDF6E3] font-semibold">{imageCount}</span> photos. Let's confirm and complete the rest!</>
            ) : (
              <>You uploaded <span className="text-[#FDF6E3] font-semibold">{imageCount}</span> photos. Let's tag where each one was taken!</>
            )}
          </p>
          
          {/* Info cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
            <div className="bg-[#233038] rounded-xl p-6 border border-[#075056]">
              <Camera className="w-8 h-8 text-[#2563EB] mx-auto mb-3" />
              <p className="text-[#D3DBDD] text-sm">
                We'll show you each photo one by one
              </p>
            </div>
            
            <div className="bg-[#233038] rounded-xl p-6 border border-[#075056]">
              <MapPin className="w-8 h-8 text-[#FF5B04] mx-auto mb-3" />
              <p className="text-[#D3DBDD] text-sm">
                Confirm detected locations or add them manually
              </p>
            </div>
            
            <div className="bg-[#233038] rounded-xl p-6 border border-[#075056]">
              <Check className="w-8 h-8 text-[#F4D47C] mx-auto mb-3" />
              <p className="text-[#D3DBDD] text-sm">
                Takes just a few seconds per photo
              </p>
            </div>
          </div>
          
          {/* CTA */}
          <Button
            onClick={onContinue}
            className="bg-[#FF5B04] hover:bg-[#E54F03] text-white font-semibold px-12 py-6 rounded-full transition-all text-lg"
          >
            Let's Go! →
          </Button>
        </div>
      </div>
    </div>
  );
}
