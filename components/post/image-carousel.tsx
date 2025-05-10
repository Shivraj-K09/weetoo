"use client";

import * as React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import { OptimizedImage } from "@/components/ui/optimized-image";

interface ImageCarouselProps {
  images: Array<string>;
  className?: string;
}

export function ImageCarousel({ images, className }: ImageCarouselProps) {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);

  React.useEffect(() => {
    if (!api) {
      return;
    }

    const onChange = () => {
      setCurrent(api.selectedScrollSnap());
    };

    api.on("select", onChange);
    return () => {
      api.off("select", onChange);
    };
  }, [api]);

  // If there are no images or only one image, just show the image without carousel
  if (!images || images.length === 0) {
    return null;
  }

  if (images.length === 1) {
    return (
      <div
        className={cn(
          "relative aspect-video w-full overflow-hidden rounded-md",
          className
        )}
      >
        <OptimizedImage
          src={images[0] || "/placeholder.svg"}
          alt="Featured image"
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority
        />
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="relative">
        <Carousel setApi={setApi} className="w-full">
          <CarouselContent>
            {images.map((image, index) => (
              <CarouselItem key={index}>
                <div className="aspect-video w-full overflow-hidden rounded-md">
                  <OptimizedImage
                    src={image || "/placeholder.svg"}
                    alt={`Featured image ${index + 1}`}
                    width={1200}
                    height={675}
                    className="h-full w-full object-cover"
                    priority={index === 0}
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-2 bg-white/80 hover:bg-white" />
          <CarouselNext className="right-2 bg-white/80 hover:bg-white" />
        </Carousel>
      </div>

      {/* Thumbnails */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => api?.scrollTo(index)}
            className={cn(
              "relative h-20 w-32 flex-shrink-0 overflow-hidden rounded-md border-2 transition-all cursor-pointer",
              current === index
                ? "border-primary"
                : "border-transparent opacity-70 hover:opacity-100"
            )}
            aria-label={`View image ${index + 1}`}
            aria-current={current === index ? "true" : "false"}
          >
            <OptimizedImage
              src={image || "/placeholder.svg"}
              alt={`Thumbnail ${index + 1}`}
              fill
              className="object-cover"
              sizes="96px"
            />
            {current === index && (
              <div className="absolute inset-0 bg-primary/10 border border-primary/20"></div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
