"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { useTranslation } from "react-i18next"
import { useContent } from "@/hooks/useContent"

const AboutMission = () => {
  const { t, ready, i18n } = useTranslation()
  const { getContent } = useContent()
  const [isClient, setIsClient] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    setIsClient(true)
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  const getText = (key: string, fallbackZh: string, fallbackEn?: string) => {
    if (!isClient || !ready) {
      return fallbackZh
    }

    // 根据当前语言返回对应文本
    if (i18n.language === 'en' && fallbackEn) {
      return fallbackEn
    }
    return fallbackZh
  }

  return (
    <section ref={sectionRef} className="py-16 bg-white">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* 左侧：内容列表 */}
            <div className={`space-y-4 transform transition-all duration-700 ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-8 opacity-0'}`}>
              <h2 className="text-4xl font-bold text-gray-900 mb-2">
                {getText("about_mission_title", "我们的使命", "Our Mission")}
              </h2>

              <p className="text-lg text-gray-600 mb-4 leading-relaxed">
                {getText("about_mission_description", "EdGoing致力于为全球学生提供变革性的教育体验，通过以下方式实现我们的使命：", "EdGoing is committed to providing transformative educational experiences for global students through the following approaches:")}
              </p>

              <div className="space-y-3">
                <div className={`flex items-start space-x-3 transform transition-all duration-500 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'}`} style={{ transitionDelay: '200ms' }}>
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-700 leading-relaxed">
                    {getText("mission_point_1", "通过创造超越课堂的变革性、真实世界的学习体验，重新定义教育。", "Redefine education by creating transformative, real-world learning experiences beyond the classroom.")}
                  </p>
                </div>

                <div className={`flex items-start space-x-3 transform transition-all duration-500 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'}`} style={{ transitionDelay: '300ms' }}>
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-700 leading-relaxed">
                    {getText("mission_point_2", "通过精心策划的教育旅行项目，架起文化桥梁，促进全球连接。", "Bridge cultures and foster global connections through curated educational travel programs.")}
                  </p>
                </div>

                <div className={`flex items-start space-x-3 transform transition-all duration-500 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'}`} style={{ transitionDelay: '400ms' }}>
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-700 leading-relaxed">
                    {getText("mission_point_3", "通过沉浸式、实践性的学习机会，激发好奇心和个人成长。", "Inspire curiosity and personal growth through immersive, hands-on learning opportunities.")}
                  </p>
                </div>
                
                <div className={`flex items-start space-x-3 transform transition-all duration-500 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'}`} style={{ transitionDelay: '500ms' }}>
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-700 leading-relaxed">
                    {getText("mission_point_4", "与全球顶级大学合作，提供人工智能、技术、人文学科等领域的高质量课程。", "Partner with top universities worldwide to offer high-quality programs in fields like AI, technology, and humanities.")}
                  </p>
                </div>

                <div className={`flex items-start space-x-3 transform transition-all duration-500 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'}`} style={{ transitionDelay: '600ms' }}>
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-700 leading-relaxed">
                    {getText("mission_point_5", "赋能来自中国及世界各地的学生，探索新领域并发展关键技能。", "Empower students from China and around the world to explore new fields and develop critical skills.")}
                  </p>
                </div>

                <div className={`flex items-start space-x-3 transform transition-all duration-500 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'}`} style={{ transitionDelay: '700ms' }}>
                  <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-700 leading-relaxed">
                    {getText("mission_point_6", "通过培养富有思想、创新和全球视野的领导者，塑造未来。", "Shape the future by cultivating thoughtful, innovative, and globally-minded leaders.")}
                  </p>
                </div>
              </div>


            </div>

            {/* 右侧：图片 */}
            <div className={`transform transition-all duration-700 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'}`} style={{ transitionDelay: '400ms' }}>
              <div className="relative overflow-hidden rounded-lg">
                <Image
                  src="/mission.png"
                  alt="团队协作"
                  width={500}
                  height={450}
                  className="object-cover w-full h-[450px]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AboutMission
