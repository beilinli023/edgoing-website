"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { useContent } from "@/hooks/useContent"
import ColorfulSlogan from "./ColorfulSlogan"

const ExploreSection: React.FC = () => {
  const { t, ready } = useTranslation()
  const { getContent } = useContent()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const getText = (key: string, fallback: string) => {
    // 优先从数据库获取内容，如果没有则使用 i18n
    const dbContent = getContent(key)
    if (dbContent) return dbContent

    if (!isClient || !ready) return fallback
    try {
      return t(key) || fallback
    } catch {
      return fallback
    }
  }

  return (
    <section className="bg-white py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-2 flex items-center justify-center">
            <ColorfulSlogan size="xl" />
          </h2>
          <p className="text-lg md:text-xl text-gray-600 px-6 md:px-12 lg:px-24 max-w-4xl mx-auto text-center">
            {getText("hero.subtitle", "每一个 EdGoing 项目都是精心打造的探险之旅，旨在超越简单的观光——挑战固有观念、培养共情能力，并赋予学员以全新的方式看待世界和自我。")}
          </p>
        </div>
      </div>
    </section>
  )
}

export default ExploreSection
