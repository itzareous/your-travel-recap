import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TravelDestination, getDestinationDisplayName } from "./types";
import { ArrowLeft, ArrowRight, Plus, X, ImagePlus, MapPin, Globe, Building2 } from "lucide-react";

interface DestinationSelectorProps {
  onNext: (destinations: TravelDestination[]) => void;
  onBack: () => void;
  initialDestinations?: TravelDestination[];
}

export default function DestinationSelector({ onNext, onBack, initialDestinations }: DestinationSelectorProps) {
  const [destinations, setDestinations] = useState<TravelDestination[]>(initialDestinations || []);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addType, setAddType] = useState<'country' | 'city' | null>(null);
  const [countryInput, setCountryInput] = useState("");
  const [cityNameInput, setCityNameInput] = useState("");
  const [cityCountryInput, setCityCountryInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editingDestinationId, setEditingDestinationId] = useState<string | null>(null);

  const resetModal = () => {
    setShowAddModal(false);
    setAddType(null);
    setCountryInput("");
    setCityNameInput("");
    setCityCountryInput("");
  };

  const addCountryDestination = () => {
    if (!countryInput.trim()) return;
    const newDestination: TravelDestination = {
      id: crypto.randomUUID(),
      type: 'country',
      name: countryInput.trim(),
      country: countryInput.trim(),
      image: null,
      visitOrder: destinations.length + 1
    };
    setDestinations([...destinations, newDestination]);
    resetModal();
  };

  const addCityDestination = () => {
    if (!cityNameInput.trim() || !cityCountryInput.trim()) return;
    const newDestination: TravelDestination = {
      id: crypto.randomUUID(),
      type: 'city',
      name: cityNameInput.trim(),
      country: cityCountryInput.trim(),
      image: null,
      visitOrder: destinations.length + 1
    };
    setDestinations([...destinations, newDestination]);
    resetModal();
  };

  const removeDestination = (id: string) => {
    setDestinations(destinations.filter(d => d.id !== id).map((d, i) => ({ ...d, visitOrder: i + 1 })));
  };

  const handleImageUpload = (destinationId: string, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setDestinations(destinations.map(d => 
        d.id === destinationId ? { ...d, image: e.target?.result as string } : d
      ));
    };
    reader.readAsDataURL(file);
    setEditingDestinationId(null);
  };

  const triggerImageUpload = (destinationId: string) => {
    setEditingDestinationId(destinationId);
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file && editingDestinationId) {
            handleImageUpload(editingDestinationId, file);
          }
          e.target.value = '';
        }}
      />

      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-slate-200 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-slate-600" />
        </button>
        <span className="text-sm text-slate-500 font-medium">Step 2 of 3</span>
        <div className="w-10" />
      </div>

      {/* Progress bar */}
      <div className="px-6">
        <div className="h-1 bg-slate-200 rounded-full overflow-hidden">
          <div className="h-full w-2/3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col p-6 overflow-hidden">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">
            Where did you travel in 2025?
          </h2>
          <p className="text-slate-500">
            Add countries and upload a memorable photo for each
          </p>
        </div>

        {/* Add Destination Modal */}
        {showAddModal ? (
          <div className="mb-4 space-y-3">
            {/* Type selector */}
            {!addType && (
              <>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-600">Add a destination</span>
                  <button
                    onClick={resetModal}
                    className="p-1 hover:bg-slate-100 rounded-full"
                  >
                    <X className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setAddType('country')}
                    className="flex-1 h-12 border-2 border-slate-200 rounded-xl flex items-center justify-center gap-2 text-slate-600 hover:border-purple-400 hover:text-purple-500 transition-colors"
                  >
                    <Globe className="w-5 h-5" />
                    Country
                  </button>
                  <button
                    onClick={() => setAddType('city')}
                    className="flex-1 h-12 border-2 border-slate-200 rounded-xl flex items-center justify-center gap-2 text-slate-600 hover:border-purple-400 hover:text-purple-500 transition-colors"
                  >
                    <Building2 className="w-5 h-5" />
                    City
                  </button>
                </div>
              </>
            )}

            {/* Country input form */}
            {addType === 'country' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-600">Add Country</span>
                  <button
                    onClick={resetModal}
                    className="p-1 hover:bg-slate-100 rounded-full"
                  >
                    <X className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
                <Input
                  value={countryInput}
                  onChange={(e) => setCountryInput(e.target.value)}
                  placeholder="e.g., Nigeria, United States, France"
                  className="h-12 rounded-xl border-slate-200"
                  autoFocus
                />
                <div className="flex gap-2">
                  <Button
                    onClick={() => setAddType(null)}
                    variant="outline"
                    className="flex-1 h-10 rounded-xl"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={addCountryDestination}
                    disabled={!countryInput.trim()}
                    className="flex-1 h-10 rounded-xl bg-purple-500 hover:bg-purple-600"
                  >
                    Add Country
                  </Button>
                </div>
              </div>
            )}

            {/* City input form */}
            {addType === 'city' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-600">Add City</span>
                  <button
                    onClick={resetModal}
                    className="p-1 hover:bg-slate-100 rounded-full"
                  >
                    <X className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
                <Input
                  value={cityNameInput}
                  onChange={(e) => setCityNameInput(e.target.value)}
                  placeholder="e.g., Lagos, New York, Paris"
                  className="h-12 rounded-xl border-slate-200"
                  autoFocus
                />
                <Input
                  value={cityCountryInput}
                  onChange={(e) => setCityCountryInput(e.target.value)}
                  placeholder="e.g., Nigeria, USA, France"
                  className="h-12 rounded-xl border-slate-200"
                />
                <div className="flex gap-2">
                  <Button
                    onClick={() => setAddType(null)}
                    variant="outline"
                    className="flex-1 h-10 rounded-xl"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={addCityDestination}
                    disabled={!cityNameInput.trim() || !cityCountryInput.trim()}
                    className="flex-1 h-10 rounded-xl bg-purple-500 hover:bg-purple-600"
                  >
                    Add City
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => setShowAddModal(true)}
            className="mb-4 w-full h-12 border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center gap-2 text-slate-500 hover:border-purple-400 hover:text-purple-500 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add a destination
          </button>
        )}

        {/* Destinations Grid */}
        <div className="flex-1 overflow-y-auto">
          {destinations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <MapPin className="w-10 h-10 text-slate-300" />
              </div>
              <p className="text-slate-400 text-lg">No destinations added yet</p>
              <p className="text-slate-400 text-sm">Start by adding countries or cities you visited</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {destinations.map((destination) => (
                <div
                  key={destination.id}
                  className="relative group"
                >
                  {/* Stamp Card */}
                  <div className="relative bg-white rounded-lg overflow-hidden shadow-md border-4 border-dashed border-slate-200 aspect-square">
                    {destination.image ? (
                      <img
                        src={destination.image}
                        alt={getDestinationDisplayName(destination)}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <button
                        onClick={() => triggerImageUpload(destination.id)}
                        className="w-full h-full flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors"
                      >
                        <ImagePlus className="w-8 h-8 text-slate-300 mb-2" />
                        <span className="text-xs text-slate-400">Add photo</span>
                      </button>
                    )}
                    
                    {/* Destination label */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                      <p className="text-white font-semibold text-sm truncate">{getDestinationDisplayName(destination)}</p>
                      {destination.type === 'city' && (
                        <p className="text-white/70 text-xs truncate">{destination.country}</p>
                      )}
                    </div>

                    {/* Visit order badge */}
                    <div className="absolute top-2 left-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">{destination.visitOrder}</span>
                    </div>

                    {/* Remove button */}
                    <button
                      onClick={() => removeDestination(destination.id)}
                      className="absolute top-2 right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>

                    {/* Change image button */}
                    {destination.image && (
                      <button
                        onClick={() => triggerImageUpload(destination.id)}
                        className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <ImagePlus className="w-8 h-8 text-white" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stats */}
        {destinations.length > 0 && (
          <div className="mt-4 text-center">
            <span className="text-sm text-slate-500">
              {destinations.length} {destinations.length === 1 ? 'destination' : 'destinations'} added
            </span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-6">
        <Button
          onClick={() => onNext(destinations)}
          disabled={destinations.length === 0}
          className="w-full h-14 text-lg font-semibold rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:opacity-50"
        >
          Generate My Recap
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );
}
