"use client"

import { useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { useTranslation } from "react-i18next"
import { useContent } from "@/hooks/useContent"
import CMSPageHero from "@/components/CMSPageHero"
import ProgramSearch from "@/components/ProgramSearch"
import ProgramList from "@/components/ProgramList"
import CallToAction from "@/components/CallToAction"
import Footer from "@/components/Footer"
import { ProgramFilterProvider } from "@/contexts/ProgramFilterContext"

const ProgramsPage = () => {
  const heroRef = useRef<HTMLDivElement>(null)
  const searchParams = useSearchParams()
  const { i18n } = useTranslation()
  const { getContent } = useContent()

  // Handle language switching from URL parameters
  useEffect(() => {
    const urlLang = searchParams.get("lang")
    if (urlLang && (urlLang === "en" || urlLang === "zh") && i18n.language !== urlLang) {
      i18n.changeLanguage(urlLang)
    }
  }, [searchParams, i18n])

  useEffect(() => {
    if (searchParams.get("scroll") === "hero" && heroRef.current) {
      heroRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [searchParams])

  // Helper function to get text with fallback
  const getText = (key: string, fallbackZh: string, fallbackEn: string) => {
    return getContent(key, fallbackZh, fallbackEn)
  }

  return (
    <ProgramFilterProvider>
      <div className="min-h-screen flex flex-col">
        <div ref={heroRef}>
          <CMSPageHero
            pageName="programs"
            fallbackTitle={getText('programs.hero.title', '探索我们的项目', 'Explore Our Programs')}
            fallbackDescription={getText('programs.hero.description', '通过我们多样化的教育项目探索学习机会的世界', 'Discover a world of learning opportunities through our diverse educational programs')}
            fallbackBackgroundImage="/uploads/1749482121332-m1xsowjsvnb.jpg"
          />
        </div>
        <div className="flex-grow bg-gray-50">
          <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="lg:w-1/5">
                <ProgramSearch />
              </div>
              <div className="lg:w-4/5">
                <ProgramList />
              </div>
            </div>
          </div>
        </div>
        <CallToAction />
        <Footer />
      </div>
    </ProgramFilterProvider>
  )
}

export default ProgramsPage
