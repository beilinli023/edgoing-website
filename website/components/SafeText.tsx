"use client"

import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useContent } from '@/hooks/useContent'

interface SafeTextProps {
  /** 翻译键 */
  i18nKey?: string
  /** 中文回退文本 */
  fallbackZh: string
  /** 英文回退文本 */
  fallbackEn: string
  /** 额外的CSS类名 */
  className?: string
  /** 是否显示骨架屏占位 */
  showSkeleton?: boolean
  /** 骨架屏宽度 */
  skeletonWidth?: string
}

/**
 * 🛡️ 安全的文本组件，避免水合错误
 * 
 * 这个组件通过延迟渲染文本内容来避免服务器端和客户端渲染不匹配的问题。
 * 在客户端准备好之前，显示骨架屏占位符。
 */
const SafeText: React.FC<SafeTextProps> = ({
  i18nKey,
  fallbackZh,
  fallbackEn,
  className = '',
  showSkeleton = true,
  skeletonWidth = 'w-16'
}) => {
  const [isClient, setIsClient] = useState(false)
  const { i18n, ready } = useTranslation()
  const { getContent } = useContent()

  // 确保只在客户端渲染文本内容
  useEffect(() => {
    setIsClient(true)
  }, [])

  const getText = () => {
    if (!isClient) return null

    // 优先从数据库获取内容
    if (i18nKey) {
      const dbContent = getContent(i18nKey)
      if (dbContent) return dbContent
    }

    // 根据当前语言返回对应的回退文本
    return i18n.language === 'en' ? fallbackEn : fallbackZh
  }

  const text = getText()

  // 如果还没有准备好，显示骨架屏
  if (!isClient || !text) {
    return showSkeleton ? (
      <div className={`h-4 bg-gray-300 rounded animate-pulse ${skeletonWidth} ${className}`}></div>
    ) : null
  }

  return <span className={className}>{text}</span>
}

export default SafeText
