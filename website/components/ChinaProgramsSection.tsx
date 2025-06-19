"use client"

import { useEffect } from "react"
import { useTranslation } from "react-i18next"
import { useSearchParams } from "next/navigation"
import ChinaProgramSearch from "./ChinaProgramSearch"
import ChinaProgramList from "./ChinaProgramList"

const ChinaProgramsSection = () => {
  const { i18n } = useTranslation()
  const searchParams = useSearchParams()

  useEffect(() => {
    const urlLang = searchParams.get("lang")
    if (urlLang && (urlLang === "en" || urlLang === "zh") && i18n.language !== urlLang) {
      i18n.changeLanguage(urlLang)
    }
  }, [searchParams, i18n])

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-1/5">
            <ChinaProgramSearch />
          </div>
          <div className="lg:w-4/5">
            <ChinaProgramList />
          </div>
        </div>
      </div>
    </section>
  )
}

export default ChinaProgramsSection
