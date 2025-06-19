import { useTranslation } from "react-i18next"
import { useContent } from "@/hooks/useContent"
import { useState, useEffect } from "react"

/**
 * SSR-safe translation hook that prevents hydration mismatches
 * by ensuring consistent fallback behavior between server and client
 */
export function useSSRSafeTranslation() {
  const { t, ready, i18n } = useTranslation()
  const { getContent } = useContent()
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  /**
   * Get text with SSR-safe fallback handling
   * @param key - Translation key
   * @param fallbackZh - Chinese fallback text
   * @param fallbackEn - English fallback text (optional)
   * @returns Translated text or appropriate fallback
   */
  const getText = (key: string, fallbackZh: string, fallbackEn?: string) => {
    // 优先从数据库获取内容，如果没有则使用 i18n
    const dbContent = getContent(key)
    if (dbContent) return dbContent

    // During SSR or before hydration is complete, return English fallback to prevent hydration mismatch
    if (!ready || typeof window === 'undefined' || !isHydrated) {
      // Return English fallback for consistency with default language
      return fallbackEn || fallbackZh
    }

    try {
      const translation = t(key)
      // If translation returns the key itself (meaning no translation found), use fallback
      if (translation === key) {
        return i18n.language === 'en' ? (fallbackEn || fallbackZh) : fallbackZh
      }
      return translation || (i18n.language === 'en' ? (fallbackEn || fallbackZh) : fallbackZh)
    } catch {
      return i18n.language === 'en' ? (fallbackEn || fallbackZh) : fallbackZh
    }
  }

  /**
   * Simple getText for components that only need single language fallback
   * @param key - Translation key
   * @param fallback - Fallback text
   * @returns Translated text or fallback
   */
  const getSimpleText = (key: string, fallback: string) => {
    // 优先从数据库获取内容，如果没有则使用 i18n
    const dbContent = getContent(key)
    if (dbContent) return dbContent

    // During SSR or before hydration is complete, always return fallback to prevent hydration mismatch
    if (!ready || typeof window === 'undefined' || !isHydrated) return fallback

    try {
      return t(key) || fallback
    } catch {
      return fallback
    }
  }

  return {
    getText,
    getSimpleText,
    t,
    ready,
    i18n
  }
}
