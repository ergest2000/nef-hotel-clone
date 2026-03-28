import { useState, useMemo, useCallback, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useCart } from "@/hooks/useCart";
import {
  useCollections, useProducts, useProductImages,
  useAllProductColors, useAllProductSizes,
  useWishlist, useToggleWishlist,
  type ProductColor, type ProductSize,
} from "@/hooks/useCollections";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Heart, ShoppingBag, Package, ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { useDesign } from "@/hooks/useDesignSettings";
import ProductColorPicker from "@/components/ProductColorPicker";

/* Default SVG icon for "Customizable" badge — overridable from Dashboard > Design Settings > customizable_icon_url */
const DefaultCustomizeIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 512 512" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M0 0 C1.17 -0.05 1.17 -0.05 2.37 -0.09 C10.09 1.57 15.79 7.75 21.13 13.21 C21.85 13.93 22.57 14.66 23.31 15.41 C25.59 17.7 27.86 20.01 30.13 22.31 C31.68 23.88 33.23 25.45 34.79 27.01 C38.57 30.83 42.35 34.66 46.13 38.5 C49.15 37.15 51.21 35.65 53.51 33.29 C54.15 32.64 54.8 31.99 55.46 31.32 C56.14 30.62 56.82 29.91 57.52 29.19 C58.99 27.71 60.45 26.22 61.91 24.74 C64.21 22.4 66.5 20.06 68.79 17.72 C71.01 15.45 73.23 13.2 75.46 10.94 C76.48 9.89 76.48 9.89 77.52 8.82 C82.32 3.97 86.85 0.09 94 0 C95.17 -0.05 95.17 -0.05 96.37 -0.09 C104.93 1.75 110.98 8.89 116.91 14.89 C118.38 16.38 119.86 17.84 121.34 19.31 C133.67 31.6 133.67 31.6 133.75 39.38 C133.18 48.62 125.84 55.22 119.54 61.38 C118.84 62.08 118.14 62.77 117.41 63.49 C115.2 65.69 112.97 67.88 110.75 70.06 C109.23 71.56 107.72 73.06 106.21 74.56 C102.52 78.22 98.83 81.86 95.13 85.5 C96.86 89.22 98.98 91.59 101.91 94.48 C102.38 94.94 102.84 95.41 103.32 95.88 C104.79 97.34 106.27 98.8 107.75 100.25 C108.75 101.24 109.76 102.24 110.76 103.23 C113.21 105.66 115.66 108.08 118.13 110.5 C121.15 109.15 123.21 107.65 125.51 105.29 C126.15 104.64 126.8 103.99 127.46 103.32 C128.14 102.62 128.82 101.91 129.52 101.19 C130.99 99.71 132.45 98.22 133.91 96.74 C136.21 94.4 138.5 92.06 140.79 89.72 C143.01 87.45 145.23 85.2 147.46 82.94 C148.48 81.89 148.48 81.89 149.52 80.82 C154.32 75.97 158.85 72.09 166 72 C166.78 71.97 167.56 71.94 168.37 71.91 C176.93 73.75 182.98 80.89 188.91 86.89 C190.38 88.38 191.86 89.84 193.34 91.31 C205.67 103.6 205.67 103.6 205.75 111.38 C205.18 120.62 197.84 127.22 191.54 133.38 C190.84 134.08 190.14 134.77 189.41 135.49 C187.2 137.69 184.97 139.88 182.75 142.06 C181.23 143.56 179.72 145.06 178.21 146.56 C174.52 150.22 170.83 153.86 167.13 157.5 C168.86 161.22 170.98 163.59 173.91 166.48 C174.38 166.94 174.84 167.41 175.32 167.88 C176.79 169.34 178.27 170.8 179.75 172.25 C180.75 173.24 181.76 174.24 182.76 175.23 C185.21 177.66 187.66 180.08 190.13 182.5 C193.15 181.15 195.21 179.65 197.51 177.29 C198.15 176.64 198.8 175.99 199.46 175.32 C200.14 174.62 200.82 173.91 201.52 173.19 C202.99 171.71 204.45 170.22 205.91 168.74 C208.21 166.4 210.5 164.06 212.79 161.72 C215.01 159.45 217.23 157.2 219.46 154.94 C220.48 153.89 220.48 153.89 221.52 152.82 C226.32 147.97 230.85 144.09 238 144 C239.17 143.95 239.17 143.95 240.37 143.91 C248.93 145.75 254.98 152.89 260.91 158.89 C262.38 160.38 263.86 161.84 265.34 163.31 C277.67 175.6 277.67 175.6 277.75 183.38 C277.18 192.62 269.84 199.22 263.54 205.38 C262.84 206.08 262.14 206.77 261.41 207.49 C259.2 209.69 256.97 211.88 254.75 214.06 C253.23 215.56 251.72 217.06 250.21 218.56 C246.52 222.22 242.83 225.86 239.13 229.5 C240.49 232.57 242.01 234.61 244.43 236.93 C245.1 237.58 245.77 238.24 246.46 238.91 C247.18 239.6 247.91 240.3 248.65 241.01 C250.18 242.51 251.71 244 253.24 245.5 C255.65 247.84 258.06 250.18 260.48 252.51 C262.82 254.77 265.15 257.05 267.46 259.32 C268.55 260.35 268.55 260.35 269.65 261.4 C274.2 265.9 277.07 270.09 278.13 276.5 C277.7 288.48 266.37 296.46 258.5 304.38 C257.56 305.33 256.62 306.29 255.69 307.25 C254.79 308.15 253.89 309.06 252.96 309.99 C252.15 310.81 251.34 311.63 250.51 312.47 C246.87 315.57 243.44 316.79 238.69 316.81 C237.97 316.83 237.25 316.85 236.5 316.86 C229.15 315.74 224.62 310.39 219.66 305.33 C218.87 304.54 218.08 303.74 217.27 302.92 C214.76 300.39 212.25 297.85 209.75 295.31 C208.04 293.59 206.34 291.87 204.63 290.15 C200.45 285.94 196.29 281.72 192.13 277.5 C188.11 280.88 184.2 284.3 180.5 288.02 C179.32 289.21 179.32 289.21 178.11 290.43 C177.31 291.23 176.51 292.04 175.69 292.88 C174.86 293.71 174.03 294.54 173.18 295.39 C171.16 297.43 169.14 299.46 167.13 301.5 C168.49 304.58 170.05 306.66 172.44 309.01 C173.12 309.68 173.79 310.35 174.48 311.03 C175.57 312.1 175.57 312.1 176.69 313.19 C177.43 313.93 178.18 314.67 178.95 315.43 C181.34 317.79 183.73 320.15 186.13 322.5 C189.28 325.6 192.42 328.7 195.56 331.81 C196.65 332.88 196.65 332.88 197.77 333.97 C198.44 334.63 199.11 335.3 199.81 335.99 C200.4 336.57 201 337.15 201.61 337.76 C204.82 341.44 205.44 344.54 205.5 349.38 C205.53 350.38 205.56 351.39 205.59 352.43 C204.64 358.75 199.81 363.12 195.44 367.48 C194.9 368.03 194.37 368.57 193.81 369.13 C192.68 370.26 191.55 371.39 190.42 372.52 C188.69 374.25 186.97 375.99 185.26 377.73 C184.15 378.84 183.05 379.94 181.94 381.05 C181.43 381.56 180.92 382.08 180.4 382.62 C176.23 386.73 172.57 388.78 166.69 388.81 C165.97 388.83 165.25 388.85 164.5 388.86 C157.15 387.74 152.62 382.39 147.66 377.33 C146.87 376.54 146.08 375.74 145.27 374.92 C142.76 372.39 140.25 369.85 137.75 367.31 C136.04 365.59 134.34 363.87 132.63 362.15 C128.45 357.94 124.29 353.72 120.13 349.5 C116.11 352.88 112.2 356.3 108.5 360.02 C107.32 361.21 107.32 361.21 106.11 362.43 C105.31 363.23 104.51 364.04 103.69 364.88 C102.86 365.71 102.03 366.54 101.18 367.39 C99.16 369.43 97.14 371.46 95.13 373.5 C96.49 376.58 98.05 378.66 100.44 381.01 C101.12 381.68 101.79 382.35 102.48 383.03 C103.57 384.1 103.57 384.1 104.69 385.19 C105.43 385.93 106.18 386.67 106.95 387.43 C109.34 389.79 111.73 392.15 114.13 394.5 C117.28 397.6 120.42 400.7 123.56 403.81 C124.65 404.88 124.65 404.88 125.77 405.97 C126.44 406.63 127.11 407.3 127.81 407.99 C128.4 408.57 129 409.15 129.61 409.76 C132.82 413.44 133.44 416.54 133.5 421.38 C133.53 422.38 133.56 423.39 133.59 424.43 C132.66 430.63 128 434.94 123.7 439.23 C123.18 439.75 122.67 440.26 122.14 440.8 C121.06 441.88 119.98 442.96 118.9 444.04 C117.25 445.68 115.62 447.34 113.99 449 C112.93 450.06 111.88 451.11 110.82 452.17 C110.1 452.9 110.1 452.9 109.36 453.65 C105.7 457.27 101.93 460.02 96.78 460.9 C96.07 460.89 95.36 460.88 94.63 460.88 C93.91 460.88 93.2 460.89 92.47 460.9 C85.13 459.65 80.64 454.41 75.66 449.33 C74.87 448.54 74.08 447.74 73.27 446.92 C70.76 444.39 68.25 441.85 65.75 439.31 C64.04 437.59 62.34 435.87 60.63 434.15 C56.45 429.94 52.29 425.72 48.13 421.5 C43.19 425.63 38.59 429.94 34.09 434.54 C32.77 435.88 31.46 437.21 30.14 438.54 C28.09 440.62 26.05 442.7 24.01 444.79 C22.02 446.82 20.03 448.84 18.03 450.86 C17.42 451.48 16.82 452.1 16.2 452.74 C12.26 456.7 8.48 459.93 2.78 460.9 C2.07 460.89 1.36 460.88 0.63 460.88 C-0.09 460.88 -0.8 460.89 -1.53 460.9 C-7.87 459.82 -11.96 455.86 -16.3 451.48 C-16.88 450.89 -17.47 450.31 -18.07 449.71 C-19.3 448.48 -20.53 447.25 -21.75 446.01 C-23.62 444.13 -25.51 442.26 -27.39 440.39 C-28.59 439.19 -29.79 437.99 -30.98 436.79 C-31.55 436.23 -32.11 435.68 -32.69 435.11 C-37.56 430.14 -39.05 426.59 -39.24 419.66 C-38.02 412.43 -32.69 407.93 -27.71 403.04 C-26.91 402.25 -26.12 401.46 -25.3 400.64 C-22.77 398.13 -20.23 395.63 -17.69 393.13 C-15.97 391.42 -14.25 389.71 -12.53 388 C-8.32 383.83 -4.1 379.66 0.13 375.5 C-1.65 371.69 -3.88 369.27 -6.88 366.3 C-7.37 365.81 -7.85 365.33 -8.35 364.83 C-9.9 363.3 -11.45 361.78 -13 360.25 C-14.05 359.21 -15.1 358.17 -16.15 357.13 C-18.72 354.58 -21.3 352.04 -23.88 349.5 C-28.81 353.63 -33.41 357.94 -37.91 362.54 C-39.23 363.88 -40.54 365.21 -41.86 366.54 C-43.91 368.62 -45.95 370.7 -47.99 372.79 C-49.98 374.82 -51.97 376.84 -53.97 378.86 C-54.58 379.48 -55.18 380.1 -55.8 380.74 C-60.38 385.35 -64.92 388.89 -71.69 389.06 C-82.22 388.52 -89.71 379.16 -96.69 372.13 C-97.61 371.22 -98.54 370.31 -99.5 369.38 C-110.82 358.04 -110.82 358.04 -111.38 349.5 C-110.71 340.8 -105.02 335.08 -99.05 329.28 C-98.3 328.54 -97.55 327.79 -96.78 327.03 C-94.4 324.68 -92.01 322.34 -89.63 320 C-88 318.4 -86.38 316.8 -84.77 315.2 C-80.81 311.29 -76.85 307.39 -72.88 303.5 C-74.61 299.78 -76.73 297.41 -79.66 294.52 C-80.13 294.06 -80.59 293.59 -81.07 293.12 C-82.54 291.66 -84.02 290.2 -85.5 288.75 C-86.5 287.76 -87.51 286.76 -88.51 285.77 C-90.96 283.34 -93.41 280.92 -95.88 278.5 C-98.9 279.85 -100.96 281.35 -103.26 283.71 C-103.9 284.36 -104.55 285.01 -105.21 285.68 C-105.89 286.38 -106.57 287.09 -107.27 287.81 C-108.74 289.29 -110.2 290.78 -111.66 292.26 C-113.96 294.6 -116.25 296.94 -118.54 299.28 C-120.76 301.55 -122.98 303.8 -125.21 306.06 C-125.89 306.76 -126.57 307.46 -127.27 308.18 C-132.04 313 -136.59 316.89 -143.69 317.06 C-153.89 316.53 -161.01 307.85 -167.79 300.98 C-169.26 299.49 -170.74 298.02 -172.23 296.55 C-173.18 295.6 -174.14 294.64 -175.09 293.69 C-175.93 292.84 -176.78 291.98 -177.66 291.11 C-181.13 287.03 -183.3 283.03 -183.38 277.63 C-183.41 276.84 -183.44 276.06 -183.47 275.26 C-181.81 267.53 -175.62 261.83 -170.17 256.5 C-169.44 255.78 -168.72 255.06 -167.97 254.31 C-165.67 252.04 -163.37 249.77 -161.06 247.5 C-159.49 245.95 -157.93 244.39 -156.36 242.84 C-152.54 239.05 -148.71 235.27 -144.88 231.5 C-146.23 228.48 -147.72 226.42 -150.08 224.11 C-150.73 223.47 -151.39 222.83 -152.06 222.17 C-152.76 221.49 -153.46 220.8 -154.18 220.1 C-155.67 218.64 -157.15 217.17 -158.63 215.71 C-160.97 213.42 -163.32 211.12 -165.66 208.83 C-167.92 206.62 -170.18 204.39 -172.43 202.16 C-173.13 201.49 -173.83 200.81 -174.56 200.11 C-179.41 195.31 -183.28 190.78 -183.38 183.63 C-183.41 182.84 -183.44 182.06 -183.47 181.26 C-181.58 172.51 -174.13 166.29 -168 160.23 C-166.43 158.68 -164.88 157.12 -163.33 155.55 C-162.33 154.55 -161.32 153.54 -160.32 152.54 C-159.42 151.65 -158.52 150.75 -157.59 149.82 C-153.47 146.3 -149.48 144.07 -144 144 C-142.83 143.95 -142.83 143.95 -141.63 143.91 C-133.91 145.57 -128.21 151.75 -122.88 157.21 C-122.15 157.93 -121.43 158.66 -120.69 159.41 C-118.41 161.7 -116.14 164.01 -113.88 166.31 C-112.32 167.88 -110.77 169.45 -109.21 171.01 C-105.43 174.83 -101.65 178.66 -97.88 182.5 C-94.16 180.76 -91.79 178.64 -88.89 175.71 C-88.43 175.25 -87.97 174.78 -87.5 174.31 C-86.03 172.83 -84.58 171.35 -83.13 169.88 C-82.13 168.87 -81.14 167.87 -80.14 166.87 C-77.72 164.42 -75.29 161.96 -72.88 159.5 C-74.23 156.48 -75.72 154.42 -78.08 152.11 C-78.73 151.47 -79.39 150.83 -80.06 150.17 C-80.76 149.49 -81.46 148.8 -82.18 148.1 C-83.67 146.64 -85.15 145.17 -86.63 143.71 C-88.97 141.42 -91.32 139.12 -93.66 136.83 C-95.92 134.62 -98.18 132.39 -100.43 130.16 C-101.13 129.49 -101.83 128.81 -102.56 128.11 C-107.41 123.31 -111.28 118.78 -111.38 111.63 C-111.41 110.84 -111.44 110.06 -111.47 109.26 C-109.58 100.51 -102.13 94.29 -96 88.23 C-94.43 86.68 -92.88 85.12 -91.33 83.55 C-90.33 82.55 -89.32 81.54 -88.32 80.54 C-87.42 79.65 -86.52 78.75 -85.59 77.82 C-81.47 74.3 -77.48 72.07 -72 72 C-71.22 71.97 -70.44 71.94 -69.63 71.91 C-61.91 73.57 -56.21 79.75 -50.88 85.21 C-50.15 85.93 -49.43 86.66 -48.69 87.41 C-46.41 89.7 -44.14 92.01 -41.88 94.31 C-40.32 95.88 -38.77 97.45 -37.21 99.01 C-33.43 102.83 -29.65 106.66 -25.88 110.5 C-22.16 108.76 -19.79 106.64 -16.89 103.71 C-16.43 103.25 -15.97 102.78 -15.5 102.31 C-14.03 100.83 -12.58 99.35 -11.13 97.88 C-10.13 96.87 -9.14 95.87 -8.14 94.87 C-5.72 92.42 -3.29 89.96 -0.88 87.5 C-2.23 84.48 -3.72 82.42 -6.08 80.11 C-6.73 79.47 -7.39 78.83 -8.06 78.17 C-8.76 77.49 -9.46 76.8 -10.18 76.1 C-11.67 74.64 -13.15 73.17 -14.63 71.71 C-16.97 69.42 -19.32 67.12 -21.66 64.83 C-23.92 62.62 -26.18 60.39 -28.43 58.16 C-29.13 57.49 -29.83 56.81 -30.56 56.11 C-35.41 51.31 -39.28 46.78 -39.38 39.63 C-39.42 38.45 -39.42 38.45 -39.47 37.26 C-37.58 28.51 -30.13 22.29 -24 16.23 C-22.43 14.68 -20.88 13.12 -19.33 11.55 C-18.33 10.55 -17.32 9.54 -16.32 8.54 C-15.42 7.65 -14.52 6.75 -13.59 5.82 C-9.47 2.3 -5.48 0.07 0 0Z" transform="translate(208.875,25.5)"/>
  </svg>
);

/* Customizable icon — reads from Dashboard, falls back to default SVG */
const CustomizeIcon = ({ className }: { className?: string }) => {
  const { settings } = useDesign();
  const iconUrl = settings["customizable_icon_url"];
  if (iconUrl) {
    return <img src={iconUrl} alt="" className={className} style={{ objectFit: "contain" }} />;
  }
  return <DefaultCustomizeIcon className={className} />;
};

// ─── Title Case helper ─────────────────────────────────────────
const toTitleCase = (str: string) =>
  str
    .toLowerCase()
    .replace(/(?:^|\s|[-/])\S/g, (match) => match.toUpperCase());

// Global Return Policy component
const GlobalReturnPolicy = ({ isAl }: { isAl: boolean }) => {
  const { settings } = useDesign();
  const policy = isAl
    ? (settings["global_return_policy_al"] || "Politika e kthimit do shtohet së shpejti.")
    : (settings["global_return_policy_en"] || "Returns policy will be added soon.");
  return <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{policy}</p>;
};

// ─── Image Lightbox ─────────────────────────────────────────────
const ImageLightbox = ({ images, startIndex, onClose }: { images: string[]; startIndex: number; onClose: () => void }) => {
  const [idx, setIdx] = useState(startIndex);
  const goPrev = () => setIdx((i) => (i > 0 ? i - 1 : images.length - 1));
  const goNext = () => setIdx((i) => (i < images.length - 1 ? i + 1 : 0));

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-black/95 border-none flex items-center justify-center">
        <button onClick={onClose} className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-background/20 flex items-center justify-center hover:bg-background/40 transition-colors">
          <X className="h-5 w-5 text-white" />
        </button>
        <div className="relative w-full h-full flex items-center justify-center min-h-[60vh]">
          <img src={images[idx]} alt="" className="max-w-full max-h-[85vh] object-contain" />
          {images.length > 1 && (
            <>
              <button onClick={goPrev} className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-background/20 flex items-center justify-center hover:bg-background/40 transition-colors">
                <ChevronLeft className="h-6 w-6 text-white" />
              </button>
              <button onClick={goNext} className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-background/20 flex items-center justify-center hover:bg-background/40 transition-colors">
                <ChevronRight className="h-6 w-6 text-white" />
              </button>
            </>
          )}
        </div>
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-sm">
          {idx + 1} / {images.length}
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ─── Product Image Gallery ──────────────────────────────────────
const ProductGallery = ({ mainImage, productId, colorImageUrl, onOpenLightbox }: { mainImage?: string | null; productId: string; colorImageUrl?: string | null; onOpenLightbox: (images: string[], index: number) => void }) => {
  const { data: extraImages } = useProductImages(productId);
  const allImages = useMemo(() => {
    const imgs: string[] = [];
    if (mainImage) imgs.push(mainImage);
    extraImages?.forEach((img) => {
      if (img.image_url && !imgs.includes(img.image_url)) imgs.push(img.image_url);
    });
    return imgs;
  }, [mainImage, extraImages]);

  const [selected, setSelected] = useState(0);

  // When a color image is set, show it as the active image
  const displayImage = colorImageUrl || allImages[selected];

  if (!allImages.length && !colorImageUrl) {
    return (
      <div className="aspect-square bg-muted flex items-center justify-center">
        <Package className="h-24 w-24 text-muted-foreground/20" />
      </div>
    );
  }

  const goPrev = () => setSelected((s) => (s > 0 ? s - 1 : allImages.length - 1));
  const goNext = () => setSelected((s) => (s < allImages.length - 1 ? s + 1 : 0));

  // Build full image list for lightbox (include color image if present)
  const lightboxImages = colorImageUrl && !allImages.includes(colorImageUrl)
    ? [colorImageUrl, ...allImages]
    : allImages;

  return (
    <div className="space-y-4">
      <div className="relative aspect-square bg-muted overflow-hidden group">
        <img
          src={displayImage || allImages[0]}
          alt=""
          className="w-full h-full object-cover transition-opacity duration-300"
        />
        {/* Zoom icon */}
        <button
          onClick={() => onOpenLightbox(lightboxImages, colorImageUrl ? 0 : selected)}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-background/80 border border-border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
        >
          <Search className="h-4 w-4 text-foreground" />
        </button>
        {allImages.length > 1 && !colorImageUrl && (
          <>
            <button onClick={goPrev} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-background/80 border border-border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <ChevronLeft className="h-4 w-4 text-foreground" />
            </button>
            <button onClick={goNext} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-background/80 border border-border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <ChevronRight className="h-4 w-4 text-foreground" />
            </button>
          </>
        )}
      </div>
      {allImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 snap-x">
          {allImages.map((img, i) => (
            <button
              key={i}
              onClick={() => { setSelected(i); }}
              className={`flex-shrink-0 w-16 h-16 md:w-20 md:h-20 overflow-hidden border-2 transition-colors snap-start ${
                !colorImageUrl && i === selected ? "border-primary" : "border-transparent hover:border-border"
              }`}
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Related Products ───────────────────────────────────────────
const RelatedProducts = ({ collectionId, currentProductId, isAl, collectionSlug }: {
  collectionId: string; currentProductId: string; isAl: boolean; collectionSlug: string;
}) => {
  const { data: allProducts } = useProducts(collectionId);
  const related = useMemo(
    () => (allProducts ?? []).filter((p) => p.id !== currentProductId && p.visible).slice(0, 4),
    [allProducts, currentProductId]
  );

  if (!related.length) return null;

  const t = (al: string, en: string) => (isAl ? al : en);

  return (
    <section className="py-12 md:py-16 border-t border-border">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-xl md:text-2xl tracking-wide-brand text-foreground font-light text-center mb-10">
          {t("KOMBINOJE ATE ME", "COMBINE IT WITH")}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {related.map((p) => (
            <Link key={p.id} to={`/koleksionet/${collectionSlug}/${p.slug || p.id}`} className="group">
              <div className="aspect-square bg-muted overflow-hidden mb-3">
                {p.image_url ? (
                  <img src={p.image_url} alt={isAl ? p.title_al : p.title_en} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Package className="h-10 w-10 text-muted-foreground/20" />
                  </div>
                )}
              </div>
              <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2">
                {toTitleCase(isAl ? p.title_al : p.title_en)}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

// ─── Main Product Detail Page ───────────────────────────────────
const isUUID = (s: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);

const ProductDetail = () => {
  const { slug, productSlug } = useParams();
  const { isAl } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: collections, isLoading: collectionsLoading } = useCollections();
  const { data: allProducts, isLoading: productsLoading } = useProducts();
  const { data: allColors, isLoading: colorsLoading } = useAllProductColors();
  const { data: allSizes, isLoading: sizesLoading } = useAllProductSizes();
  const { data: wishlistItems } = useWishlist(user?.id);
  const toggleWishlist = useToggleWishlist();
  const { addItem } = useCart();
  const [lightbox, setLightbox] = useState<{ images: string[]; index: number } | null>(null);
  const [selectedColorId, setSelectedColorId] = useState<string | null>(null);
  const [selectedSizeId, setSelectedSizeId] = useState<string | null>(null);
  const [redirected, setRedirected] = useState(false);

  const t = (al: string, en: string) => (isAl ? al : en);

  // Find product by slug first, then by UUID for backward compatibility
  const product = useMemo(() => {
    if (!allProducts || !productSlug) return undefined;
    // Try slug match first
    const bySlug = allProducts.find((p) => p.slug === productSlug);
    if (bySlug) return bySlug;
    // Fallback: try UUID match (old URLs)
    if (isUUID(productSlug)) {
      return allProducts.find((p) => p.id === productSlug);
    }
    return undefined;
  }, [allProducts, productSlug]);

  // Redirect old UUID URLs to new slug URLs
  useEffect(() => {
    if (!product || !slug || redirected) return;
    if (productSlug && isUUID(productSlug) && product.slug) {
      setRedirected(true);
      navigate(`/koleksionet/${slug}/${product.slug}`, { replace: true });
    }
  }, [product, productSlug, slug, navigate, redirected]);

  const collection = collections?.find((c) => c.slug === slug);
  const parentCollection = collection?.parent_id
    ? collections?.find((c) => c.id === collection.parent_id)
    : null;

  const productColors = allColors?.filter((c) => c.product_id === product?.id) ?? [];
  const productSizes = allSizes?.filter((s) => s.product_id === product?.id) ?? [];

  const isWishlisted = wishlistItems?.some((w) => w.product_id === product?.id) ?? false;

  const handleWishlistClick = useCallback(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (!product?.id) return;
    toggleWishlist.mutate({ userId: user.id, productId: product.id, isWishlisted });
  }, [user, product?.id, isWishlisted, navigate, toggleWishlist]);

  // Show loading spinner while data is being fetched
  if (productsLoading || collectionsLoading || colorsLoading || sizesLoading) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="flex items-center justify-center py-32">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
        <SiteFooter />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <Package className="h-16 w-16 mx-auto text-muted-foreground/20 mb-4" />
            <p className="text-muted-foreground">{t("Produkti nuk u gjet", "Product not found")}</p>
            <Link to="/koleksionet" className="text-primary hover:underline text-sm mt-2 inline-block">
              {t("Kthehu te koleksionet", "Back to collections")}
            </Link>
          </div>
        </div>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Breadcrumb */}
      <div className="bg-muted/50 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wider flex-wrap">
            <Link to="/" className="hover:text-foreground">{t("KRYESORE", "HOME")}</Link>
            <span>-</span>
            <Link to="/koleksionet" className="hover:text-foreground">{t("KOLEKSIONET", "COLLECTIONS")}</Link>
            {parentCollection && (
              <>
                <span>-</span>
                <Link to={`/koleksionet/${parentCollection.slug}`} className="hover:text-foreground">
                  {(isAl ? parentCollection.title_al : parentCollection.title_en).toUpperCase()}
                </Link>
              </>
            )}
            {collection && (
              <>
                <span>-</span>
                <Link to={`/koleksionet/${collection.slug}`} className="hover:text-foreground">
                  {(isAl ? collection.title_al : collection.title_en).toUpperCase()}
                </Link>
              </>
            )}
            <span>-</span>
            <span className="text-foreground">
              {toTitleCase(isAl ? product.title_al : product.title_en)}
            </span>
          </div>
        </div>
      </div>

      {/* Product Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {/* Left: Gallery */}
          <ProductGallery
            mainImage={product.image_url}
            productId={product.id}
            colorImageUrl={
              selectedColorId
                ? (productColors.find((c) => c.id === selectedColorId) as any)?.image_url || null
                : null
            }
            onOpenLightbox={(images, index) => setLightbox({ images, index })}
          />

          {/* Right: Info */}
          <div className="space-y-6">
            {/* Title & Code */}
            <div>
              <h1 className="text-xl md:text-2xl font-light text-foreground leading-tight" style={{ textTransform: 'none', letterSpacing: 'normal' }}>
                {toTitleCase(isAl ? product.title_al : product.title_en)}
              </h1>
              {product.code && (
                <p className="text-sm text-muted-foreground mt-1">
                  {t("Kodi", "Code")} {product.code}
                </p>
              )}
            </div>

            {/* Description */}
            <p className="text-sm text-foreground leading-relaxed">
              {isAl ? product.description_al : product.description_en}
            </p>

            {/* Colors — brand palette picker */}
            {productColors.length > 0 && (
              <ProductColorPicker
                productColors={productColors}
                selectedColorId={selectedColorId}
                onSelectColor={setSelectedColorId}
              />
            )}

            {/* Sizes as selectable chips */}
            {productSizes.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  {t("Përmasa", "Size")}
                  {selectedSizeId && (
                    <span className="ml-2 font-normal normal-case text-foreground">
                      — {productSizes.find((s) => s.id === selectedSizeId)?.size_label}
                    </span>
                  )}
                </p>
                <div className="flex flex-wrap gap-2">
                  {productSizes.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setSelectedSizeId(selectedSizeId === s.id ? null : s.id)}
                      className={`text-xs px-4 py-2 border rounded-sm transition-all ${
                        selectedSizeId === s.id
                          ? "border-primary bg-primary text-primary-foreground font-medium"
                          : "border-border text-foreground hover:border-foreground/40"
                      }`}
                    >
                      {s.size_label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Info Table - Only KUTI and COPË PËR KUTI */}
            {((product.box_quantity ?? 0) > 0 || (product.pieces_per_box ?? 0) > 0) && (
              <div className="border border-border overflow-hidden rounded-sm">
                <table className="w-full text-sm">
                  <tbody>
                    {(product.box_quantity ?? 0) > 0 && (
                      <tr className="border-b border-border last:border-b-0">
                        <td className="px-4 py-2.5 bg-muted/50 font-medium text-foreground w-1/2">
                          {t("KUTI", "BOX")}
                        </td>
                        <td className="px-4 py-2.5 text-foreground">{product.box_quantity}</td>
                      </tr>
                    )}
                    {(product.pieces_per_box ?? 0) > 0 && (
                      <tr>
                        <td className="px-4 py-2.5 bg-muted/50 font-medium text-foreground">
                          {t("COPË PËR KUTI", "PIECES PER BOX")}
                        </td>
                        <td className="px-4 py-2.5 text-foreground">{product.pieces_per_box}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Stock + Customizable indicators */}
            <div className="flex items-center gap-3 flex-wrap">
              {product.in_stock ? (
                <div className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-green-700 bg-green-50 border border-green-200 rounded-sm px-3 py-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  {t("NË STOK", "IN STOCK")}
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-red-700 bg-red-50 border border-red-200 rounded-sm px-3 py-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  {t("NUK KA STOK", "OUT OF STOCK")}
                </div>
              )}
              {product.customizable && (
                <div className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-primary bg-primary/5 border border-primary/20 rounded-sm px-3 py-1.5">
                  <CustomizeIcon className="h-3.5 w-3.5" />
                  {t("I PERSONALIZUESHËM", "CUSTOMIZABLE")}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 pt-2">
              <Button
                className="w-full gap-2 rounded-sm h-12 text-sm tracking-wider"
                disabled={!product.in_stock}
                onClick={() => {
                  const selectedColor = productColors.find((c) => c.id === selectedColorId);
                  const selectedSize = productSizes.find((s) => s.id === selectedSizeId);
                  addItem({
                    productId: product.id,
                    title: isAl ? product.title_al : product.title_en,
                    image: product.image_url || "",
                    description: isAl ? product.description_al : product.description_en,
                    color: selectedColor ? (isAl ? (selectedColor.color_name_al || selectedColor.color_name) : (selectedColor.color_name_en || selectedColor.color_name)) : "",
                    colorHex: selectedColor?.color_hex || "",
                    size: selectedSize?.size_label || "",
                    pieces: product.pieces_per_box ?? 1,
                    boxes: 1,
                  });
                  navigate("/shporta");
                }}
              >
                <ShoppingBag className="h-4 w-4" />
                {t("SHTO NË SHPORTË", "ADD TO CART")}
              </Button>
              <Button
                variant="outline"
                className="w-full gap-2 rounded-sm h-12 text-sm tracking-wider"
                onClick={handleWishlistClick}
                disabled={toggleWishlist.isPending}
              >
                <Heart className={`h-4 w-4 ${isWishlisted ? "fill-primary text-primary" : ""}`} />
                {isWishlisted
                  ? t("HIQ NGA TË PREFERUARAT", "REMOVE FROM WISHLIST")
                  : t("SHTO TEK TË PREFERUARAT", "ADD TO WISHLIST")}
              </Button>
            </div>

            {/* Accordion Sections */}
            <Accordion type="multiple" className="border-t border-border pt-2">
              <AccordionItem value="info">
                <AccordionTrigger className="text-sm font-semibold tracking-wider">
                  {t("INFORMACION MBI PRODUKTIN", "PRODUCT INFORMATION")}
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                    {(isAl ? product.product_info_al : product.product_info_en) ||
                      t("Informacioni do shtohet së shpejti.", "Information will be added soon.")}
                  </p>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="returns">
                <AccordionTrigger className="text-sm font-semibold tracking-wider">
                  {t("POLITIKA E KTHIMIT", "RETURNS POLICY")}
                </AccordionTrigger>
                <AccordionContent>
                  <GlobalReturnPolicy isAl={isAl} />
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="specs">
                <AccordionTrigger className="text-sm font-semibold tracking-wider">
                  {t("SPECIFIKIMET TEKNIKE", "TECHNICAL SPECIFICATIONS")}
                </AccordionTrigger>
                <AccordionContent>
                  <div className="text-sm text-muted-foreground space-y-2">
                    {(product.weight_gsm ?? 0) > 0 && (
                      <p><span className="font-medium text-foreground">{t("Pesha:", "Weight:")}</span> {product.weight_gsm} gsm</p>
                    )}
                    {(isAl ? product.composition_al : product.composition_en) && (
                      <p><span className="font-medium text-foreground">{t("Përbërja:", "Composition:")}</span> {isAl ? product.composition_al : product.composition_en}</p>
                    )}
                    {(isAl ? product.dimensions_al : product.dimensions_en) && (
                      <p><span className="font-medium text-foreground">{t("Përmasat:", "Sizes:")}</span> {isAl ? product.dimensions_al : product.dimensions_en}</p>
                    )}
                    {productColors.length > 0 && (
                      <p>
                        <span className="font-medium text-foreground">{t("Ngjyrat:", "Colors:")}</span>{" "}
                        {productColors.map((c) => isAl ? (c.color_name_al || c.color_name) : (c.color_name_en || c.color_name)).join(", ")}
                      </p>
                    )}
                    {productSizes.length > 0 && (
                      <p>
                        <span className="font-medium text-foreground">{t("Përmasat:", "Sizes:")}</span>{" "}
                        {productSizes.map((s) => s.size_label).join(", ")}
                      </p>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {collection && (
        <RelatedProducts
          collectionId={product.collection_id}
          currentProductId={product.id}
          isAl={isAl}
          collectionSlug={slug ?? ""}
        />
      )}

      {/* Lightbox */}
      {lightbox && (
        <ImageLightbox
          images={lightbox.images}
          startIndex={lightbox.index}
          onClose={() => setLightbox(null)}
        />
      )}

      <SiteFooter />
    </div>
  );
};

export default ProductDetail;
