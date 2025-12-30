import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TravelImage, TravelDestination, COUNTRIES } from "./types";
import { ArrowLeft, ArrowRight, Globe, Building2, Check, ChevronDown, Search } from "lucide-react";
import { fadeInUp, slideInUp, scaleInBounce, staggerContainer, popIn } from "@/utils/animations";

interface LocationTaggerProps {
  images: TravelImage[];
  onComplete: (destinations: TravelDestination[]) => void;
  onBack: () => void;
}

export default function LocationTagger({ images, onComplete, onBack }: LocationTaggerProps) {
  const [taggedImages, setTaggedImages] = useState<TravelImage[]>(images);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [locationType, setLocationType] = useState<'country' | 'city'>('city');
  const [cityName, setCityName] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [countrySearch, setCountrySearch] = useState("");
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [showSuggestion, setShowSuggestion] = useState(true);

  const currentImage = taggedImages[currentIndex];
  const hasSuggestion = currentImage?.geoTag?.suggestedCity || currentImage?.geoTag?.suggestedCountry;
  
  const taggedCount = taggedImages.filter(img => img.location).length;
  const [error, setError] = useState<string | null>(null);

  // Check if current image has been tagged
  const isCurrentImageTagged = currentImage?.location !== undefined;

  const filteredCountries = useMemo(() => {
    if (!countrySearch) return COUNTRIES;
    return COUNTRIES.filter(c => 
      c.toLowerCase().includes(countrySearch.toLowerCase())
    );
  }, [countrySearch]);

  const resetForm = () => {
    setCityName("");
    setSelectedCountry("");
    setCountrySearch("");
    setLocationType('city');
    setShowSuggestion(true);
    setShowCountryDropdown(false);
  };

  const saveLocation = () => {
    if (locationType === 'country' && !selectedCountry) {
      setError('Please select a country');
      return;
    }
    if (locationType === 'city' && (!cityName.trim() || !selectedCountry)) {
      setError('Please enter city name and select a country');
      return;
    }

    setError(null);
    const updatedImages = [...taggedImages];
    updatedImages[currentIndex] = {
      ...currentImage,
      location: {
        type: locationType,
        name: locationType === 'city' ? cityName.trim() : selectedCountry,
        country: selectedCountry
      }
    };
    setTaggedImages(updatedImages);
    goToNext();
  };

  const confirmSuggestion = () => {
    if (!currentImage.geoTag) return;
    
    const updatedImages = [...taggedImages];
    const hasCity = currentImage.geoTag.suggestedCity;
    updatedImages[currentIndex] = {
      ...currentImage,
      location: {
        type: hasCity ? 'city' : 'country',
        name: hasCity ? currentImage.geoTag.suggestedCity! : currentImage.geoTag.suggestedCountry!,
        country: currentImage.geoTag.suggestedCountry!
      }
    };
    setTaggedImages(updatedImages);
    goToNext();
  };

  const goToNext = () => {
    setError(null);
    resetForm();
    if (currentIndex < taggedImages.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      generateDestinations();
    }
  };

  const generateDestinations = () => {
    console.log('=== DESTINATION GENERATION DEBUG ===');
    console.log('Total images:', taggedImages.length);
    
    const taggedWithLocation = taggedImages.filter(img => img.location);
    console.log('Images with location:', taggedWithLocation.length);
    
    if (taggedWithLocation.length === 0) {
      console.log('No tagged images, returning empty destinations');
      onComplete([]);
      return;
    }

    // Map to collect ALL images for each destination with timestamps
    const destinationMap = new Map<string, {
      type: 'country' | 'city';
      name: string;
      country: string;
      images: string[];
      timestamps: number[];
      earliestTimestamp: number;
    }>();
    
    taggedWithLocation.forEach((img, index) => {
      if (img.location) {
        const key = img.location.type === 'city' 
          ? `city:${img.location.name.toLowerCase()}:${img.location.country.toLowerCase()}`
          : `country:${img.location.country.toLowerCase()}`;
        
        const timestamp = img.timestamp || Date.now();
        console.log(`Image ${index}: key="${key}", timestamp=${new Date(timestamp).toISOString()}, location=`, img.location);
        
        if (!destinationMap.has(key)) {
          // First image for this destination - create new entry
          destinationMap.set(key, {
            type: img.location.type,
            name: img.location.name,
            country: img.location.country,
            images: [img.preview],
            timestamps: [timestamp],
            earliestTimestamp: timestamp
          });
          console.log(`  -> Created new destination with first image`);
        } else {
          // Additional image for existing destination - add to array
          const existing = destinationMap.get(key)!;
          existing.images.push(img.preview);
          existing.timestamps.push(timestamp);
          // Update earliest timestamp if this one is earlier
          if (timestamp < existing.earliestTimestamp) {
            existing.earliestTimestamp = timestamp;
          }
          console.log(`  -> Added image to existing destination (now ${existing.images.length} images)`);
        }
      }
    });

    // Convert map to array, sorted by earliest timestamp (chronological order)
    const destinations: TravelDestination[] = Array.from(destinationMap.entries())
      .sort((a, b) => a[1].earliestTimestamp - b[1].earliestTimestamp)
      .map(([_, data], index) => ({
        id: crypto.randomUUID(),
        type: data.type,
        name: data.name,
        country: data.country,
        images: data.images,
        visitOrder: index + 1,
        earliestTimestamp: data.earliestTimestamp
      }));

    console.log('=== FINAL DESTINATIONS ===');
    console.log('Total destinations:', destinations.length);
    destinations.forEach((d, i) => {
      console.log(`  ${i + 1}. ${d.name}, ${d.country} (order: ${d.visitOrder}, images: ${d.images.length})`);
    });

    onComplete(destinations);
  };

  const isLastImage = currentIndex === taggedImages.length - 1;

  if (currentIndex >= taggedImages.length) {
    return (
      <motion.div 
        className="min-h-screen bg-[#0B0101] flex flex-col items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center">
          <motion.div 
            className="w-20 h-20 bg-[#075056] rounded-2xl flex items-center justify-center mx-auto mb-4"
            variants={scaleInBounce}
            initial="hidden"
            animate="visible"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
            >
              <Check className="w-10 h-10 text-[#2563EB]" />
            </motion.div>
          </motion.div>
          <motion.h2 
            className="text-3xl font-bold text-[#FDF6E3] mb-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            All done!
          </motion.h2>
          <motion.p 
            className="text-[#D3DBDD] mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            {taggedCount} images tagged
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, type: "spring" }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={generateDestinations}
              className="h-12 px-8 rounded-full bg-[#FF5B04] hover:bg-[#E54F03] text-white font-medium transition-colors"
            >
              Generate My Recap
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0101] flex flex-col">
      {/* Fixed Top Navigation Bar */}
      <motion.div 
        className="fixed top-0 left-0 right-0 bg-[#0B0101] border-b border-[#233038] p-4 flex items-center justify-between z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Back button - left */}
        <motion.button 
          onClick={onBack}
          className="p-2 hover:bg-[#233038] rounded-full transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <ArrowLeft className="w-6 h-6 text-[#D3DBDD]" />
        </motion.button>
        
        {/* Step indicator - center */}
        <motion.div 
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-[#D3DBDD] text-sm">
            Step 4 of 4 • Image {currentIndex + 1} of {taggedImages.length}
          </p>
        </motion.div>
        
        {/* Next button - right (only show when suggestion mode) */}
        {hasSuggestion && showSuggestion ? (
          <motion.button
            onClick={confirmSuggestion}
            className="text-[#FF5B04] hover:text-[#E54F03] font-semibold flex items-center gap-1 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isLastImage ? 'Done' : 'Next'}
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        ) : (
          <div className="w-16" />
        )}
      </motion.div>

      {/* Main Content - with padding for fixed header and footer */}
      <div className="pt-20 pb-48 flex-1 overflow-y-auto flex flex-col">
        {/* Progress dots */}
        <motion.div 
          className="flex justify-center gap-1 py-3 px-4 flex-wrap"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          {taggedImages.map((img, i) => (
            <motion.div 
              key={img.id}
              className={`h-2 rounded-full ${
                i === currentIndex 
                  ? 'w-6 bg-[#FF5B04]' 
                  : i < currentIndex 
                    ? img.location ? 'w-2 bg-[#2563EB]' : 'w-2 bg-[#233038]'
                    : 'w-2 bg-[#233038]'
              }`}
              initial={i === currentIndex ? { width: 8 } : {}}
              animate={i === currentIndex ? { width: 24 } : {}}
              transition={{ duration: 0.3 }}
            />
          ))}
        </motion.div>

        {/* Image container - takes most of the space with even padding */}
        <div className="relative px-6 py-4 flex-1 flex items-center justify-center">
          <div className="relative max-w-2xl mx-auto w-full h-full">
            <AnimatePresence mode="wait">
              <motion.img 
                key={currentImage.id}
                src={currentImage.preview} 
                alt="Travel memory"
                className="w-full h-full max-h-[65vh] object-contain rounded-2xl border-4 border-[#233038]"
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
              />
            </AnimatePresence>
            
            {/* Location suggestion overlay - positioned at bottom of image */}
            <AnimatePresence>
              {hasSuggestion && showSuggestion && (
                <motion.div 
                  className="absolute bottom-4 left-4 right-4 bg-[#075056]/95 border-l-4 border-[#F4D47C] rounded-lg p-4 backdrop-blur-sm"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 50 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                >
                  <motion.p 
                    className="text-[#FDF6E3] text-sm mb-1 flex items-center gap-1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <img src="/images/stamp.webp" alt="Location" className="w-4 h-4 inline object-contain" /> We detected this might be from
                  </motion.p>
                  <motion.p 
                    className="text-[#F4D47C] text-lg font-bold"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    {currentImage.geoTag?.suggestedCity 
                      ? `${currentImage.geoTag.suggestedCity}, ${currentImage.geoTag.suggestedCountry}`
                      : currentImage.geoTag?.suggestedCountry}
                  </motion.p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Fixed Footer with Action Buttons */}
      <motion.div 
        className="fixed bottom-0 left-0 right-0 bg-[#233038] border-t border-[#075056] p-6 z-10"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        {/* Show confirm/change buttons when suggestion exists */}
        <AnimatePresence mode="wait">
          {hasSuggestion && showSuggestion ? (
            <motion.div 
              key="suggestion-buttons"
              className="flex gap-3 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Confirm button */}
              <motion.button
                onClick={confirmSuggestion}
                className="flex-1 bg-[#2563EB] hover:bg-[#1E40AF] text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Check className="w-5 h-5" />
                Confirm
              </motion.button>
              
              {/* Change Location button */}
              <motion.button
                onClick={() => {
                  setShowSuggestion(false);
                  if (currentImage.geoTag?.suggestedCountry) {
                    setSelectedCountry(currentImage.geoTag.suggestedCountry);
                  }
                }}
                className="flex-1 bg-transparent border-2 border-[#D3DBDD] text-[#D3DBDD] hover:border-[#FF5B04] hover:text-[#FF5B04] py-4 rounded-xl font-semibold transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                Change Location
              </motion.button>
            </motion.div>
          ) : (
          // Manual input form in footer
          <motion.div 
            key="manual-form"
            className="max-w-2xl mx-auto space-y-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Type toggle */}
            <motion.div 
              className="flex gap-2 bg-[#0B0101] rounded-lg p-1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <motion.button
                onClick={() => setLocationType('city')}
                className={`flex-1 py-2 rounded-md font-medium transition-all flex items-center justify-center gap-2 ${
                  locationType === 'city'
                    ? 'bg-[#FF5B04] text-white'
                    : 'text-[#D3DBDD]'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Building2 className="w-4 h-4" />
                City
              </motion.button>
              <motion.button
                onClick={() => setLocationType('country')}
                className={`flex-1 py-2 rounded-md font-medium transition-all flex items-center justify-center gap-2 ${
                  locationType === 'country'
                    ? 'bg-[#FF5B04] text-white'
                    : 'text-[#D3DBDD]'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Globe className="w-4 h-4" />
                Country
              </motion.button>
            </motion.div>
            
            {/* Input fields - stacked vertically with equal widths */}
            {locationType === 'city' ? (
              <div className="space-y-3">
                <Input
                  type="text"
                  placeholder="City name"
                  value={cityName}
                  onChange={(e) => setCityName(e.target.value)}
                  className="w-full bg-[#0B0101] border border-[#075056] text-[#FDF6E3] px-4 py-3 rounded-lg focus:border-[#FF5B04] focus:outline-none placeholder:text-[#D3DBDD]"
                />
                <div className="relative w-full">
                  <button
                    onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                    className="w-full px-4 py-3 rounded-lg border border-[#075056] bg-[#0B0101] flex items-center justify-between text-left hover:border-[#FF5B04] transition-colors"
                  >
                    <span className={`truncate ${selectedCountry ? 'text-[#FDF6E3]' : 'text-[#D3DBDD]'}`}>
                      {selectedCountry || 'Select country'}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-[#D3DBDD] transition-transform flex-shrink-0 ${showCountryDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {showCountryDropdown && (
                    <div className="absolute z-20 bottom-full left-0 right-0 mb-1 bg-[#233038] rounded-xl border border-[#075056] shadow-lg max-h-60 overflow-hidden">
                      <div className="p-2 border-b border-[#075056]">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#D3DBDD]" />
                          <Input
                            value={countrySearch}
                            onChange={(e) => setCountrySearch(e.target.value)}
                            placeholder="Search..."
                            className="h-10 pl-9 rounded-lg bg-[#0B0101] border-[#075056] text-[#FDF6E3] placeholder:text-[#D3DBDD] focus:border-[#FF5B04]"
                            autoFocus
                          />
                        </div>
                      </div>
                      <div className="max-h-40 overflow-y-auto">
                        {filteredCountries.map(country => (
                          <button
                            key={country}
                            onClick={() => {
                              setSelectedCountry(country);
                              setShowCountryDropdown(false);
                              setCountrySearch("");
                            }}
                            className={`w-full px-4 py-2.5 text-left hover:bg-[#075056] flex items-center gap-2 transition-colors ${
                              selectedCountry === country ? 'bg-[#FF5B04] text-white' : 'text-[#FDF6E3]'
                            }`}
                          >
                            {selectedCountry === country && <Check className="w-4 h-4" />}
                            {country}
                          </button>
                        ))}
                        {filteredCountries.length === 0 && (
                          <div className="px-4 py-3 text-[#D3DBDD] text-center">No countries found</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="relative w-full">
                <button
                  onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                  className="w-full px-4 py-3 rounded-lg border border-[#075056] bg-[#0B0101] flex items-center justify-between text-left hover:border-[#FF5B04] transition-colors"
                >
                  <span className={selectedCountry ? 'text-[#FDF6E3]' : 'text-[#D3DBDD]'}>
                    {selectedCountry || 'Select country'}
                  </span>
                  <ChevronDown className={`w-5 h-5 text-[#D3DBDD] transition-transform ${showCountryDropdown ? 'rotate-180' : ''}`} />
                </button>
                
                {showCountryDropdown && (
                  <div className="absolute z-20 bottom-full left-0 right-0 mb-1 bg-[#233038] rounded-xl border border-[#075056] shadow-lg max-h-60 overflow-hidden">
                    <div className="p-2 border-b border-[#075056]">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#D3DBDD]" />
                        <Input
                          value={countrySearch}
                          onChange={(e) => setCountrySearch(e.target.value)}
                          placeholder="Search countries..."
                          className="h-10 pl-9 rounded-lg bg-[#0B0101] border-[#075056] text-[#FDF6E3] placeholder:text-[#D3DBDD] focus:border-[#FF5B04]"
                          autoFocus
                        />
                      </div>
                    </div>
                    <div className="max-h-40 overflow-y-auto">
                      {filteredCountries.map(country => (
                        <button
                          key={country}
                          onClick={() => {
                            setSelectedCountry(country);
                            setShowCountryDropdown(false);
                            setCountrySearch("");
                          }}
                          className={`w-full px-4 py-2.5 text-left hover:bg-[#075056] flex items-center gap-2 transition-colors ${
                            selectedCountry === country ? 'bg-[#FF5B04] text-white' : 'text-[#FDF6E3]'
                          }`}
                        >
                          {selectedCountry === country && <Check className="w-4 h-4" />}
                          {country}
                        </button>
                      ))}
                      {filteredCountries.length === 0 && (
                        <div className="px-4 py-3 text-[#D3DBDD] text-center">No countries found</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Error message */}
            <AnimatePresence>
              {error && (
                <motion.p 
                  className="text-[#FF5B04] text-sm text-center"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>
            
            {/* Confirm button in footer for manual input */}
            <motion.button
              onClick={saveLocation}
              disabled={
                (locationType === 'country' && !selectedCountry) ||
                (locationType === 'city' && (!cityName.trim() || !selectedCountry))
              }
              className="w-full bg-[#2563EB] hover:bg-[#1E40AF] disabled:bg-[#0B0101] disabled:text-[#D3DBDD] disabled:border disabled:border-[#233038] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Check className="w-5 h-5" />
              Confirm Location
            </motion.button>
          </motion.div>
        )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
