import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TravelImage, TravelDestination, COUNTRIES } from "./types";
import { ArrowLeft, ArrowRight, Globe, Building2, Check, ChevronDown, Search } from "lucide-react";

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
      <div className="min-h-screen bg-[#0B0101] flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <div className="w-20 h-20 bg-[#075056] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Check className="w-10 h-10 text-[#2563EB]" />
          </div>
          <h2 className="text-3xl font-bold text-[#FDF6E3] mb-2">All done!</h2>
          <p className="text-[#D3DBDD] mb-6">
            {taggedCount} images tagged
          </p>
          <Button
            onClick={generateDestinations}
            className="h-12 px-8 rounded-full bg-[#FF5B04] hover:bg-[#E54F03] text-white font-medium transition-colors"
          >
            Generate My Recap
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0101] flex flex-col">
      {/* Fixed Top Navigation Bar */}
      <div className="fixed top-0 left-0 right-0 bg-[#0B0101] border-b border-[#233038] p-4 flex items-center justify-between z-10">
        {/* Back button - left */}
        <button 
          onClick={onBack}
          className="p-2 hover:bg-[#233038] rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-[#D3DBDD]" />
        </button>
        
        {/* Step indicator - center */}
        <div className="text-center">
          <p className="text-[#D3DBDD] text-sm">
            Step 4 of 4 • Image {currentIndex + 1} of {taggedImages.length}
          </p>
        </div>
        
        {/* Next button - right */}
        <button
          onClick={hasSuggestion && showSuggestion ? confirmSuggestion : saveLocation}
          disabled={
            (!hasSuggestion && !showSuggestion && locationType === 'country' && !selectedCountry) ||
            (!hasSuggestion && !showSuggestion && locationType === 'city' && (!cityName.trim() || !selectedCountry))
          }
          className="text-[#FF5B04] hover:text-[#E54F03] disabled:text-[#233038] disabled:cursor-not-allowed font-semibold flex items-center gap-1 transition-colors"
        >
          {isLastImage ? 'Done' : 'Next'}
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>

      {/* Main Content - with padding for fixed header and footer */}
      <div className="pt-20 pb-36 flex-1 overflow-y-auto">
        {/* Progress dots */}
        <div className="flex justify-center gap-1 py-4 px-4 flex-wrap">
          {taggedImages.map((img, i) => (
            <div 
              key={img.id}
              className={`h-2 rounded-full transition-all ${
                i === currentIndex 
                  ? 'w-6 bg-[#FF5B04]' 
                  : i < currentIndex 
                    ? img.location ? 'w-2 bg-[#2563EB]' : 'w-2 bg-[#233038]'
                    : 'w-2 bg-[#233038]'
              }`}
            />
          ))}
        </div>

        {/* Image container - takes most of the space */}
        <div className="relative px-4">
          <div className="relative max-w-2xl mx-auto">
            <img 
              src={currentImage.preview} 
              alt="Travel memory"
              className="w-full h-[55vh] md:h-[50vh] object-contain rounded-2xl border-4 border-[#233038]"
            />
            
            {/* Location suggestion overlay - positioned at bottom of image */}
            {hasSuggestion && showSuggestion && (
              <div className="absolute bottom-4 left-4 right-4 bg-[#075056]/95 border-l-4 border-[#F4D47C] rounded-lg p-4 backdrop-blur-sm">
                <p className="text-[#FDF6E3] text-sm mb-1">
                  📍 We detected this might be from
                </p>
                <p className="text-[#F4D47C] text-lg font-bold">
                  {currentImage.geoTag?.suggestedCity 
                    ? `${currentImage.geoTag.suggestedCity}, ${currentImage.geoTag.suggestedCountry}`
                    : currentImage.geoTag?.suggestedCountry}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fixed Footer with Action Buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#233038] border-t border-[#075056] p-4 z-10">
        {/* Show confirm/change buttons when suggestion exists */}
        {hasSuggestion && showSuggestion ? (
          <div className="flex gap-3 max-w-2xl mx-auto">
            {/* Confirm button */}
            <button
              onClick={confirmSuggestion}
              className="flex-1 bg-[#2563EB] hover:bg-[#1E40AF] text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
            >
              <Check className="w-5 h-5" />
              Confirm
            </button>
            
            {/* Change Location button */}
            <button
              onClick={() => {
                setShowSuggestion(false);
                if (currentImage.geoTag?.suggestedCountry) {
                  setSelectedCountry(currentImage.geoTag.suggestedCountry);
                }
              }}
              className="flex-1 bg-transparent border-2 border-[#D3DBDD] text-[#D3DBDD] hover:border-[#FF5B04] hover:text-[#FF5B04] py-4 rounded-xl font-semibold transition-all"
            >
              Change Location
            </button>
          </div>
        ) : (
          // Manual input form in footer
          <div className="max-w-2xl mx-auto space-y-3">
            {/* Type toggle */}
            <div className="flex gap-2 bg-[#0B0101] rounded-lg p-1">
              <button
                onClick={() => setLocationType('city')}
                className={`flex-1 py-2 rounded-md font-medium transition-all flex items-center justify-center gap-2 ${
                  locationType === 'city'
                    ? 'bg-[#FF5B04] text-white'
                    : 'text-[#D3DBDD]'
                }`}
              >
                <Building2 className="w-4 h-4" />
                City
              </button>
              <button
                onClick={() => setLocationType('country')}
                className={`flex-1 py-2 rounded-md font-medium transition-all flex items-center justify-center gap-2 ${
                  locationType === 'country'
                    ? 'bg-[#FF5B04] text-white'
                    : 'text-[#D3DBDD]'
                }`}
              >
                <Globe className="w-4 h-4" />
                Country
              </button>
            </div>
            
            {/* Input fields */}
            {locationType === 'city' ? (
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="City name"
                  value={cityName}
                  onChange={(e) => setCityName(e.target.value)}
                  className="flex-1 bg-[#0B0101] border border-[#075056] text-[#FDF6E3] px-4 py-3 rounded-lg focus:border-[#FF5B04] focus:outline-none placeholder:text-[#D3DBDD]"
                />
                <div className="relative flex-1">
                  <button
                    onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                    className="w-full h-full px-4 py-3 rounded-lg border border-[#075056] bg-[#0B0101] flex items-center justify-between text-left hover:border-[#FF5B04] transition-colors"
                  >
                    <span className={`truncate ${selectedCountry ? 'text-[#FDF6E3]' : 'text-[#D3DBDD]'}`}>
                      {selectedCountry || 'Country'}
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
              <div className="relative">
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
            {error && (
              <p className="text-[#FF5B04] text-sm text-center">{error}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
