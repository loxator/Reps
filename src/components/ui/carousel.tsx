'use client'

import { useCallback, useEffect, useRef } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export type CarouselSlide = {
  src: string
  alt: string
}

type CarouselProps = {
  slides: CarouselSlide[]
  /** Milliseconds between auto-advances. Pass 0 to disable. */
  autoplayDelay?: number
  className?: string
  /** Render content overlaid on each slide */
  overlay?: React.ReactNode
}

export function Carousel({
  slides,
  autoplayDelay = 5000,
  className,
  overlay,
}: CarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true })
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])

  // Autoplay
  useEffect(() => {
    if (!emblaApi || autoplayDelay === 0) return

    const start = () => {
      intervalRef.current = setInterval(() => emblaApi.scrollNext(), autoplayDelay)
    }
    const stop = () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }

    start()
    emblaApi.on('pointerDown', stop)
    emblaApi.on('pointerUp', start)

    return () => {
      stop()
      emblaApi.off('pointerDown', stop)
      emblaApi.off('pointerUp', start)
    }
  }, [emblaApi, autoplayDelay])

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Track */}
      <div ref={emblaRef} className="overflow-hidden h-full">
        <div className="flex h-full touch-pan-y">
          {slides.map((slide, i) => (
            <div key={i} className="relative flex-[0_0_100%] h-full min-w-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={slide.src}
                alt={slide.alt}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Overlay slot */}
      {overlay && (
        <div className="absolute inset-0 pointer-events-none">
          {overlay}
        </div>
      )}

      {/* Prev / Next */}
      <button
        onClick={scrollPrev}
        aria-label="Previous slide"
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center size-10 rounded-full bg-black/30 text-white backdrop-blur-sm hover:bg-black/50 transition-colors"
      >
        <ChevronLeft className="size-5" />
      </button>
      <button
        onClick={scrollNext}
        aria-label="Next slide"
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center size-10 rounded-full bg-black/30 text-white backdrop-blur-sm hover:bg-black/50 transition-colors"
      >
        <ChevronRight className="size-5" />
      </button>
    </div>
  )
}
