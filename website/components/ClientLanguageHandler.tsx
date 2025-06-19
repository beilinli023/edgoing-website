"use client"

import { useEffect } from "react"
import { useTranslation } from "react-i18next"
import { useSearchParams } from "next/navigation"

export function ClientLanguageHandler() {
  const { i18n } = useTranslation()
  const searchParams = useSearchParams()

  useEffect(() => {
    const initLanguage = async () => {
      try {
        if (i18n && typeof i18n.changeLanguage === "function") {
          // Check URL parameter first
          const urlLang = searchParams.get("lang")
          const savedLang = localStorage.getItem("younicko-lang")
          const browserLang = navigator.language.startsWith("zh") ? "zh" : "en"

          // Priority: URL param > localStorage > browser language
          const initialLang = urlLang || savedLang || browserLang

          // Only change language if it's different from current
          if (i18n.language !== initialLang) {
            await i18n.changeLanguage(initialLang)
          }

          // Save to localStorage if it came from URL
          if (urlLang) {
            localStorage.setItem("younicko-lang", urlLang)
          }
        }
      } catch (error) {
        console.error("Error initializing language:", error)
      }
    }

    // Only run on client side after hydration
    if (typeof window !== 'undefined') {
      initLanguage()
    }
  }, [i18n, searchParams])

  return null // This component doesn't render anything
}
