import { useState } from "react";

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
  containerClassName?: string;
  showSkeleton?: boolean;
}

export function ImageWithFallback({
  src,
  alt,
  className = "",
  containerClassName = "",
  fallbackSrc = "/images/fallback-property.svg",
  showSkeleton = true,
  loading = "lazy",
  ...props
}: ImageWithFallbackProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const finalSrc = hasError || !src ? fallbackSrc : src;

  return (
    <div className={`relative overflow-hidden ${containerClassName}`}>
      {showSkeleton && !isLoaded && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-stone-200 via-stone-100 to-stone-200" />
      )}
      <img
        src={finalSrc}
        alt={alt || "Property image"}
        loading={loading}
        decoding="async"
        onLoad={() => setIsLoaded(true)}
        onError={() => {
          if (!hasError) {
            setHasError(true);
            setIsLoaded(true);
          }
        }}
        className={`transition-opacity duration-300 ${isLoaded ? "opacity-100" : "opacity-0"} ${className}`}
        {...props}
      />
    </div>
  );
}
