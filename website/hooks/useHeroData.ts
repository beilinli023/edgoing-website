import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

interface HeroSlide {
  id: string
  titleZh: string
  titleEn: string
  subtitleZh: string
  subtitleEn: string
  imageUrl: string
  ctaTextZh: string
  ctaTextEn: string
  ctaLink: string
}

interface HeroPage {
  id: string
  pageName: string
  pageType: 'PRIMARY' | 'SECONDARY'
  slides?: HeroSlide[]
  titleZh?: string
  titleEn?: string
  subtitleZh?: string
  subtitleEn?: string
  imageUrl?: string
  isActive: boolean
  order: number
  createdAt: string
  updatedAt: string
}

interface UseHeroDataOptions {
  pageName?: string
  pageType?: 'PRIMARY' | 'SECONDARY'
}

export function useHeroData(options: UseHeroDataOptions = {}) {
  const [heroData, setHeroData] = useState<HeroPage | HeroPage[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { i18n } = useTranslation()

  useEffect(() => {
    fetchHeroData()
  }, [options.pageName, options.pageType])

  const fetchHeroData = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (options.pageName) {
        params.append('page', options.pageName)
      }
      if (options.pageType) {
        params.append('type', options.pageType)
      }

      const response = await fetch(`/api/hero-pages?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch hero data')
      }

      const data = await response.json()
      setHeroData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      console.error('Error fetching hero data:', err)
    } finally {
      setLoading(false)
    }
  }

  // 获取本地化文本的辅助函数
  const getLocalizedText = (zhText?: string, enText?: string, fallback = '') => {
    if (i18n.language === 'en' && enText) {
      return enText
    }
    return zhText || enText || fallback
  }

  // 获取本地化的Hero数据
  const getLocalizedHeroData = () => {
    if (!heroData) return null

    if (Array.isArray(heroData)) {
      return heroData.map(page => ({
        ...page,
        title: getLocalizedText(page.titleZh, page.titleEn),
        subtitle: getLocalizedText(page.subtitleZh, page.subtitleEn),
        slides: page.slides?.map(slide => ({
          ...slide,
          title: getLocalizedText(slide.titleZh, slide.titleEn),
          subtitle: getLocalizedText(slide.subtitleZh, slide.subtitleEn),
          ctaText: getLocalizedText(slide.ctaTextZh, slide.ctaTextEn, 'Learn More')
        }))
      }))
    }

    return {
      ...heroData,
      title: getLocalizedText(heroData.titleZh, heroData.titleEn),
      subtitle: getLocalizedText(heroData.subtitleZh, heroData.subtitleEn),
      slides: heroData.slides?.map(slide => ({
        ...slide,
        title: getLocalizedText(slide.titleZh, slide.titleEn),
        subtitle: getLocalizedText(slide.subtitleZh, slide.subtitleEn),
        ctaText: getLocalizedText(slide.ctaTextZh, slide.ctaTextEn, 'Learn More')
      }))
    }
  }

  return {
    heroData,
    localizedHeroData: getLocalizedHeroData(),
    loading,
    error,
    refetch: fetchHeroData
  }
}

// 专门用于获取主页轮播图的Hook
export function useHomepageSlides() {
  return useHeroData({ pageName: 'homepage' })
}

// 专门用于获取二级页面Hero的Hook
export function usePageHero(pageName: string) {
  return useHeroData({ pageName })
}

// 专门用于获取所有二级页面Hero的Hook
export function useSecondaryHeroPages() {
  return useHeroData({ pageType: 'SECONDARY' })
}
