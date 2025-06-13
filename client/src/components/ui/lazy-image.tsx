import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  placeholderClassName?: string;
  wrapperClassName?: string;
}

export function LazyImage({
  src,
  alt,
  className,
  placeholderClassName,
  wrapperClassName,
  ...props
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Create an IntersectionObserver to track when the image enters viewport
    if (!imgRef.current) return;
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      });
    }, {
      rootMargin: '200px', // Start loading image when it's 200px from viewport
      threshold: 0.01,
    });
    
    observer.observe(imgRef.current);
    return () => observer.disconnect();
  }, []);

  // Handle image load event
  const handleImageLoad = () => {
    setIsLoaded(true);
  };

  return (
    <div 
      ref={imgRef}
      className={cn("relative overflow-hidden", wrapperClassName)}
      {...props}
    >
      {/* Placeholder shown while image is loading */}
      {!isLoaded && (
        <div 
          className={cn(
            "absolute inset-0 bg-muted/30 animate-pulse",
            placeholderClassName
          )} 
        />
      )}
      
      {/* Only load the image when it's near or in viewport */}
      {isInView && (
        <img
          src={src}
          alt={alt}
          className={cn(
            "transition-opacity duration-300", 
            isLoaded ? "opacity-100" : "opacity-0",
            className
          )}
          onLoad={handleImageLoad}
          loading="lazy"
        />
      )}
    </div>
  );
}