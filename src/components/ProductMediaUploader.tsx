import React, { useRef } from 'react';
import { Camera, Video, X } from 'lucide-react';
import { useTranslation } from '../translations';
import { Language } from '../types';

interface ProductMediaUploaderProps {
  images: string[];
  video: string | null;
  onImagesChange: (images: string[]) => void;
  onVideoChange: (video: string | null, mimeType: string | null) => void;
  language: Language;
}

export const ProductMediaUploader: React.FC<ProductMediaUploaderProps> = ({
  images,
  video,
  onImagesChange,
  onVideoChange,
  language
}) => {
  const t = useTranslation(language);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    if (images.length + files.length > 6) {
      alert('You can only upload up to 6 images.');
      return;
    }

    const newImages: string[] = [];
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newImages.push(reader.result as string);
        if (newImages.length === files.length) {
          onImagesChange([...images, ...newImages]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) { // 15MB limit for Gemini inlineData
        alert('Video size must be less than 15MB for AI analysis.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        onVideoChange(reader.result as string, file.type);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    onImagesChange(newImages);
  };

  const removeVideo = () => {
    onVideoChange(null, null);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xs font-mono font-bold text-[var(--text-muted)] uppercase tracking-widest">Product Media</h3>
      
      <div className="grid grid-cols-3 gap-4">
        {/* Image Upload Button */}
        {images.length < 6 && (
          <div 
            onClick={() => imageInputRef.current?.click()}
            className="aspect-square card flex flex-col items-center justify-center cursor-pointer border-dashed border-[var(--glass-border)] hover:border-cyan-400/50 transition-all group"
          >
            <Camera size={24} className="text-[var(--text-muted)] group-hover:text-cyan-400 mb-2" />
            <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase text-center px-2">Add Image ({images.length}/6)</span>
            <input 
              type="file" 
              accept="image/*" 
              multiple 
              onChange={handleImageUpload} 
              className="hidden" 
              ref={imageInputRef}
            />
          </div>
        )}

        {/* Video Upload Button */}
        {!video && (
          <div 
            onClick={() => videoInputRef.current?.click()}
            className="aspect-square card flex flex-col items-center justify-center cursor-pointer border-dashed border-[var(--glass-border)] hover:border-purple-400/50 transition-all group"
          >
            <Video size={24} className="text-[var(--text-muted)] group-hover:text-purple-400 mb-2" />
            <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase text-center px-2">Add Video (Max 1)</span>
            <input 
              type="file" 
              accept="video/*" 
              onChange={handleVideoUpload} 
              className="hidden" 
              ref={videoInputRef}
            />
          </div>
        )}

        {/* Image Previews */}
        {images.map((img, idx) => (
          <div key={idx} className="aspect-square relative rounded-xl overflow-hidden border border-[var(--glass-border)] group">
            <img src={img} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
            <button 
              onClick={() => removeImage(idx)}
              className="absolute top-2 right-2 p-1.5 bg-black/50 backdrop-blur-md rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-500"
            >
              <X size={14} />
            </button>
          </div>
        ))}

        {/* Video Preview */}
        {video && (
          <div className="aspect-square relative rounded-xl overflow-hidden border border-purple-500/30 group">
            <video src={video} className="w-full h-full object-cover" controls />
            <button 
              onClick={removeVideo}
              className="absolute top-2 right-2 p-1.5 bg-black/50 backdrop-blur-md rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-500 z-10"
            >
              <X size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
