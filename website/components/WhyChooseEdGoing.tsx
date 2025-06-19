"use client"

import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { useContent } from "@/hooks/useContent"

const WhyChooseEdGoing = () => {
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

    // During SSR or before i18n is ready, return fallback to prevent hydration mismatch
    if (!isClient || !ready) return fallback
    try {
      return t(key) || fallback
    } catch {
      return fallback
    }
  }

  const features = [
    {
      titleKey: "whyChooseEdGoing.features.expertise.title",
      titleFallback: "专业知识与经验",
      descriptionKey: "whyChooseEdGoing.features.expertise.description",
      descriptionFallback:
        "EdGoing 植根于全球专业知识，致力于严谨的研究，精心打造最高品质、变革性的教育项目，激励学员在课堂之外学习。",
    },
    {
      titleKey: "whyChooseEdGoing.features.globalVision.title",
      titleFallback: "全球视野",
      descriptionKey: "whyChooseEdGoing.features.globalVision.description",
      descriptionFallback:
        "通过战略性的全球合作伙伴关系，EdGoing 创造了真实的文化交流，使学员成为几乎所有识广、富有同理心且具有全球视野的未来领导者。",
    },
    {
      titleKey: "whyChooseEdGoing.features.safety.title",
      titleFallback: "安全与个性化承诺",
      descriptionKey: "whyChooseEdGoing.features.safety.description",
      descriptionFallback: "EdGoing 设计安全、高品质且个性化的旅程，帮助学员掌握终身技能并获得变革性的全球视野。",
    },
  ]

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {getText("whyChooseEdGoing.title", "为什么选择")} <span className="text-blue-600">Ed</span>
            <span className="text-orange-500">Going</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            {getText("whyChooseEdGoing.subtitle", "以变革性、安全和个性化的旅程激发全球思维，获得全球信赖")}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-sm p-8 hover:shadow-md transition-shadow duration-300"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {getText(feature.titleKey, feature.titleFallback)}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {getText(feature.descriptionKey, feature.descriptionFallback)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default WhyChooseEdGoing
