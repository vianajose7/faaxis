import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ImageIcon, Loader2, XIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ImageUploadProps {
  onImageUpload: (imageUrl: string) => void;
  defaultImage?: string;
}

export function ImageUpload({ onImageUpload, defaultImage }: ImageUploadProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(defaultImage || null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Basic file validation
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload an image file (JPEG, PNG, etc.)',
        variant: 'destructive',
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast({
        title: 'File too large',
        description: 'Image must be less than 5MB',
        variant: 'destructive',
      });
      return;
    }

    // Show preview for the selected image
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setImagePreview(result);
      
      // In a real implementation, we would upload the image to a server here
      // For now, we'll simulate an upload
      simulateUpload(result);
    };
    reader.readAsDataURL(file);
  };

  const simulateUpload = (imageDataUrl: string) => {
    setIsUploading(true);
    
    // Simulate API delay
    setTimeout(() => {
      onImageUpload(imageDataUrl);
      setIsUploading(false);
      toast({
        title: 'Image uploaded',
        description: 'Your image has been uploaded successfully',
      });
    }, 1500);
  };

  const removeImage = () => {
    setImagePreview(null);
    onImageUpload('');
  };

  return (
    <div className="space-y-4">
      {!imagePreview ? (
        <div className="flex items-center justify-center border-2 border-dashed border-input rounded-md p-6 cursor-pointer hover:border-primary/50 transition-colors">
          <label className="flex flex-col items-center gap-2 cursor-pointer">
            <ImageIcon className="h-8 w-8 text-muted-foreground" />
            <span className="text-sm font-medium">
              {isUploading ? 'Uploading...' : 'Click to upload an image'}
            </span>
            <span className="text-xs text-muted-foreground">
              JPEG, PNG, GIF up to 5MB
            </span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
              disabled={isUploading}
            />
          </label>
        </div>
      ) : (
        <div className="relative rounded-md overflow-hidden border border-input">
          <img
            src={imagePreview}
            alt="Preview"
            className="w-full h-auto max-h-[300px] object-contain"
          />
          <div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
            <div className="flex gap-2">
              <Button 
                variant="destructive" 
                size="icon" 
                onClick={removeImage}
                disabled={isUploading}
              >
                <XIcon className="h-4 w-4" />
              </Button>
              <Button variant="secondary" size="sm" asChild>
                <label className="cursor-pointer">
                  Change
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                    disabled={isUploading}
                  />
                </label>
              </Button>
            </div>
          </div>
          {isUploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-white" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}