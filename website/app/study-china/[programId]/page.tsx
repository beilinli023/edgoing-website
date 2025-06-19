"use client"

import type React from "react"
import { notFound } from "next/navigation"
import { useTranslation } from "react-i18next"
import { useState, useEffect } from "react"
import ChinaProgramDetailHero from "@/components/ChinaProgramDetailHero"
import ChinaProgramDetail from "@/components/ChinaProgramDetail"
import Footer from "@/components/Footer"
import { LanguageInitializer } from "@/components/LanguageInitializer"

async function getChinaProgram(slug: string, language: string = 'zh') {
  try {
    // 在客户端使用相对路径，在服务端使用完整URL
    const baseUrl = typeof window !== 'undefined'
      ? '' // 客户端使用相对路径
      : process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001' // 服务端使用完整URL

    const response = await fetch(`${baseUrl}/api/china-programs/${slug}?language=${language}`, {
      cache: 'no-store' // 确保获取最新数据
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    return data.program
  } catch (error) {
    console.error('Error fetching china program:', error)
    return null
  }
}

// 保留作为fallback的硬编码数据
const chinaProgramsData = {
  "beijing-cultural-immersion": {
    programId: "beijing-cultural-immersion",
    title: "中国创新之道：文化根基到数字未来",
    description:
      "本项目是一个为期两周的深度体验式学习项目，融合讲座课堂、企业参访、文化工作坊与团队项目，以探索中国如何从传统文化根基发展出强劲的数字创新力量。项目面向全球学生，结合SWUFE的金融科技与创新研究优势，深入成都本地创新生态，带来沉浸式的中国创新实践体验。",
    type: ["学术拓展", "传统与艺术探索"],
    city: "成都",
    gradeLevel: ["高中", "本科"],
    duration: "2周；14天",
    backgroundImage: "/uploads/1749482112470-e3jnwfjrk9h.jpg",
    sessions: ["2025年7月1日 - 7月14日", "2025年7月15日 - 7月28日", "2025年8月1日 - 8月14日"],
    deadline: "2025年6月15日",
    images: [
      "/uploads/1749484980303-9tl6fx1zca.jpg",
      "/uploads/1749484401691-yp7e4m25qve.jpg",
      "/uploads/1749482222458-u6xn4ijjfjh.jpg",
    ],
  },
  "shanghai-business-innovation": {
    programId: "shanghai-business-innovation",
    title: "上海商业创新与科技探索",
    description: "深入上海国际金融中心，参访知名企业，了解中国商业模式创新，体验前沿科技发展。",
    type: ["商务", "STEM与科学创新"],
    city: "上海",
    gradeLevel: ["高中", "本科", "研究生"],
    duration: "2周；14天",
    backgroundImage: "/uploads/1749482222458-u6xn4ijjfjh.jpg",
    sessions: ["2025年7月5日 - 7月18日", "2025年8月5日 - 8月18日"],
    deadline: "2025年6月20日",
    images: [
      "/uploads/1749482222458-u6xn4ijjfjh.jpg",
      "/uploads/1749482230538-v15ljcon85n.jpg",
    ],
  },
}

interface ChinaProgramDetailPageProps {
  params: {
    programId: string
  }
}

const ChinaProgramDetailPage: React.FC<ChinaProgramDetailPageProps> = ({ params }) => {
  const { i18n } = useTranslation()
  const [program, setProgram] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [programId, setProgramId] = useState<string>('')

  useEffect(() => {
    const initParams = async () => {
      const resolvedParams = await params
      setProgramId(resolvedParams.programId)
    }
    initParams()
  }, [params])

  useEffect(() => {
    if (programId) {
      fetchProgram()
    }
  }, [programId, i18n.language])

  const fetchProgram = async () => {
    try {
      setLoading(true)
      // 首先尝试从API获取数据
      let fetchedProgram = await getChinaProgram(programId, i18n.language)

      // 如果API没有数据，使用fallback数据
      if (!fetchedProgram) {
        fetchedProgram = chinaProgramsData[programId as keyof typeof chinaProgramsData]
      }

      if (!fetchedProgram) {
        notFound()
      }

      setProgram(fetchedProgram)
    } catch (error) {
      console.error('Error loading program:', error)
      notFound()
    } finally {
      setLoading(false)
    }
  }

  if (loading || !program) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          {/* 移除文本避免水合错误 */}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <LanguageInitializer />
      <ChinaProgramDetailHero
        title={program.title}
        city={program.city}
        backgroundImage={program.featuredImage || program.backgroundImage}
      />
      <div className="flex-grow bg-gray-50">
        <ChinaProgramDetail program={program} />
      </div>
      <Footer />
    </div>
  )
}

export default ChinaProgramDetailPage
