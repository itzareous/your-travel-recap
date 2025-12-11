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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-slate-200 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-slate-600" />
        </button>
        <span className="text-sm text-slate-500 font-medium">Step 1 of 4</span>
        <div className="w-10" />
      </div>

      {/* Progress bar */}
      <div className="px-6">
        <div className="h-1 bg-slate-200 rounded-full overflow-hidden">
          <div className="h-full w-1/3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-center p-6 max-w-md mx-auto w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full mb-4">
            <User className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">
            Let's personalize your recap
          </h2>
          <p className="text-slate-500">
            Add your username so friends can find you
          </p>
        </div>

        <div className="space-y-6">
          {/* Platform Selection */}
          <div className="space-y-3">
            <Label className="text-slate-700 font-medium">Choose your platform</Label>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setPlatform('instagram')}
                className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                  platform === 'instagram' 
                    ? 'border-pink-500 bg-pink-50' 
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <Instagram className={`w-6 h-6 ${platform === 'instagram' ? 'text-pink-500' : 'text-slate-400'}`} />
                <span className={`text-sm font-medium ${platform === 'instagram' ? 'text-pink-600' : 'text-slate-500'}`}>
                  Instagram
                </span>
              </button>
              
              <button
                onClick={() => setPlatform('twitter')}
                className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                  platform === 'twitter' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <Twitter className={`w-6 h-6 ${platform === 'twitter' ? 'text-blue-500' : 'text-slate-400'}`} />
                <span className={`text-sm font-medium ${platform === 'twitter' ? 'text-blue-600' : 'text-slate-500'}`}>
                  X / Twitter
                </span>
              </button>
              
              <button
                onClick={() => setPlatform('none')}
                className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                  platform === 'none' 
                    ? 'border-slate-500 bg-slate-100' 
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <User className={`w-6 h-6 ${platform === 'none' ? 'text-slate-600' : 'text-slate-400'}`} />
                <span className={`text-sm font-medium ${platform === 'none' ? 'text-slate-700' : 'text-slate-500'}`}>
                  Just name
                </span>
              </button>
            </div>
          </div>

          {/* Username Input */}
          <div className="space-y-2">
            <Label htmlFor="username" className="text-slate-700 font-medium">
              {platform === 'none' ? 'Your name' : 'Username'}
            </Label>
            <div className="relative">
              {platform !== 'none' && (
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">@</span>
              )}
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={platform === 'none' ? 'Enter your name' : 'username'}
                className={`h-14 text-lg rounded-xl border-slate-200 ${platform !== 'none' ? 'pl-9' : ''}`}
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
          className="w-full h-14 text-lg font-semibold rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:opacity-50"
        >
          Continue
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );
}
