"use client"

import { useEffect, useState } from 'react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  showText?: boolean
  text?: string
}

/**
 * 🛡️ 安全的加载组件，避免水合错误
 * 
 * 通过延迟渲染文本内容来避免服务器端和客户端渲染不匹配的问题
 */
const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className = '',
  showText = false,
  text
}) => {
  const [isClient, setIsClient] = useState(false)

  // 确保只在客户端渲染文本内容
  useEffect(() => {
    setIsClient(true)
  }, [])

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6', 
    lg: 'h-8 w-8'
  }

  const spinnerSize = sizeClasses[size]

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className={`animate-spin rounded-full border-b-2 border-gray-400 ${spinnerSize}`}></div>
      {showText && (
        <div className="text-gray-500">
          {isClient && text ? (
            text
          ) : (
            // 骨架屏占位，避免水合错误
            <div className="h-4 bg-gray-300 rounded w-16 animate-pulse"></div>
          )}
        </div>
      )}
    </div>
  )
}

export default LoadingSpinner
