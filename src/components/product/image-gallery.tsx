"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronUp, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ImageGalleryProps {
  images: Array<{ url: string; alt: string }>
  productName: string
}

export function optimizeImageUrl(url: string, width: number, height: number): string {
  if (!url) return ""
  if (url.includes("tcdn.com.br")) {
    return `${url}?w=${width}&h=${height}&fit=fill`
  }
  return url
}

const THUMB_HEIGHT = 80
const THUMB_GAP = 8
const VISIBLE_THUMBS = 5

export function ImageGallery({ images, productName }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isZoomed, setIsZoomed] = useState(false)
  const [thumbScrollIndex, setThumbScrollIndex] = useState(0)
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set())
  const thumbListRef = useRef<HTMLDivElement>(null)

  const handleImageError = (url: string) => {
    setFailedImages((prev) => new Set(prev).add(url))
  }

  useEffect(() => {
    setThumbScrollIndex(0)
    setSelectedIndex(0)
    setIsZoomed(false)
    setFailedImages(new Set())
  }, [images])

  // 1. Filter out youtube links
  // 2. Deduplicate by URL and Tray sequence ID to prevent low-res duplicates (KEEP FIRST OCCURRENCE)
  // 3. Filter out failed images
  const validImages: typeof images = []
  const seenKeys = new Set<string>()

  for (const img of images) {
    if (img.url.includes("youtube.com") || img.url.includes("youtu.be")) continue
    if (failedImages.has(img.url)) continue

    // Extract Tray sequence ID if present (e.g. ..._2125_8_hash.jpg)
    const trayMatch = img.url.match(/_(\d+_\d+)_([a-f0-9]+)\.(jpg|jpeg|png|gif|webp)$/i)
    const dedupKey = trayMatch ? trayMatch[1] : img.url

    if (!seenKeys.has(dedupKey)) {
      seenKeys.add(dedupKey)
      validImages.push(img)
    }
  }

  const maxThumbScroll = Math.max(0, validImages.length - VISIBLE_THUMBS)

  const mainImage = validImages[selectedIndex] || validImages[0]
  const optimizedMainUrl = mainImage ? optimizeImageUrl(mainImage.url, 600, 600) : null

  const handlePrevious = () => {
    const newIndex = selectedIndex === 0 ? validImages.length - 1 : selectedIndex - 1
    setSelectedIndex(newIndex)
    setIsZoomed(false)
    ensureThumbVisible(newIndex)
  }

  const handleNext = () => {
    const newIndex = selectedIndex === validImages.length - 1 ? 0 : selectedIndex + 1
    setSelectedIndex(newIndex)
    setIsZoomed(false)
    ensureThumbVisible(newIndex)
  }

  const ensureThumbVisible = (index: number) => {
    if (index < thumbScrollIndex) {
      setThumbScrollIndex(index)
    } else if (index >= thumbScrollIndex + VISIBLE_THUMBS) {
      setThumbScrollIndex(index - VISIBLE_THUMBS + 1)
    }
  }

  const scrollThumbsUp = () => {
    setThumbScrollIndex((prev) => Math.max(0, prev - 1))
  }

  const scrollThumbsDown = () => {
    setThumbScrollIndex((prev) => Math.min(maxThumbScroll, prev + 1))
  }

  const visibleThumbs = validImages.slice(thumbScrollIndex, thumbScrollIndex + VISIBLE_THUMBS)

  return (
    <div className="flex gap-4">
      <div className="relative flex-1 h-full min-h-[300px] max-h-[450px] overflow-hidden rounded-lg border bg-muted">
        {optimizedMainUrl ? (
          <button
            onClick={() => setIsZoomed(!isZoomed)}
            className={`relative h-full w-full transition-all duration-300 ${
              isZoomed ? "cursor-zoom-out" : "cursor-zoom-in"
            }`}
          >
            <img
              src={optimizedMainUrl}
              alt={mainImage.alt}
              onError={() => handleImageError(mainImage.url)}
              className={`h-full w-full object-contain transition-transform duration-300 ${
                isZoomed ? "scale-150" : "scale-100"
              }`}
            />
          </button>
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            Sem imagem
          </div>
        )}

        {validImages.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrevious}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow-md"
            >
              <ChevronUp className="h-5 w-5 rotate-[-90deg]" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow-md"
            >
              <ChevronDown className="h-5 w-5 rotate-[-90deg]" />
            </Button>
          </>
        )}

        {validImages.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/60 text-white px-3 py-1 rounded-full text-xs">
            {selectedIndex + 1} / {validImages.length}
          </div>
        )}
      </div>

      {validImages.length > 1 && (
        <div className="relative flex flex-col items-center">
          {validImages.length > VISIBLE_THUMBS && (
            <Button
              variant="ghost"
              size="icon"
              onClick={scrollThumbsUp}
              disabled={thumbScrollIndex === 0}
              className="h-6 w-6 mb-1"
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
          )}

          <div
            ref={thumbListRef}
            className="flex flex-col gap-2 overflow-hidden"
            style={{ height: THUMB_HEIGHT * VISIBLE_THUMBS + THUMB_GAP * (VISIBLE_THUMBS - 1) }}
          >
            {visibleThumbs.map((image, index) => {
              const realIndex = thumbScrollIndex + index
              const thumbUrl = optimizeImageUrl(image.url, 120, 120)
              return (
                <button
                  key={realIndex}
                  onClick={() => {
                    setSelectedIndex(realIndex)
                    setIsZoomed(false)
                  }}
                  className={`relative flex-shrink-0 w-20 h-20 overflow-hidden rounded-md border bg-muted transition-all ${
                    selectedIndex === realIndex
                      ? "ring-2 ring-primary border-primary"
                      : "hover:border-primary/50"
                  }`}
                >
                  <img
                    src={thumbUrl}
                    alt={image.alt}
                    onError={(e) => {
                      e.currentTarget.style.display = "none"
                    }}
                    className="h-full w-full object-contain"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </button>
              )
            })}
          </div>

          {validImages.length > VISIBLE_THUMBS && (
            <Button
              variant="ghost"
              size="icon"
              onClick={scrollThumbsDown}
              disabled={thumbScrollIndex >= maxThumbScroll}
              className="h-6 w-6 mt-1"
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}
    </div>
  )
}