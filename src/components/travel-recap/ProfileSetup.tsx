import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserProfile } from "./types";
import { ArrowLeft, ArrowRight, User } from "lucide-react";

interface ProfileSetupProps {
  onNext: (profile: UserProfile) => void;
  onBack: () => void;
  initialProfile?: UserProfile;
}

export default function ProfileSetup({ onNext, onBack, initialProfile }: ProfileSetupProps) {
  const [username, setUsername] = useState(initialProfile?.username || "");

  const handleSubmit = () => {
    if (username.trim()) {
      onNext({ username: username.trim(), platform: 'none' });
    }
  };

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
        <span className="text-sm text-[#D3DBDD] font-medium">Step 1 of 4</span>
        <div className="w-10" />
      </div>

      {/* Progress bar */}
      <div className="px-6">
        <div className="h-2 bg-[#233038] rounded-full overflow-hidden">
          <div className="h-full w-1/4 bg-[#FF5B04] rounded-full" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-center p-6 max-w-md mx-auto w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-[#075056] rounded-full mb-6">
            <User className="w-10 h-10 text-[#FF5B04]" />
          </div>
          <h2 className="text-3xl font-bold text-[#FDF6E3] mb-2">
            Let's personalize your Stamped Recap
          </h2>
          <p className="text-[#D3DBDD]">
            Add your username so friends can find you
          </p>
        </div>

        {/* Username Input */}
        <div className="space-y-3 mb-8">
          <Label htmlFor="username" className="text-[#FDF6E3] font-medium">
            Your username
          </Label>
          <Input
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            className="h-14 text-lg rounded-xl bg-[#0B0101] border-[#075056] text-[#FDF6E3] placeholder:text-[#D3DBDD] focus:border-[#FF5B04] focus:ring-[#FF5B04]"
          />
        </div>
      </div>

      {/* Footer */}
      <div className="p-6">
        <Button
          onClick={handleSubmit}
          disabled={!username.trim()}
          className="w-full h-14 text-lg font-semibold rounded-full bg-[#FF5B04] hover:bg-[#E54F03] text-white disabled:bg-[#233038] disabled:text-[#D3DBDD] transition-colors"
        >
          Continue
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );
}
