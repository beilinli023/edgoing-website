"use client"

import React from "react"
import { usePageHero } from "@/hooks/useHeroData"

interface CMSPageHeroProps {
  pageName: string
  fallbackTitle?: string
  fallbackDescription?: string
  fallbackBackgroundImage?: string
  className?: string
}

const CMSPageHero: React.FC<CMSPageHeroProps> = ({ 
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

  // 获取数据，优先使用CMS数据，否则使用fallback
  const title = localizedHeroData?.title || fallbackTitle
  const description = localizedHeroData?.subtitle || fallbackDescription
  const backgroundImage = localizedHeroData?.imageUrl || fallbackBackgroundImage

  // 如果没有任何数据且没有fallback，返回null
  if (!title && !description && !backgroundImage && error) {
    return null
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

export default CMSPageHero
