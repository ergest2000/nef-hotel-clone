import { optimizeImage, responsiveSrcSet } from "@/lib/optimizeImage";

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string | null | undefined;
  width?: number;
  quality?: number;
  responsive?: boolean;
  responsiveWidths?: number[];
}

/**
 * Drop-in replacement for <img> that automatically serves WebP.
 * 
 * Usage:
 *   <OptimizedImg src={url} alt="..." className="w-full" />
 *   <OptimizedImg src={url} width={400} quality={75} responsive />
 */
export function OptimizedImg({
  src,
  width,
  quality = 80,
  responsive = false,
  responsiveWidths = [400, 800, 1200],
  ...props
}: OptimizedImageProps) {
  const optimizedSrc = optimizeImage(src, { width, quality });
  const srcSet = responsive ? responsiveSrcSet(src, responsiveWidths, quality) : undefined;

  return (
    <img
      {...props}
      src={optimizedSrc}
      srcSet={srcSet}
      sizes={responsive && !props.sizes ? "(max-width: 768px) 100vw, 50vw" : props.sizes}
      loading={props.loading || "lazy"}
    />
  );
}
