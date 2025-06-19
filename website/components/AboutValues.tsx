"use client"

import { useState, useEffect } from "react"
import { Heart, Globe, CheckCircle, Lightbulb, Shield, Users, Award } from "lucide-react"
import { useTranslation } from "react-i18next"
import { useContent } from "@/hooks/useContent"

const AboutValues = () => {
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

  const values = [
    {
      icon: Lightbulb,
      title: getText("about.values.curiosity.title", "好奇心"),
      description: getText("about.values.curiosity.description", "我们相信保持学习习惯的探索，鼓励学生探索，提出问题发现新的视角"),
    },
    {
      icon: Globe,
      title: getText("about.values.culturalBridge.title", "文化桥梁"),
      description: getText("about.values.culturalBridge.description", "我们致力于建设文化桥梁，促进理解，并帮助学生与多元化全球社区建立联系"),
    },
    {
      icon: Award,
      title: getText("about.values.excellence.title", "卓越"),
      description: getText("about.values.excellence.description", "我们追求一切工作的最高标准，从课程质量到学生体验"),
    },
    {
      icon: Heart,
      title: getText("about.values.innovation.title", "创新"),
      description: getText("about.values.innovation.description", "我们拥抱创新思维和创新，不断寻求改进我们的项目，以保持在教育领域的领先地位"),
    },
    {
      icon: Shield,
      title: getText("about.values.integrity.title", "诚信"),
      description: getText("about.values.integrity.description", "我们以诚实和透明的态度行事，确保我们的项目建立在信任和相互尊重的基础上"),
    },
    {
      icon: Users,
      title: getText("about.values.globalCitizenship.title", "全球公民"),
      description: getText("about.values.globalCitizenship.description", "我们致力于培养负责任、有同理心的领导者，为全球社区做出积极贡献"),
    },
  ]

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{getText("about.values.title", "我们的核心价值观")}</h2>
          <p className="text-lg text-gray-600">{getText("about.values.subtitle", "指导我们一切行动的原则")}</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {values.map((value, index) => {
            const IconComponent = value.icon
            return (
              <div key={index} className="text-center p-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <IconComponent className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed text-sm">{value.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default AboutValues
