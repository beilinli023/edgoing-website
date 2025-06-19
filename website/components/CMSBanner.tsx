"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTranslation } from "react-i18next"
import { useHomepageSlides } from "@/hooks/useHeroData"

interface CMSBannerProps {
  fallbackToDefault?: boolean
}

const CMSBanner: React.FC<CMSBannerProps> = ({ fallbackToDefault = true }) => {
  const [currentBanner, setCurrentBanner] = useState(0)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  const [isClient, setIsClient] = useState(false)
  const { i18n } = useTranslation()
  
  // 使用CMS Hero数据
  const { localizedHeroData, loading, error } = useHomepageSlides()

  useEffect(() => {
    setIsClient(true)
  }, [])

  // 获取轮播图数据
  const slides = localizedHeroData?.slides || []
  const hasSlides = slides.length > 0

  const nextBanner = useCallback(() => {
    if (hasSlides) {
      setCurrentBanner((prev) => (prev + 1) % slides.length)
    }
  }, [slides.length, hasSlides])

  const prevBanner = useCallback(() => {
    if (hasSlides) {
      setCurrentBanner((prev) => (prev - 1 + slides.length) % slides.length)
    }
  }, [slides.length, hasSlides])

  // 自动轮播
  useEffect(() => {
    if (!hasSlides) return

    const interval = setInterval(nextBanner, 5000)
    return () => clearInterval(interval)
  }, [nextBanner, hasSlides])

  // 触摸事件处理
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    if (isLeftSwipe) {
      nextBanner()
    } else if (isRightSwipe) {
      prevBanner()
    }
  }

  // 加载状态
  if (loading) {
    return (
      <div className="relative h-[600px] w-full overflow-hidden bg-gray-200 animate-pulse">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-gray-500">加载中...</div>
        </div>
      </div>
    )
  }

  // 错误状态或无数据时的处理
  if (error || !hasSlides) {
    if (fallbackToDefault) {
      // 可以在这里返回默认的Banner组件
      return (
        <div className="relative h-[600px] w-full overflow-hidden bg-gray-200">
          <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-700 mb-2">Welcome to EdGoing</h2>
            <p className="text-gray-600">Explore the world, learn and grow</p>
          </div>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div
      className="relative h-[600px] w-full overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentBanner ? "opacity-100" : "opacity-0"
          }`}
        >
          <Image
            src={slide.imageUrl || "/placeholder.svg"}
            alt={slide.title || "Banner"}
            fill
            className="object-cover object-center"
            priority={index === 0}
          />
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {slide.title}
            </h2>
            <p className="text-xl md:text-2xl text-white/90 mb-8">
              {slide.subtitle}
            </p>
            {slide.ctaLink && (
              <Link href={slide.ctaLink}>
                <Button size="lg" className="bg-orange hover:bg-orange/90 text-white px-8 py-3 text-lg rounded-full">
                  {slide.ctaText || (i18n.language === 'en' ? 'Learn More' : '了解更多')}
                </Button>
              </Link>
            )}
          </div>
        </div>
      ))}
      
      {/* 导航按钮 */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prevBanner}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/75 hover:text-white transition-colors"
            aria-label="Previous banner"
          >
            <ChevronLeft size={40} />
          </button>
          <button
            onClick={nextBanner}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/75 hover:text-white transition-colors"
            aria-label="Next banner"
          >
            <ChevronRight size={40} />
          </button>
          
          {/* 指示器 */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentBanner(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentBanner ? "bg-white" : "bg-white/50"
                }`}
                aria-label={`Go to banner ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default CMSBanner
