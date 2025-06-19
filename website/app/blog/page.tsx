"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import Footer from "@/components/Footer"
import { useTranslation } from "react-i18next"
import { useContent } from "@/hooks/useContent"

// 动态导入组件，禁用SSR
const CMSPageHero = dynamic(() => import("@/components/CMSPageHero"), {
  ssr: false,
  loading: () => (
    <div className="relative h-[400px] w-full overflow-hidden bg-gray-200">
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4 md:px-8 max-w-4xl mx-auto">
        <div className="h-12 bg-gray-300 rounded w-64 mb-4 animate-pulse"></div>
        <div className="h-6 bg-gray-300 rounded w-96 animate-pulse"></div>
      </div>
    </div>
  )
})

const BlogList = dynamic(() => import("@/components/BlogList"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center py-12">
      <div className="text-gray-500">
        {/* 避免水合错误，使用骨架屏 */}
        <div className="h-4 bg-gray-300 rounded w-16 animate-pulse"></div>
      </div>
    </div>
  )
})

const FeaturedVideos = dynamic(() => import("@/components/FeaturedVideos"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center py-12">
      <div className="text-gray-500">
        {/* 避免水合错误，使用骨架屏 */}
        <div className="h-4 bg-gray-300 rounded w-16 animate-pulse"></div>
      </div>
    </div>
  )
})

export default function BlogPage() {
  const { t, ready, i18n } = useTranslation()
  const { getContent } = useContent()

  const getText = (key: string, fallbackZh: string, fallbackEn: string) => {
    // 优先从数据库获取内容，如果没有则使用 i18n
    const dbContent = getContent(key)
    if (dbContent) return dbContent

    // 如果i18n未准备好，根据当前语言返回对应的fallback
    if (!ready) {
      return i18n.language === 'en' ? fallbackEn : fallbackZh
    }

    try {
      const translation = t(key)
      if (translation && translation !== key) return translation
    } catch {
      // Fallback to provided fallbacks
    }

    return i18n.language === 'en' ? fallbackEn : fallbackZh
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <CMSPageHero
        pageName="blog"
        fallbackTitle={getText("blog.hero.title", "我们的博客", "Our Blog")}
        fallbackDescription={getText("blog.hero.description", "探索来自我们全球教育经验的见解、故事和技巧。了解国际教育和文化交流的最新趋势。", "Explore insights, stories, and tips from our global education experience. Learn about the latest trends in international education and cultural exchange.")}
        fallbackBackgroundImage="/uploads/1749482112471-drvihfdfns6.jpg"
      />
      <main className="flex-grow">
        <div className="container mx-auto px-8 md:px-12 lg:px-16 xl:px-20 py-16 space-y-16">
          <BlogList />
          <FeaturedVideos />
        </div>
      </main>
      <Footer />
    </div>
  )
}
