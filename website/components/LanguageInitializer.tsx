"use client"

import { useEffect } from "react"
import { useTranslation } from "react-i18next"
import { useSearchParams } from "next/navigation"

export function LanguageInitializer() {
  const { i18n } = useTranslation()
  const searchParams = useSearchParams()

  useEffect(() => {
    const initLanguage = async () => {
      try {
        if (i18n && typeof i18n.changeLanguage === "function") {
          // Check URL parameter first
          const urlLang = searchParams.get("lang")
          
          if (urlLang && (urlLang === "en" || urlLang === "zh")) {
            await i18n.changeLanguage(urlLang)
            localStorage.setItem("younicko-lang", urlLang)
          }
        }
      } catch (error) {
        console.error("Error initializing language from URL:", error)
      }
    }

    initLanguage()
  }, [i18n, searchParams])

  return null // This component doesn't render anything
}
