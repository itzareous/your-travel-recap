import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { TravelImage } from "./types";
import { ArrowLeft, ArrowRight, Plus, X, Upload, Image as ImageIcon, Loader2, MapPin } from "lucide-react";
import exifr from "exifr";
import { fadeInUp, scaleInBounce, staggerContainer, popIn } from "@/utils/animations";

interface ImageUploaderProps {
  onNext: (images: TravelImage[]) => void;
  onBack: () => void;
  initialImages?: TravelImage[];
}

export default function ImageUploader({ onNext, onBack, initialImages }: ImageUploaderProps) {
  const [images, setImages] = useState<TravelImage[]>(initialImages || []);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressWidth, setProgressWidth] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Animate progress bar on mount
    const timer = setTimeout(() => setProgressWidth(50), 300);
    return () => clearTimeout(timer);
  }, []);

  const extractExifData = async (file: File): Promise<{ geoTag?: TravelImage['geoTag']; timestamp?: number }> => {
    let geoTag: TravelImage['geoTag'] | undefined;
    let timestamp: number | undefined;

    try {
      console.log(`Extracting EXIF from ${file.name}...`);
      
      // Parse EXIF - let exifr handle GPS conversion automatically
      const exifData = await exifr.parse(file, {
        gps: true
        // Don't use 'pick' - it blocks GPS extraction
      });

      console.log(`EXIF data for ${file.name}:`, exifData);

      // Extract timestamp - handle both string and Date object
      if (exifData?.DateTimeOriginal || exifData?.CreateDate) {
        const dateVal = exifData.DateTimeOriginal || exifData.CreateDate;
        timestamp = dateVal instanceof Date ? dateVal.getTime() : new Date(dateVal).getTime();
        console.log(`✓ Timestamp found: ${new Date(timestamp).toISOString()}`);
      }

      // Extract GPS data
      if (exifData?.latitude && exifData?.longitude) {
        console.log(`✓ GPS found: ${exifData.latitude}, ${exifData.longitude}`);
        
        // Initialize geoTag with coordinates
        geoTag = {
          lat: exifData.latitude,
          lng: exifData.longitude
        };
        
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
          
          console.log(`Geocoded ${file.name}:`, data);
          
          // Extract city from various possible fields
          const suggestedCity = data.address?.city || 
                               data.address?.town || 
                               data.address?.village || 
                               data.address?.locality ||
                               data.address?.municipality ||
                               data.address?.suburb ||
                               data.address?.district;
          
          const suggestedCountry = data.address?.country;
          
          if (suggestedCity || suggestedCountry) {
            geoTag.suggestedCity = suggestedCity || undefined;
            geoTag.suggestedCountry = suggestedCountry || undefined;
            console.log(`✓ Location: ${suggestedCity}, ${suggestedCountry}`);
          }
        } catch (geoError) {
          console.error(`Geocoding failed for ${file.name}:`, geoError);
        }
      } else {
        console.log(`✗ No GPS data in ${file.name}`);
      }
    } catch (exifError) {
      console.error(`EXIF extraction failed for ${file.name}:`, exifError);
    }

    // Fallback to file lastModified if no EXIF timestamp
    if (!timestamp) {
      timestamp = file.lastModified;
    }

    return { geoTag, timestamp };
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
        const { geoTag, timestamp } = await extractExifData(file);
        
        newImages.push({
          id: crypto.randomUUID(),
          file,
          preview,
          geoTag,
          timestamp,
          order: images.length + newImages.length + 1
        });
        
        console.log(`  -> Added image ${newImages.length}, has geoTag: ${!!geoTag}`);
      }
      
      console.log(`Total new images to add: ${newImages.length}`);
      console.log(`Images with GPS: ${newImages.filter(img => img.geoTag).length}`);
      
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
    <div className="min-h-screen bg-[#0B0101] flex flex-col">
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
      <motion.div 
        className="p-4 flex items-center justify-between"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <motion.button 
          onClick={onBack}
          className="p-2 hover:bg-[#233038] rounded-full transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <ArrowLeft className="w-6 h-6 text-[#D3DBDD]" />
        </motion.button>
        <motion.span 
          className="text-sm text-[#D3DBDD]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Step 2 of 4
        </motion.span>
        <div className="w-10" />
      </motion.div>

      {/* Progress bar */}
      <div className="px-6 mb-4">
        <div className="h-2 bg-[#233038] rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-[#FF5B04] rounded-full"
            initial={{ width: "25%" }}
            animate={{ width: `${progressWidth}%` }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 pb-4 overflow-y-auto">
        <div className="max-w-lg mx-auto">
          <motion.h1 
            className="text-2xl font-bold text-[#FDF6E3] mb-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            Upload your travel memories
          </motion.h1>
          <motion.p 
            className="text-[#D3DBDD] mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            Add photos from your travels and we'll help you tag them
          </motion.p>

          {/* Progress indicator */}
          <AnimatePresence>
            {images.length > 0 && (
              <motion.div 
                className="mb-4 p-3 bg-[#233038] rounded-xl border border-[#075056]"
                initial={{ opacity: 0, scale: 0.9, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                <p className="text-sm text-[#F4D47C]">
                  {taggedCount} of {images.length} images tagged
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Upload area - only show when no images */}
          <AnimatePresence>
            {images.length === 0 && (
              <motion.div 
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
                className={`mb-6 border-2 border-dashed border-[#075056] bg-[#233038] rounded-2xl p-12 text-center cursor-pointer hover:border-[#FF5B04] transition-colors relative ${isProcessing ? 'pointer-events-none' : ''}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1,
                  boxShadow: ["0 0 0px rgba(255, 91, 4, 0)", "0 0 20px rgba(255, 91, 4, 0.2)", "0 0 0px rgba(255, 91, 4, 0)"]
                }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ 
                  duration: 0.5,
                  boxShadow: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                }}
                whileHover={{ scale: 1.02, borderColor: "#FF5B04" }}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-12 h-12 text-[#FF5B04] mx-auto mb-4 animate-spin" />
                    <p className="text-[#FF5B04] font-medium mb-1">Processing images...</p>
                    <p className="text-[#D3DBDD] text-sm">Please wait</p>
                  </>
                ) : (
                  <>
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <Plus className="w-16 h-16 text-[#D3DBDD] mx-auto mb-4" />
                    </motion.div>
                    <p className="text-[#FDF6E3] font-medium text-lg mb-1">Click to upload photos</p>
                    <p className="text-[#D3DBDD] text-sm">or drag and drop</p>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Image grid */}
          <AnimatePresence>
            {images.length > 0 && (
              <motion.div 
                className="grid grid-cols-3 gap-3 mb-6"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
              >
                {images.map((image, index) => (
                  <motion.div 
                    key={image.id} 
                    className="relative aspect-square rounded-xl overflow-hidden group border border-[#075056]"
                    variants={popIn}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: index * 0.1 }}
                    layout
                  >
                    <img 
                      src={image.preview} 
                      alt="Travel memory"
                      className="w-full h-full object-cover"
                    />
                    {/* Remove button */}
                    <motion.button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage(image.id);
                      }}
                      className="absolute top-1 right-1 p-1 bg-[#0B0101] rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#FF5B04]"
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <X className="w-4 h-4 text-white" />
                    </motion.button>
                    {/* Status badge */}
                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-[#0B0101]/80">
                      {image.location ? (
                        <p className="text-[#F4D47C] text-xs truncate">
                          {image.location.type === 'city' 
                            ? `${image.location.name}, ${image.location.country}`
                            : image.location.country}
                        </p>
                      ) : (
                        <p className="text-[#D3DBDD] text-xs">Not tagged</p>
                      )}
                    </div>
                    {/* Location indicator */}
                    {image.geoTag && !image.location && (
                      <motion.div 
                        className="absolute top-1 left-1 px-2 py-0.5 bg-[#2563EB] rounded-full flex items-center gap-1"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3, type: "spring" }}
                      >
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          <MapPin className="w-3 h-3 text-white" />
                        </motion.div>
                        <p className="text-white text-[10px]">Location</p>
                      </motion.div>
                    )}
                  </motion.div>
                ))}
                {/* Add more button */}
                <motion.button
                  onClick={() => !isProcessing && fileInputRef.current?.click()}
                  disabled={isProcessing}
                  className="aspect-square rounded-xl border-2 border-dashed border-[#075056] bg-[#233038] flex flex-col items-center justify-center hover:border-[#FF5B04] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  variants={popIn}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isProcessing ? (
                    <Loader2 className="w-8 h-8 text-[#FF5B04] animate-spin" />
                  ) : (
                    <>
                      <Plus className="w-8 h-8 text-[#D3DBDD]" />
                      <span className="text-xs text-[#D3DBDD] mt-1">Add more</span>
                    </>
                  )}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Empty state - only show when no images and not processing */}
          <AnimatePresence>
            {images.length === 0 && !isProcessing && (
              <motion.div 
                className="flex flex-col items-center justify-center py-8 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.8 }}
              >
                <p className="text-[#D3DBDD] text-sm">Upload your travel memories to get started</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer */}
      <motion.div 
        className="p-4 bg-[#233038] border-t border-[#075056]"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        <div className="max-w-lg mx-auto">
          <motion.div
            whileHover={{ scale: images.length > 0 && !isProcessing ? 1.02 : 1 }}
            whileTap={{ scale: images.length > 0 && !isProcessing ? 0.98 : 1 }}
          >
            <Button
              onClick={() => onNext(images)}
              disabled={images.length === 0 || isProcessing}
              className="w-full h-12 rounded-full bg-[#FF5B04] hover:bg-[#E54F03] text-white font-medium disabled:bg-[#233038] disabled:text-[#D3DBDD] transition-colors"
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
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
