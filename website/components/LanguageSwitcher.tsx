"use client"

import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { useSearchParams } from "next/navigation"
import { Globe } from "lucide-react"

export function LanguageSwitcher() {
  const { i18n } = useTranslation()
  const [currentLang, setCurrentLang] = useState("en") // Start with English to match SSR
  const [isReady, setIsReady] = useState(false)
  const searchParams = useSearchParams()

  useEffect(() => {
    const initLanguage = async () => {
      try {
        // Wait for i18n to be ready
        if (i18n && typeof i18n.changeLanguage === "function") {
          // Check URL parameter first
          const urlLang = searchParams.get("lang")
          const savedLang = localStorage.getItem("younicko-lang")
          const browserLang = navigator.language.startsWith("zh") ? "zh" : "en"

          // Priority: URL param > localStorage > browser language
          const initialLang = urlLang || savedLang || browserLang

          setCurrentLang(initialLang)
          await i18n.changeLanguage(initialLang)

          // Save to localStorage if it came from URL
          if (urlLang) {
            localStorage.setItem("younicko-lang", urlLang)
          }

          setIsReady(true)
        }
      } catch (error) {
        console.error("Error initializing language:", error)
        setIsReady(true)
      }
    }

    initLanguage()
  }, [i18n, searchParams])

  const changeLanguage = async (lng: string) => {
    try {
      if (i18n && typeof i18n.changeLanguage === "function") {
        setCurrentLang(lng)
        await i18n.changeLanguage(lng)
        localStorage.setItem("younicko-lang", lng)

        // Update URL parameter
        const url = new URL(window.location.href)
        url.searchParams.set("lang", lng)
        window.history.replaceState({}, "", url.toString())
      }
    } catch (error) {
      console.error("Error changing language:", error)
    }
  }

  if (!isReady) {
    return (
      <div className="flex items-center px-2 py-1">
        <Globe size={18} className="mr-1 text-gray-400" />
        <span className="text-sm font-medium text-gray-400">...</span>
      </div>
    )
  }

  return (
    <button
      onClick={() => changeLanguage(currentLang === "en" ? "zh" : "en")}
      className="text-black hover:text-[#00A0E9] transition-colors flex items-center px-2 py-1 rounded-md"
      aria-label={currentLang === "en" ? "Switch to Chinese" : "Switch to English"}
    >
      <Globe size={18} className="mr-1" />
      <span className="text-sm font-medium">{currentLang === "en" ? "中文" : "EN"}</span>
    </button>
  )
}
