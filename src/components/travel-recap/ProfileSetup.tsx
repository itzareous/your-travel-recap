import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserProfile } from "./types";
import { ArrowLeft, ArrowRight, Instagram, Twitter, User } from "lucide-react";

interface ProfileSetupProps {
  onNext: (profile: UserProfile) => void;
  onBack: () => void;
  initialProfile?: UserProfile;
}

export default function ProfileSetup({ onNext, onBack, initialProfile }: ProfileSetupProps) {
  const [username, setUsername] = useState(initialProfile?.username || "");
  const [platform, setPlatform] = useState<UserProfile['platform']>(initialProfile?.platform || 'none');

  const handleSubmit = () => {
    if (username.trim()) {
      onNext({ username: username.trim(), platform });
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] flex flex-col">
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
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#075056] rounded-2xl mb-4">
            <User className="w-8 h-8 text-[#FF5B04]" />
          </div>
          <h2 className="text-3xl font-bold text-[#FDF6E3] mb-2">
            Let's personalize your recap
          </h2>
          <p className="text-[#D3DBDD]">
            Add your username so friends can find you
          </p>
        </div>

        <div className="space-y-6">
          {/* Platform Selection */}
          <div className="space-y-3">
            <Label className="text-[#FDF6E3] font-medium">Choose your platform</Label>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setPlatform('instagram')}
                className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                  platform === 'instagram' 
                    ? 'border-[#FF5B04] bg-[#FF5B04] text-white' 
                    : 'border-[#075056] bg-[#233038] text-[#D3DBDD] hover:border-[#FF5B04]'
                }`}
              >
                <Instagram className={`w-6 h-6 ${platform === 'instagram' ? 'text-white' : 'text-[#D3DBDD]'}`} />
                <span className="text-sm font-medium">
                  Instagram
                </span>
              </button>
              
              <button
                onClick={() => setPlatform('twitter')}
                className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                  platform === 'twitter' 
                    ? 'border-[#FF5B04] bg-[#FF5B04] text-white' 
                    : 'border-[#075056] bg-[#233038] text-[#D3DBDD] hover:border-[#FF5B04]'
                }`}
              >
                <Twitter className={`w-6 h-6 ${platform === 'twitter' ? 'text-white' : 'text-[#D3DBDD]'}`} />
                <span className="text-sm font-medium">
                  X / Twitter
                </span>
              </button>
              
              <button
                onClick={() => setPlatform('none')}
                className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                  platform === 'none' 
                    ? 'border-[#FF5B04] bg-[#FF5B04] text-white' 
                    : 'border-[#075056] bg-[#233038] text-[#D3DBDD] hover:border-[#FF5B04]'
                }`}
              >
                <User className={`w-6 h-6 ${platform === 'none' ? 'text-white' : 'text-[#D3DBDD]'}`} />
                <span className="text-sm font-medium">
                  Just name
                </span>
              </button>
            </div>
          </div>

          {/* Username Input */}
          <div className="space-y-2">
            <Label htmlFor="username" className="text-[#FDF6E3] font-medium">
              {platform === 'none' ? 'Your name' : 'Username'}
            </Label>
            <div className="relative">
              {platform !== 'none' && (
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D3DBDD]">@</span>
              )}
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={platform === 'none' ? 'Enter your name' : 'username'}
                className={`h-14 text-lg rounded-xl bg-[#0F172A] border-[#075056] text-[#FDF6E3] placeholder:text-[#D3DBDD] focus:border-[#FF5B04] focus:ring-[#FF5B04] ${platform !== 'none' ? 'pl-9' : ''}`}
              />
            </div>
          </div>
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
