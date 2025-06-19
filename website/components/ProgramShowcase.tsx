"use client"

import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import Link from "next/link"
import Image from "next/image"

interface Program {
  id: string
  title: string
  description: string
  image: string
  type: string
  city: string
  link: string
}

const ProgramShowcase = () => {
  const { i18n, ready } = useTranslation()
  const [isClient, setIsClient] = useState(false)
  const [programs, setPrograms] = useState<Program[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    fetchPrograms()
  }, [i18n.language])

  const fetchPrograms = async () => {
    try {
      setLoading(true)
      const language = i18n.language || 'zh'
      const response = await fetch(`/api/homepage-showcase?language=${language}&limit=6`)

      if (response.ok) {
        const data = await response.json()
        if (data.programs && data.programs.length > 0) {
          setPrograms(data.programs)
        } else {
          // 如果没有首页展示数据，使用默认的项目数据
          await fetchFallbackPrograms(language)
        }
      } else {
        // API失败时使用默认数据
        await fetchFallbackPrograms(language)
      }
    } catch (error) {
      console.error('Failed to fetch showcase programs:', error)
      // 出错时使用默认数据
      await fetchFallbackPrograms(i18n.language || 'zh')
    } finally {
      setLoading(false)
    }
  }

  const fetchFallbackPrograms = async (language: string) => {
    try {
      // 获取一些中国项目和国际项目作为展示
      const [chinaResponse, internationalResponse] = await Promise.all([
        fetch(`/api/china-programs?language=${language}&limit=2`),
        fetch(`/api/programs?language=${language}&limit=4`)
      ])

      const fallbackPrograms: Program[] = []

      // 根据语言设置类型标签
      const chinaTypeLabel = language === 'zh' ? '游学中国' : 'Study China'
      const internationalTypeLabel = language === 'zh' ? '游学国际' : 'Study International'

      if (chinaResponse.ok) {
        const chinaData = await chinaResponse.json()
        chinaData.programs?.slice(0, 2).forEach((program: any) => {
          fallbackPrograms.push({
            id: program.id,
            title: program.title,
            description: program.description,
            image: program.featuredImage || '/placeholder-program.jpg',
            type: chinaTypeLabel,
            city: program.city?.name || program.city || '',
            link: `/study-china/${program.slug}`
          })
        })
      }

      if (internationalResponse.ok) {
        const internationalData = await internationalResponse.json()
        internationalData.programs?.slice(0, 4).forEach((program: any) => {
          fallbackPrograms.push({
            id: program.id,
            title: program.title,
            description: program.description,
            image: program.featuredImage || '/placeholder-program.jpg',
            type: internationalTypeLabel,
            city: program.city?.name || program.city || '',
            link: `/programs/${program.slug}`
          })
        })
      }

      setPrograms(fallbackPrograms.slice(0, 6))
    } catch (error) {
      console.error('Failed to fetch fallback programs:', error)
      // 最后的备用硬编码数据 - 根据语言设置
      const chinaTypeLabel = language === 'zh' ? '游学中国' : 'Study China'
      const internationalTypeLabel = language === 'zh' ? '游学国际' : 'Study International'

      setPrograms([
        {
          id: "fallback-1",
          title: language === 'zh' ? "中国文化体验之旅" : "China Cultural Experience Tour",
          description: language === 'zh' ? "深度体验中国传统文化与现代发展" : "Deep experience of Chinese traditional culture and modern development",
          image: "/uploads/1749483265249-k6gk6fhvg3.jpg",
          type: chinaTypeLabel,
          city: language === 'zh' ? "北京" : "Beijing",
          link: "/study-china",
        },
        {
          id: "fallback-2",
          title: language === 'zh' ? "新加坡STEM探索营" : "Singapore STEM Exploration Camp",
          description: language === 'zh' ? "探索科技前沿，体验创新教育" : "Explore cutting-edge technology and experience innovative education",
          image: "/uploads/1749482230538-v15ljcon85n.jpg",
          type: internationalTypeLabel,
          city: language === 'zh' ? "新加坡" : "Singapore",
          link: "/programs",
        },
        {
          id: "fallback-3",
          title: language === 'zh' ? "AI与未来科技体验" : "AI and Future Technology Experience",
          description: language === 'zh' ? "了解人工智能，探索未来科技" : "Understand artificial intelligence and explore future technology",
          image: "/uploads/1749482230546-mejabquouid.jpg",
          type: internationalTypeLabel,
          city: language === 'zh' ? "新加坡" : "Singapore",
          link: "/programs",
        },
      ])
    }
  }

  // Hardcoded bilingual content
  const getHardcodedText = (type: 'title' | 'viewAll') => {
    if (!isClient || !ready) {
      // Default to Chinese during SSR
      return type === 'title'
        ? "游学中国新视角：激发灵感、建立联系、实现蜕变的旅程。"
        : "查看所有项目 →"
    }

    const content = {
      zh: {
        title: "游学中国新视角：激发灵感、建立联系、实现蜕变的旅程。",
        viewAll: "查看所有项目 →"
      },
      en: {
        title: "Study China New Perspective: A Journey to Inspire, Connect, and Transform.",
        viewAll: "View All Programs →"
      }
    }

    const lang = i18n.language === 'en' ? 'en' : 'zh'
    return content[lang][type]
  }

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {getHardcodedText('title')}
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg overflow-hidden shadow-sm">
                <div className="h-48 bg-gray-200 animate-pulse"></div>
                <div className="p-6">
                  <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {getHardcodedText('title')}
          </h2>
          <Link href="/programs" className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center">
            {getHardcodedText('viewAll')}
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {programs.map((program) => (
            <Link
              key={program.id}
              href={program.link}
              className="group rounded-lg overflow-hidden transition-all duration-300"
            >
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={program.image || "/placeholder-program.jpg"}
                  alt={program.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">{program.title}</h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{program.description}</p>
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">{program.type}</span>
                  <span>{program.city}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {programs.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-500">暂无项目数据</p>
          </div>
        )}
      </div>
    </section>
  )
}

export default ProgramShowcase
