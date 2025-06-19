"use client"

import { useState, useEffect } from "react"
import { Globe, GraduationCap, Users, Briefcase } from "lucide-react"
import { useTranslation } from "react-i18next"

const StudyChinaFeatures = () => {
  const { t, ready } = useTranslation()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const features = [
    {
      icon: Globe,
      titleKey: "studyChina.features.immersiveLanguage.title",
      descriptionKey: "studyChina.features.immersiveLanguage.description",
      defaultTitle: "沉浸式语言环境",
      defaultDescription: "在真实的中文环境中提升语言能力，与当地学生和教师深度交流"
    },
    {
      icon: GraduationCap,
      titleKey: "studyChina.features.topAcademic.title",
      descriptionKey: "studyChina.features.topAcademic.description",
      defaultTitle: "顶尖学术资源",
      defaultDescription: "进入中国顶级大学课堂，体验高质量的学术教育和研究环境"
    },
    {
      icon: Users,
      titleKey: "studyChina.features.culturalExperience.title",
      descriptionKey: "studyChina.features.culturalExperience.description",
      defaultTitle: "深度文化体验",
      defaultDescription: "参与传统文化活动，探索历史古迹，深入了解中华文明"
    },
    {
      icon: Briefcase,
      titleKey: "studyChina.features.businessOpportunity.title",
      descriptionKey: "studyChina.features.businessOpportunity.description",
      defaultTitle: "商业机会探索",
      defaultDescription: "参访知名企业，了解中国商业模式，拓展国际视野和职业发展机会"
    },
  ]

  // Prevent hydration mismatch
  const getText = (key: string, defaultText: string) => {
    if (!isClient || !ready) {
      return defaultText
    }
    return t(key)
  }

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {getText('studyChina.features.title', '为什么选择中国游学')}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {getText('studyChina.features.subtitle', '体验世界一流的教育资源，探索丰富的文化传统，开启您的国际化学习之旅')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => {
            const IconComponent = feature.icon
            return (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <IconComponent className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {getText(feature.titleKey, feature.defaultTitle)}
                </h3>
                <p className="text-gray-600 leading-relaxed text-sm">
                  {getText(feature.descriptionKey, feature.defaultDescription)}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default StudyChinaFeatures
