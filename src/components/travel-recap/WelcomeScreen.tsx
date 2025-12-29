interface WelcomeScreenProps {
  onStart: () => void;
}

export default function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  return (
    <div className="min-h-screen bg-[#0B0101] relative overflow-hidden flex items-center justify-center p-8">
      {/* Animated gradient blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-gradient-to-br from-[#FF5B04]/20 to-[#2563EB]/20 rounded-full blur-3xl animate-blob top-0 -left-20"></div>
        <div className="absolute w-96 h-96 bg-gradient-to-br from-[#2563EB]/20 to-[#075056]/20 rounded-full blur-3xl animate-blob animation-delay-2000 top-0 -right-20"></div>
        <div className="absolute w-96 h-96 bg-gradient-to-br from-[#075056]/20 to-[#FF5B04]/20 rounded-full blur-3xl animate-blob animation-delay-4000 bottom-0 left-1/2 -translate-x-1/2"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-2xl mx-auto text-center">
        {/* App icon */}
        <div className="w-24 h-24 bg-[#075056] rounded-3xl flex items-center justify-center mx-auto mb-8">
          <img src="/images/logo.svg" alt="Logo" className="w-12 h-12 object-contain" />
        </div>
        
        {/* Main heading */}
        <h1 className="text-5xl md:text-6xl font-bold text-[#FDF6E3] mb-6">
          Create your 2025 travel wrapped
        </h1>
        
        {/* CTA Button */}
        <button 
          onClick={onStart}
          className="bg-[#FF5B04] hover:bg-[#E54F03] text-white font-bold text-lg px-12 py-5 rounded-full transition-all duration-300 hover:scale-[1.02]"
        >
          Create My Stamped Recap
        </button>
        
        {/* Footer text */}
        <p className="text-[#D3DBDD] text-sm mt-8">
          No sign-up required • Share instantly
        </p>
      </div>
    </div>
  );
}
