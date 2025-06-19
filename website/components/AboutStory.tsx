"use client"

import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { useContent } from "@/hooks/useContent"

const AboutStory = () => {
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

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-6 max-w-5xl">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">{getText("about.story.title", "我们的故事")}</h2>

          <div className="space-y-6 text-gray-700 leading-relaxed text-base">
            <p>
              {getText("about.story.paragraph1", "EdGoing成立于一个信念：教育应该是一次沉浸式的体验，而不仅仅是课堂上的一课。凭借在全球领先的教育旅行公司多年的经验，我们亲眼见证了旅行如何通过拓展学生的视野并激发他们对心，改变他们的成长历程。")}
            </p>

            <p>
              {getText("about.story.paragraph2", "受此启发，我们创办了EdGoing，旨在为来自中国和全球的学生提供独特的教育旅行体验。我们专注于与全球顶级大学合作，提供高质量的课程，涵盖人工智能、技术、人文学科等领域，为学生带来真正具有变革性的学习体验。")}
            </p>

            <p>{getText("about.story.paragraph3", "我们致力于架起文化桥梁，创造能够激发发现的项目，培养下一代领导者、思想家和全球公民。")}</p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AboutStory
