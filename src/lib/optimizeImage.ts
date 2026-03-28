/**
 * Optimize image URLs for WebP delivery.
 * 
 * For Supabase Storage URLs: uses Supabase Image Transformation API
 * For external URLs: returns as-is (browser handles format negotiation)
 * 
 * Usage:
 *   <img src={optimizeImage(url)} />
 *   <img src={optimizeImage(url, { width: 400, quality: 75 })} />
 */

interface OptimizeOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: "webp" | "avif" | "origin";
}

export function optimizeImage(
  url: string | null | undefined,
  options: OptimizeOptions = {}
): string {
  if (!url) return "";

  const { width, height, quality = 80, format = "webp" } = options;

  // Only transform Supabase Storage URLs
  if (!url.includes("supabase.co/storage/v1/object/public/")) {
    return url;
  }

  // Build transformation params
  const params = new URLSearchParams();
  if (format !== "origin") params.set("format", format);
  if (quality) params.set("quality", String(quality));
  if (width) params.set("width", String(width));
  if (height) params.set("height", String(height));

  // Convert public URL to render URL
  // From: .../storage/v1/object/public/bucket/path
  // To:   .../storage/v1/render/image/public/bucket/path?format=webp
  const optimizedUrl = url.replace(
    "/storage/v1/object/public/",
    "/storage/v1/render/image/public/"
  );

  const separator = optimizedUrl.includes("?") ? "&" : "?";
  return `${optimizedUrl}${separator}${params.toString()}`;
}

/**
 * Generate srcSet for responsive images
 * Usage: <img src={optimizeImage(url)} srcSet={responsiveSrcSet(url)} sizes="(max-width: 768px) 100vw, 50vw" />
 */
export function responsiveSrcSet(
  url: string | null | undefined,
  widths: number[] = [400, 800, 1200],
  quality = 80
): string {
  if (!url) return "";
  return widths
    .map((w) => `${optimizeImage(url, { width: w, quality })} ${w}w`)
    .join(", ");
}
