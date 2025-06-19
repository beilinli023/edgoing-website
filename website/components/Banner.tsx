"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import { useTranslation } from "react-i18next"
import { useContent } from "@/hooks/useContent"

export interface BannerItem {
  id: number
  titleKey: string
  subtitleKey: string
  image: string
  ctaKey: string
  ctaLink: string
  fallbackTitle: string
  fallbackSubtitle: string
  fallbackCta: string
}

const defaultBanners: BannerItem[] = [
  {
    id: 1,
    titleKey: "banner.summer2025.title",
    subtitleKey: "banner.summer2025.subtitle",
    ctaKey: "banner.summer2025.cta",
    fallbackTitle: "2025 Summer Study Tour",
    fallbackSubtitle: "Deep-dive programs in 20+ global universities",
    fallbackCta: "Learn More",
    image: "/uploads/1749483271726-rlv7517o5z.jpg",
    ctaLink: "/programs/summer-2025",
  },
  {
    id: 2,
    titleKey: "banner.ukElite.title",
    subtitleKey: "banner.ukElite.subtitle",
    ctaKey: "banner.ukElite.cta",
    fallbackTitle: "UK Elite University Tour",
    fallbackSubtitle: "Explore Oxford, Cambridge and more",
    fallbackCta: "Discover Now",
    image: "/uploads/1749483271726-v35pn2fmnwk.jpg",
    ctaLink: "/programs/uk-elite",
  },
  {
    id: 3,
    titleKey: "banner.japanTech.title",
    subtitleKey: "banner.japanTech.subtitle",
    ctaKey: "banner.japanTech.cta",
    fallbackTitle: "Japan Tech Innovation Tour",
    fallbackSubtitle: "Where cutting-edge meets tradition",
    fallbackCta: "Join the Innovation",
    image: "/uploads/1749483271726-zz0roruyg7a.jpg",
    ctaLink: "/programs/japan-tech",
  },
  {
    id: 4,
    titleKey: "banner.leadership.title",
    subtitleKey: "banner.leadership.subtitle",
    ctaKey: "banner.leadership.cta",
    fallbackTitle: "Global Leadership Summit",
    fallbackSubtitle: "Empowering the next generation of world leaders",
    fallbackCta: "Be a Leader",
    image: "/uploads/1749483374852-s5n3h8ljc4.jpg",
    ctaLink: "/programs/leadership-summit",
  },
  {
    id: 5,
    titleKey: "banner.sustainable.title",
    subtitleKey: "banner.sustainable.subtitle",
    ctaKey: "banner.sustainable.cta",
    fallbackTitle: "Sustainable Future Program",
    fallbackSubtitle: "Learn to shape a greener tomorrow",
    fallbackCta: "Go Green",
    image: "/uploads/1749484028880-qe6g7ywl0i.jpg",
    ctaLink: "/programs/sustainable-future",
  },
]

interface BannerProps {
  banners?: BannerItem[]
}

const Banner: React.FC<BannerProps> = ({ banners = defaultBanners }) => {
  const [currentBanner, setCurrentBanner] = useState(0)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  const [isClient, setIsClient] = useState(false)
  const { t, ready } = useTranslation()
  const { getContent } = useContent()

  useEffect(() => {
    setIsClient(true)
  }, [])

  const getText = (key: string, fallback: string) => {
    // 优先从数据库获取内容，如果没有则使用 i18n
    const dbContent = getContent(key)
    if (dbContent) return dbContent

    if (!isClient || !ready) return fallback
    try {
      return t(key) || fallback
    } catch {
      return fallback
    }
  }

  const nextBanner = useCallback(() => {
    setCurrentBanner((prev) => (prev + 1) % banners.length)
  }, [banners.length])

  const prevBanner = useCallback(() => {
    setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length)
  }, [banners.length])

  useEffect(() => {
    const timer = setInterval(nextBanner, 5000)
    return () => clearInterval(timer)
  }, [nextBanner])

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 75) {
      nextBanner()
    }

    if (touchStart - touchEnd < -75) {
      prevBanner()
    }
  }

  return (
    <div
      className="relative h-[600px] w-full overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {banners.map((banner, index) => (
        <div
          key={banner.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentBanner ? "opacity-100" : "opacity-0"
          }`}
        >
          <Image
            src={banner.image || "/placeholder.svg"}
            alt={getText(banner.titleKey, banner.fallbackTitle)}
            fill
            className="object-cover object-center"
            priority={index === 0}
          />
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {getText(banner.titleKey, banner.fallbackTitle)}
            </h2>
            <p className="text-xl md:text-2xl text-white/90 mb-8">
              {getText(banner.subtitleKey, banner.fallbackSubtitle)}
            </p>
            <Link href={banner.ctaLink}>
              <Button size="lg" className="bg-orange hover:bg-orange/90 text-white px-8 py-3 text-lg rounded-full">
                {getText(banner.ctaKey, banner.fallbackCta)}
              </Button>
            </Link>
          </div>
        </div>
      ))}
      <button
        onClick={prevBanner}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/75 hover:text-white"
        aria-label="Previous banner"
      >
        <ChevronLeft size={40} />
      </button>
      <button
        onClick={nextBanner}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/75 hover:text-white"
        aria-label="Next banner"
      >
        <ChevronRight size={40} />
      </button>
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentBanner(index)}
            className={`w-3 h-3 rounded-full ${index === currentBanner ? "bg-white" : "bg-white/50"}`}
            aria-label={`Go to banner ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

export default Banner
