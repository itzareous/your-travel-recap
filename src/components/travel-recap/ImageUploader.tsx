import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { TravelImage } from "./types";
import { ArrowLeft, ArrowRight, Plus, X, Upload, Image as ImageIcon, Loader2 } from "lucide-react";
import exifr from "exifr";

interface ImageUploaderProps {
  onNext: (images: TravelImage[]) => void;
  onBack: () => void;
  initialImages?: TravelImage[];
}

export default function ImageUploader({ onNext, onBack, initialImages }: ImageUploaderProps) {
  const [images, setImages] = useState<TravelImage[]>(initialImages || []);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const extractGeoTag = async (file: File): Promise<TravelImage['geoTag'] | undefined> => {
    try {
      const exifData = await exifr.gps(file);
      if (exifData && exifData.latitude && exifData.longitude) {
        // Try to reverse geocode with higher zoom for better city detection
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${exifData.latitude}&lon=${exifData.longitude}&zoom=14&addressdetails=1`,
            {
              headers: {
                'User-Agent': 'TravelRecapApp/1.0'
              }
            }
          );
          const data = await response.json();
          
          // Extract city from various possible fields
          const suggestedCity = data.address?.city || 
                               data.address?.town || 
                               data.address?.village || 
                               data.address?.locality ||
                               data.address?.municipality ||
                               data.address?.suburb ||
                               data.address?.district;
          
          const suggestedCountry = data.address?.country;
          
          return {
            lat: exifData.latitude,
            lng: exifData.longitude,
            suggestedCity: suggestedCity || undefined,
            suggestedCountry: suggestedCountry || undefined
          };
        } catch {
          return {
            lat: exifData.latitude,
            lng: exifData.longitude
          };
        }
      }
    } catch {
      // No EXIF data or error reading it
    }
    return undefined;
  };

  const handleFilesSelected = useCallback(async (files: FileList) => {
    console.log(`=== FILE SELECTION DEBUG ===`);
    console.log(`Files selected: ${files.length}`);
    
    if (files.length === 0) return;
    
    setIsProcessing(true);
    
    try {
      const newImages: TravelImage[] = [];
      
      // Convert FileList to Array for reliable iteration
      const fileArray = Array.from(files);
      console.log(`Processing ${fileArray.length} files...`);
      
      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i];
        console.log(`Processing file ${i + 1}/${fileArray.length}: ${file.name}`);
        
        if (!file.type.startsWith('image/')) {
          console.log(`  -> Skipped (not an image): ${file.type}`);
          continue;
        }
        
        const preview = URL.createObjectURL(file);
        const geoTag = await extractGeoTag(file);
        
        newImages.push({
          id: crypto.randomUUID(),
          file,
          preview,
          geoTag,
          order: images.length + newImages.length + 1
        });
        
        console.log(`  -> Added image ${newImages.length}`);
      }
      
      console.log(`Total new images to add: ${newImages.length}`);
      
      if (newImages.length > 0) {
        setImages(prev => {
          const updated = [...prev, ...newImages];
          console.log(`Images state updated: ${prev.length} -> ${updated.length}`);
          return updated;
        });
      }
    } finally {
      setIsProcessing(false);
    }
  }, [images.length]);

  const removeImage = (id: string) => {
    setImages(prev => {
      const filtered = prev.filter(img => img.id !== id);
      return filtered.map((img, i) => ({ ...img, order: i + 1 }));
    });
  };

  const taggedCount = images.filter(img => img.location).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files) {
            handleFilesSelected(e.target.files);
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
        <span className="text-sm text-slate-500">Step 2 of 4</span>
        <div className="w-10" />
      </div>

      {/* Content */}
      <div className="flex-1 px-4 pb-4 overflow-y-auto">
        <div className="max-w-lg mx-auto">
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Upload your travel memories</h1>
          <p className="text-slate-500 mb-6">Add photos from your travels and we'll help you tag them</p>

          {/* Progress indicator */}
          {images.length > 0 && (
            <div className="mb-4 p-3 bg-purple-50 rounded-xl">
              <p className="text-sm text-purple-700">
                {taggedCount} of {images.length} images tagged
              </p>
            </div>
          )}

          {/* Upload area */}
          <div 
            onClick={() => !isProcessing && fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onDragEnter={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (!isProcessing && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                handleFilesSelected(e.dataTransfer.files);
              }
            }}
            className={`mb-6 border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center cursor-pointer hover:border-purple-400 hover:bg-purple-50/50 transition-colors relative ${isProcessing ? 'pointer-events-none' : ''}`}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-12 h-12 text-purple-500 mx-auto mb-4 animate-spin" />
                <p className="text-purple-600 font-medium mb-1">Processing images...</p>
                <p className="text-slate-400 text-sm">Please wait</p>
              </>
            ) : (
              <>
                <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600 font-medium mb-1">Click to upload photos</p>
                <p className="text-slate-400 text-sm">or drag and drop</p>
              </>
            )}
          </div>

          {/* Image grid */}
          {images.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mb-6">
              {images.map((image) => (
                <div key={image.id} className="relative aspect-square rounded-xl overflow-hidden group">
                  <img 
                    src={image.preview} 
                    alt="Travel memory"
                    className="w-full h-full object-cover"
                  />
                  {/* Remove button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage(image.id);
                    }}
                    className="absolute top-1 right-1 p-1 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                  {/* Status badge */}
                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent">
                    {image.location ? (
                      <p className="text-white text-xs truncate">
                        {image.location.type === 'city' 
                          ? `${image.location.name}, ${image.location.country}`
                          : image.location.country}
                      </p>
                    ) : (
                      <p className="text-white/70 text-xs">Not tagged</p>
                    )}
                  </div>
                  {/* Geo tag indicator */}
                  {image.geoTag && !image.location && (
                    <div className="absolute top-1 left-1 px-2 py-0.5 bg-green-500 rounded-full">
                      <p className="text-white text-[10px]">GPS</p>
                    </div>
                  )}
                </div>
              ))}
              {/* Add more button */}
              <button
                onClick={() => !isProcessing && fileInputRef.current?.click()}
                disabled={isProcessing}
                className="aspect-square rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center hover:border-purple-400 hover:bg-purple-50/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
                ) : (
                  <>
                    <Plus className="w-8 h-8 text-slate-400" />
                    <span className="text-xs text-slate-400 mt-1">Add more</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Empty state */}
          {images.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <ImageIcon className="w-10 h-10 text-slate-300" />
              </div>
              <p className="text-slate-400 text-lg">No photos added yet</p>
              <p className="text-slate-400 text-sm">Upload your travel memories to get started</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 bg-white border-t border-slate-200">
        <div className="max-w-lg mx-auto">
          <Button
            onClick={() => onNext(images)}
            disabled={images.length === 0 || isProcessing}
            className="w-full h-12 rounded-xl bg-purple-500 hover:bg-purple-600 text-white font-medium"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                Continue to Tag Locations
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
