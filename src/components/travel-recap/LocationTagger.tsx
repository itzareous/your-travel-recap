import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TravelImage, TravelDestination, COUNTRIES } from "./types";
import { ArrowLeft, ArrowRight, Globe, Building2, Check, SkipForward, ChevronDown, Search } from "lucide-react";

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
  const skippedCount = taggedImages.filter(img => !img.location).length;

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
    if (locationType === 'country' && !selectedCountry) return;
    if (locationType === 'city' && (!cityName.trim() || !selectedCountry)) return;

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

  const skipImage = () => {
    goToNext();
  };

  const goToNext = () => {
    resetForm();
    if (currentIndex < taggedImages.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      generateDestinations();
    }
  };

  const generateDestinations = () => {
    const locationMap = new Map<string, TravelImage>();
    
    taggedImages.forEach(img => {
      if (img.location) {
        const key = img.location.type === 'city' 
          ? `city:${img.location.name}:${img.location.country}`
          : `country:${img.location.country}`;
        
        if (!locationMap.has(key)) {
          locationMap.set(key, img);
        }
      }
    });

    const destinations: TravelDestination[] = [];
    let order = 1;
    
    taggedImages.forEach(img => {
      if (img.location) {
        const key = img.location.type === 'city' 
          ? `city:${img.location.name}:${img.location.country}`
          : `country:${img.location.country}`;
        
        const firstImage = locationMap.get(key);
        if (firstImage?.id === img.id) {
          destinations.push({
            id: crypto.randomUUID(),
            type: img.location.type,
            name: img.location.name,
            country: img.location.country,
            image: img.preview,
            visitOrder: order++
          });
        }
      }
    });

    onComplete(destinations);
  };

  const isLastImage = currentIndex === taggedImages.length - 1;

  if (currentIndex >= taggedImages.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">All done!</h2>
          <p className="text-slate-500 mb-6">
            {taggedCount} images tagged, {skippedCount} skipped
          </p>
          <Button
            onClick={generateDestinations}
            className="h-12 px-8 rounded-xl bg-purple-500 hover:bg-purple-600 text-white font-medium"
          >
            Generate My Recap
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col">
      <div className="p-4 flex items-center justify-between">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-slate-200 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-slate-600" />
        </button>
        <span className="text-sm text-slate-500">Image {currentIndex + 1} of {taggedImages.length}</span>
        <div className="w-10" />
      </div>

      <div className="px-4 mb-4">
        <div className="flex gap-1 justify-center">
          {taggedImages.map((img, i) => (
            <div 
              key={img.id}
              className={`h-1.5 rounded-full transition-all ${
                i === currentIndex 
                  ? 'w-6 bg-purple-500' 
                  : i < currentIndex 
                    ? img.location ? 'w-1.5 bg-green-500' : 'w-1.5 bg-slate-300'
                    : 'w-1.5 bg-slate-200'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="flex-1 px-4 pb-4 overflow-y-auto">
        <div className="max-w-lg mx-auto">
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-6 shadow-lg">
            <img 
              src={currentImage.preview} 
              alt="Travel memory"
              className="w-full h-full object-cover"
            />
          </div>

          {hasSuggestion && showSuggestion && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
              <p className="text-sm text-green-700 mb-3">
                📍 We detected this might be from{' '}
                <strong>
                  {currentImage.geoTag?.suggestedCity 
                    ? `${currentImage.geoTag.suggestedCity}, ${currentImage.geoTag.suggestedCountry}`
                    : currentImage.geoTag?.suggestedCountry}
                </strong>
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={confirmSuggestion}
                  className="flex-1 h-10 rounded-xl bg-green-600 hover:bg-green-700 text-white"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Confirm
                </Button>
                <Button
                  onClick={() => setShowSuggestion(false)}
                  variant="outline"
                  className="flex-1 h-10 rounded-xl"
                >
                  Change Location
                </Button>
              </div>
            </div>
          )}

          {(!hasSuggestion || !showSuggestion) && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-800">Where was this photo taken?</h3>
              
              <div className="flex gap-2">
                <button
                  onClick={() => setLocationType('city')}
                  className={`flex-1 h-12 rounded-xl flex items-center justify-center gap-2 transition-colors ${
                    locationType === 'city' 
                      ? 'bg-purple-500 text-white' 
                      : 'border-2 border-slate-200 text-slate-600 hover:border-purple-400'
                  }`}
                >
                  <Building2 className="w-5 h-5" />
                  City
                </button>
                <button
                  onClick={() => setLocationType('country')}
                  className={`flex-1 h-12 rounded-xl flex items-center justify-center gap-2 transition-colors ${
                    locationType === 'country' 
                      ? 'bg-purple-500 text-white' 
                      : 'border-2 border-slate-200 text-slate-600 hover:border-purple-400'
                  }`}
                >
                  <Globe className="w-5 h-5" />
                  Country
                </button>
              </div>

              {locationType === 'city' && (
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">City name</label>
                  <Input
                    value={cityName}
                    onChange={(e) => setCityName(e.target.value)}
                    placeholder="e.g., Lagos, New York, Paris"
                    className="h-12 rounded-xl border-slate-200"
                  />
                </div>
              )}

              <div className="relative">
                <label className="block text-sm font-medium text-slate-600 mb-2">
                  {locationType === 'city' ? 'Country' : 'Select country'}
                </label>
                <button
                  onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white flex items-center justify-between text-left"
                >
                  <span className={selectedCountry ? 'text-slate-800' : 'text-slate-400'}>
                    {selectedCountry || 'Select a country'}
                  </span>
                  <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${showCountryDropdown ? 'rotate-180' : ''}`} />
                </button>
                
                {showCountryDropdown && (
                  <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-white rounded-xl border border-slate-200 shadow-lg max-h-60 overflow-hidden">
                    <div className="p-2 border-b border-slate-100">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                          value={countrySearch}
                          onChange={(e) => setCountrySearch(e.target.value)}
                          placeholder="Search countries..."
                          className="h-10 pl-9 rounded-lg border-slate-200"
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
                          className={`w-full px-4 py-2.5 text-left hover:bg-slate-50 flex items-center gap-2 ${
                            selectedCountry === country ? 'bg-purple-50 text-purple-700' : 'text-slate-700'
                          }`}
                        >
                          {selectedCountry === country && <Check className="w-4 h-4" />}
                          {country}
                        </button>
                      ))}
                      {filteredCountries.length === 0 && (
                        <div className="px-4 py-3 text-slate-500 text-center">No countries found</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 bg-white border-t border-slate-200">
        <div className="max-w-lg mx-auto flex gap-3">
          <Button
            onClick={skipImage}
            variant="outline"
            className="flex-1 h-12 rounded-xl"
          >
            <SkipForward className="w-5 h-5 mr-2" />
            Skip
          </Button>
          <Button
            onClick={saveLocation}
            disabled={
              (locationType === 'country' && !selectedCountry) ||
              (locationType === 'city' && (!cityName.trim() || !selectedCountry))
            }
            className="flex-1 h-12 rounded-xl bg-purple-500 hover:bg-purple-600 text-white font-medium"
          >
            {isLastImage ? 'Finish' : 'Next'}
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
