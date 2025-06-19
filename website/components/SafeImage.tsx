"use client"

import { useState } from 'react'
import Image from 'next/image'

interface SafeImageProps {
  src?: string
  alt?: string
  width?: number
  height?: number
  className?: string
  fill?: boolean
  fallbackSrc?: string
  showPlaceholder?: boolean
  placeholderText?: string
}

/**
 * 🛡️ 安全的图片组件，处理加载失败和缺失的情况
 * 
 * 这个组件提供了完整的图片加载错误处理，包括：
 * - 加载失败时的fallback图片
 * - 图片不存在时的占位符
 * - 加载状态指示器
 */
const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt = '',
  width,
  height,
  className = '',
  fill = false,
  fallbackSrc = '/placeholder.svg',
  showPlaceholder = true,
  placeholderText = '图片加载中...'
}) => {
  const [imageError, setImageError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)



  // 如果没有src或者加载失败，显示占位符
  if (!src || imageError) {
    if (!showPlaceholder) {
      return null
    }

    return (
      <div className={`bg-gray-200 flex items-center justify-center ${className}`}>
        <div className="text-center text-gray-500">
          <div className="w-12 h-12 mx-auto mb-2 bg-gray-300 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-xs">{placeholderText}</p>
        </div>
      </div>
    )
  }

  const handleImageError = (error: any) => {
    console.warn('🖼️ Image failed to load:', {
      src,
      alt,
      error: error?.target?.error || 'Unknown error',
      naturalWidth: error?.target?.naturalWidth,
      naturalHeight: error?.target?.naturalHeight,
    })
    setImageError(true)
    setIsLoading(false)
  }

  const handleImageLoad = () => {
    setIsLoading(false)
  }

  // 使用Next.js Image组件
  if (fill) {
    return (
      <div className={`relative ${className}`}>
        {isLoading && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
            <div className="text-gray-400 text-xs">加载中...</div>
          </div>
        )}
        <Image
          src={src}
          alt={alt}
          fill
          className={`object-cover ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
          onError={handleImageError}
          onLoad={handleImageLoad}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div 
          className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center"
          style={{ width: width || '100%', height: height || '100%' }}
        >
          <div className="text-gray-400 text-xs">加载中...</div>
        </div>
      )}
      <Image
        src={src}
        alt={alt}
        width={width || 400}
        height={height || 300}
        className={`${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onError={handleImageError}
        onLoad={handleImageLoad}
      />
    </div>
  )
}

export default SafeImage
