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

    // Map to collect ALL images for each destination
    const destinationMap = new Map<string, {
      type: 'country' | 'city';
      name: string;
      country: string;
      images: string[];
      firstIndex: number;
    }>();
    
    taggedWithLocation.forEach((img, index) => {
      if (img.location) {
        const key = img.location.type === 'city' 
          ? `city:${img.location.name.toLowerCase()}:${img.location.country.toLowerCase()}`
          : `country:${img.location.country.toLowerCase()}`;
        
        console.log(`Image ${index}: key="${key}", location=`, img.location);
        
        if (!destinationMap.has(key)) {
          // First image for this destination - create new entry
          destinationMap.set(key, {
            type: img.location.type,
            name: img.location.name,
            country: img.location.country,
            images: [img.preview],
            firstIndex: index
          });
          console.log(`  -> Created new destination with first image`);
        } else {
          // Additional image for existing destination - add to array
          const existing = destinationMap.get(key)!;
          existing.images.push(img.preview);
          console.log(`  -> Added image to existing destination (now ${existing.images.length} images)`);
        }
      }
    });

    // Convert map to array, sorted by first appearance order
    const destinations: TravelDestination[] = Array.from(destinationMap.entries())
      .sort((a, b) => a[1].firstIndex - b[1].firstIndex)
      .map(([_, data], index) => ({
        id: crypto.randomUUID(),
        type: data.type,
        name: data.name,
        country: data.country,
        images: data.images,
        visitOrder: index + 1
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
      <div className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center p-4">
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
    <div className="min-h-screen bg-[#0F172A] flex flex-col">
      <div className="p-4 flex items-center justify-between">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-[#233038] rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-[#D3DBDD]" />
        </button>
        <span className="text-sm text-[#D3DBDD]">Step 4 of 4 • Image {currentIndex + 1} of {taggedImages.length}</span>
        <div className="w-10" />
      </div>

      {/* Progress bar */}
      <div className="px-6 mb-4">
        <div className="h-2 bg-[#233038] rounded-full overflow-hidden">
          <div className="h-full bg-[#FF5B04] rounded-full transition-all" style={{ width: `${((currentIndex + 1) / taggedImages.length) * 100}%` }} />
        </div>
      </div>

      <div className="px-4 mb-4">
        <div className="flex gap-1 justify-center">
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
      </div>

      <div className="flex-1 px-4 pb-4 overflow-y-auto">
        <div className="max-w-lg mx-auto">
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-6 border border-[#075056]">
            <img 
              src={currentImage.preview} 
              alt="Travel memory"
              className="w-full h-full object-cover"
            />
          </div>

          {hasSuggestion && showSuggestion && (
            <div className="mb-6 p-4 bg-[#075056] border-l-4 border-[#F4D47C] rounded-xl">
              <p className="text-sm text-[#FDF6E3] mb-3">
                📍 We detected this might be from{' '}
                <strong className="text-[#F4D47C]">
                  {currentImage.geoTag?.suggestedCity 
                    ? `${currentImage.geoTag.suggestedCity}, ${currentImage.geoTag.suggestedCountry}`
                    : currentImage.geoTag?.suggestedCountry}
                </strong>
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={confirmSuggestion}
                  className="flex-1 h-10 rounded-full bg-[#2563EB] hover:bg-[#1E40AF] text-white transition-colors"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Confirm
                </Button>
                <Button
                  onClick={() => {
                    setShowSuggestion(false);
                    if (currentImage.geoTag?.suggestedCountry) {
                      setSelectedCountry(currentImage.geoTag.suggestedCountry);
                    }
                  }}
                  variant="outline"
                  className="flex-1 h-10 rounded-full border-2 border-[#D3DBDD] text-[#D3DBDD] hover:border-[#FF5B04] hover:text-[#FF5B04] bg-transparent transition-colors"
                >
                  Change Location
                </Button>
              </div>
            </div>
          )}

          {(!hasSuggestion || !showSuggestion) && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[#FDF6E3]">Where was this photo taken?</h3>
              
              <div className="flex gap-2">
                <button
                  onClick={() => setLocationType('city')}
                  className={`flex-1 h-12 rounded-full flex items-center justify-center gap-2 transition-colors ${
                    locationType === 'city' 
                      ? 'bg-[#FF5B04] text-white' 
                      : 'border-2 border-[#075056] bg-[#233038] text-[#D3DBDD] hover:border-[#FF5B04]'
                  }`}
                >
                  <Building2 className="w-5 h-5" />
                  City
                </button>
                <button
                  onClick={() => setLocationType('country')}
                  className={`flex-1 h-12 rounded-full flex items-center justify-center gap-2 transition-colors ${
                    locationType === 'country' 
                      ? 'bg-[#FF5B04] text-white' 
                      : 'border-2 border-[#075056] bg-[#233038] text-[#D3DBDD] hover:border-[#FF5B04]'
                  }`}
                >
                  <Globe className="w-5 h-5" />
                  Country
                </button>
              </div>

              {locationType === 'city' && (
                <div>
                  <label className="block text-sm font-medium text-[#D3DBDD] mb-2">City name</label>
                  <Input
                    value={cityName}
                    onChange={(e) => setCityName(e.target.value)}
                    placeholder="e.g., Lagos, New York, Paris"
                    className="h-12 rounded-xl bg-[#0F172A] border-[#075056] text-[#FDF6E3] placeholder:text-[#D3DBDD] focus:border-[#FF5B04]"
                  />
                </div>
              )}

              <div className="relative">
                <label className="block text-sm font-medium text-[#D3DBDD] mb-2">
                  {locationType === 'city' ? 'Country' : 'Select country'}
                </label>
                <button
                  onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                  className="w-full h-12 px-4 rounded-xl border border-[#075056] bg-[#233038] flex items-center justify-between text-left hover:border-[#FF5B04] transition-colors"
                >
                  <span className={selectedCountry ? 'text-[#FDF6E3]' : 'text-[#D3DBDD]'}>
                    {selectedCountry || 'Select a country'}
                  </span>
                  <ChevronDown className={`w-5 h-5 text-[#D3DBDD] transition-transform ${showCountryDropdown ? 'rotate-180' : ''}`} />
                </button>
                
                {showCountryDropdown && (
                  <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-[#233038] rounded-xl border border-[#075056] shadow-lg max-h-60 overflow-hidden">
                    <div className="p-2 border-b border-[#075056]">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#D3DBDD]" />
                        <Input
                          value={countrySearch}
                          onChange={(e) => setCountrySearch(e.target.value)}
                          placeholder="Search countries..."
                          className="h-10 pl-9 rounded-lg bg-[#0F172A] border-[#075056] text-[#FDF6E3] placeholder:text-[#D3DBDD] focus:border-[#FF5B04]"
                          autoFocus
                        />
                      </div>
                    </div>
                    <div className="max-h-48 overflow-y-auto">
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
          )}
        </div>
      </div>

      <div className="p-4 bg-[#233038] border-t border-[#075056]">
        <div className="max-w-lg mx-auto">
          {/* Error message */}
          {error && (
            <p className="text-[#FF5B04] text-sm mb-3 text-center">{error}</p>
          )}
          
          {/* Only show Next button - no Skip */}
          <Button
            onClick={saveLocation}
            disabled={
              (hasSuggestion && showSuggestion) || // User must confirm or change suggestion first
              (!hasSuggestion && locationType === 'country' && !selectedCountry) ||
              (!hasSuggestion && locationType === 'city' && (!cityName.trim() || !selectedCountry))
            }
            className="w-full h-12 rounded-full bg-[#FF5B04] hover:bg-[#E54F03] text-white font-medium disabled:bg-[#233038] disabled:text-[#D3DBDD] transition-colors"
          >
            {isLastImage ? 'Generate Recap' : 'Next'}
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
