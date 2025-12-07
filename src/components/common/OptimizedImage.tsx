import { useState, useEffect, ImgHTMLAttributes } from 'react';

interface OptimizedImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src: string;
  alt: string;
  fallback?: string;
  lazy?: boolean;
  blur?: boolean;
}

export const OptimizedImage = ({
  src,
  alt,
  fallback = '/placeholder.png',
  lazy = true,
  blur = true,
  className = '',
  ...props
}: OptimizedImageProps) => {
  const [imageSrc, setImageSrc] = useState<string>(blur ? fallback : src);
  const [imageError, setImageError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const loadImage = () => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      setImageSrc(src);
      setIsLoaded(true);
    };
    img.onerror = () => {
      setImageError(true);
      setImageSrc(fallback);
    };
  };

  useEffect(() => {
    if (!lazy) {
      loadImage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, lazy]);

  useEffect(() => {
    if (!lazy) return;

    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          loadImage();
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersection, {
      rootMargin: '50px',
    });

    const element = document.getElementById(`img-${src}`);
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, lazy]);

  return (
    <img
      id={`img-${src}`}
      src={imageSrc}
      alt={alt}
      className={`transition-opacity duration-300 ${
        isLoaded ? 'opacity-100' : 'opacity-50'
      } ${className}`}
      loading={lazy ? 'lazy' : 'eager'}
      onError={() => {
        if (!imageError) {
          setImageError(true);
          setImageSrc(fallback);
        }
      }}
      {...props}
    />
  );
};

export default OptimizedImage;
