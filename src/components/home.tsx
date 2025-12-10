import { Link } from "react-router-dom";
import { Plane, MapPin, Sparkles, ArrowRight } from "lucide-react";

function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center p-6">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 animate-pulse">
          <Plane className="w-8 h-8 text-purple-500/20" />
        </div>
        <div className="absolute top-40 right-20 animate-pulse delay-300">
          <MapPin className="w-6 h-6 text-blue-500/20" />
        </div>
        <div className="absolute bottom-40 left-20 animate-pulse delay-500">
          <Sparkles className="w-10 h-10 text-pink-500/20" />
        </div>
        <div className="absolute bottom-20 right-10 animate-pulse delay-700">
          <Plane className="w-12 h-12 text-purple-500/20 rotate-45" />
        </div>
      </div>

      <div className="relative z-10 text-center max-w-2xl">
        {/* Logo/Icon */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-2xl shadow-purple-500/30 mb-6">
            <Plane className="w-12 h-12 text-white" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          Travel Stamp
        </h1>
        
        <p className="text-xl text-slate-400 mb-12 max-w-md mx-auto">
          Create beautiful end-of-year travel recaps and share your adventures with the world
        </p>

        {/* CTA Card */}
        <Link 
          to="/travel-recap"
          className="group block bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20"
        >
          <div className="flex items-center justify-between">
            <div className="text-left">
              <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-yellow-400" />
                2024 Travel Recap
              </h2>
              <p className="text-slate-400">
                Create your personalized stamp collection of all the places you visited this year
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <ArrowRight className="w-6 h-6 text-white" />
            </div>
          </div>
        </Link>

        {/* Features */}
        <div className="mt-12 grid grid-cols-3 gap-6 text-center">
          <div>
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
              <MapPin className="w-6 h-6 text-blue-400" />
            </div>
            <p className="text-sm text-slate-400">Add your destinations</p>
          </div>
          <div>
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Plane className="w-6 h-6 text-purple-400" />
            </div>
            <p className="text-sm text-slate-400">Upload memories</p>
          </div>
          <div>
            <div className="w-12 h-12 bg-pink-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Sparkles className="w-6 h-6 text-pink-400" />
            </div>
            <p className="text-sm text-slate-400">Share your story</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-6 text-center text-slate-500 text-sm">
        No sign-up required • Share instantly
      </div>
    </div>
  )
}

export default Home
