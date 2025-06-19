"use client"

import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import * as LucideIcons from "lucide-react"

const WhyChooseUs = () => {
  const { t, ready } = useTranslation()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const getText = (key: string, fallback: string) => {
    if (!isClient || !ready) return fallback
    try {
      return t(key) || fallback
    } catch {
      return fallback
    }
  }

  const features = [
    {
      icon: LucideIcons.Users,
      titleKey: "whyChoose.leadership.title",
      titleFallback: "经验丰富的领导团队",
      descKey: "whyChoose.leadership.description",
      descFallback:
        "我们经验丰富的团队在您的整个旅程中提供专业指导和全面支持。",
    },
    {
      icon: LucideIcons.GraduationCap,
      titleKey: "whyChoose.education.title",
      titleFallback: "高质量教育项目",
      descKey: "whyChoose.education.description",
      descFallback:
        "与顶级合作院校精心设计的项目，提供卓越的教育体验。",
    },
    {
      icon: LucideIcons.Home,
      titleKey: "whyChoose.accommodation.title",
      titleFallback: "安全住宿与健康饮食",
      descKey: "whyChoose.accommodation.description",
      descFallback: "安全的生活环境和营养餐食，确保您的健康和福祉。",
    },
    {
      icon: LucideIcons.Clock,
      titleKey: "whyChoose.support247.title",
      titleFallback: "24/7全天候支持",
      descKey: "whyChoose.support247.description",
      descFallback: "全天候支持服务，为学员提供持续的帮助。",
    },
    {
      icon: LucideIcons.Globe,
      titleKey: "whyChoose.cultural.title",
      titleFallback: "沉浸式文化体验",
      descKey: "whyChoose.cultural.description",
      descFallback: "互动活动和丰富的旅行体验，促进深度文化学习。",
    },
    {
      icon: LucideIcons.Award,
      titleKey: "whyChoose.academic.title",
      titleFallback: "认可的学术卓越",
      descKey: "whyChoose.academic.description",
      descFallback: "获得顶级大学认可的课程，提升您的学术资历。",
    },
  ]

  return (
    <section className="relative w-screen py-20 -mx-4 md:-mx-6 lg:-mx-8">
      {/* Background Image */}
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-center"
        style={{
          backgroundImage: `url('/felicidad-call-center.jpg')`, // Updated to use existing local image
          backgroundPosition: '70% center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/20 to-black/40" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-[80%] mx-auto px-6 md:px-8 lg:px-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
            {getText("whyChoose.title", "学员支持与安全")}
          </h2>
          <p className="text-base text-white/90 max-w-4xl mx-auto">
            {getText(
              "whyChoose.subtitle",
              "我们将您的健康和安全放在首位，在您的教育旅程中提供全面的支持服务。",
            )}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => {
            const IconComponent = feature.icon
            return (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-2">
                      {getText(feature.titleKey, feature.titleFallback)}
                    </h3>
                    <p className="text-white/90 text-xs leading-relaxed">
                      {getText(feature.descKey, feature.descFallback)}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default WhyChooseUs
