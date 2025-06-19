"use client"

import React from "react"
import { usePageHero } from "@/hooks/useHeroData"

interface StudyChinaCMSHeroProps {
  pageName: string
  fallbackTitle?: string
  fallbackDescription?: string
  fallbackBackgroundImage?: string
  className?: string
}

const StudyChinaCMSHero: React.FC<StudyChinaCMSHeroProps> = ({ 
  pageName, 
  fallbackTitle = "",
  fallbackDescription = "",
  fallbackBackgroundImage = "/placeholder.svg?height=400&width=1200",
  className = ""
}) => {
  const { localizedHeroData, loading, error } = usePageHero(pageName)

  // 加载状态 - 使用空白避免水合错误
  if (loading) {
    return (
      <div className={`relative h-[400px] w-full overflow-hidden bg-gray-200 animate-pulse ${className}`}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-gray-500">
            {/* 避免水合错误，使用空白或骨架屏 */}
            <div className="h-4 bg-gray-300 rounded w-16 animate-pulse"></div>
          </div>
        </div>
      </div>
    )
  }

  // 获取显示内容
  const title = localizedHeroData?.title || fallbackTitle
  const description = localizedHeroData?.subtitle || fallbackDescription
  const backgroundImage = localizedHeroData?.imageUrl || fallbackBackgroundImage

  // 错误状态或无数据时使用回退内容
  if (error && !title && !description) {
    console.warn(`Hero data not found for page: ${pageName}, using fallback content`)
  }

  return (
    <div className={`relative h-[400px] w-full overflow-hidden ${className}`}>
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${backgroundImage})`,
        }}
      >
        <div className="absolute inset-0 bg-black/40" />
      </div>

      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4 md:px-8 max-w-4xl mx-auto">
        {title && (
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
            {title}
          </h1>
        )}
        {description && (
          <p className="text-lg md:text-xl text-white/90">
            {description}
          </p>
        )}
      </div>
    </div>
  )
}

export default StudyChinaCMSHero
