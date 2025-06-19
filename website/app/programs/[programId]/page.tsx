"use client"

import type React from "react"
import { notFound } from "next/navigation"
import { useTranslation } from "react-i18next"
import { useState, useEffect } from "react"
import InternationalProgramDetailHero from "@/components/InternationalProgramDetailHero"
import InternationalProgramDetail from "@/components/InternationalProgramDetail"
import Footer from "@/components/Footer"
import { LanguageInitializer } from "@/components/LanguageInitializer"

async function getInternationalProgram(slug: string, language: string = 'zh') {
  try {
    // 在客户端使用相对路径，在服务端使用完整URL
    const baseUrl = typeof window !== 'undefined'
      ? '' // 客户端使用相对路径
      : process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000' // 服务端使用完整URL

    const response = await fetch(`${baseUrl}/api/programs/${slug}?language=${language}`, {
      cache: 'no-store' // 确保获取最新数据
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    return data.program
  } catch (error) {
    console.error('Error fetching international program:', error)
    return null
  }
}

// 转换API数据为组件期望的格式
function transformProgramData(apiData: any) {
  if (!apiData) return null

  // 创建图片数组，包含特色图片和画廊图片
  const images = []
  if (apiData.featuredImage) {
    images.push(apiData.featuredImage)
  }
  if (apiData.gallery && Array.isArray(apiData.gallery)) {
    images.push(...apiData.gallery)
  }

  // 确保所有数组字段都是数组
  const ensureArray = (value: any) => Array.isArray(value) ? value : []

  // 对于API数据，我们直接使用实际值作为fallback，keys为空
  return {
    programId: apiData.id || apiData.programId || '',
    titleKey: '',
    titleFallback: apiData.title || '',
    title: apiData.title || '', // 添加title字段以便兼容
    descriptionKey: '',
    descriptionFallback: apiData.description || '',
    typeKeys: [], // API数据没有keys，只有实际值
    typeFallbacks: ensureArray(apiData.type),
    countryKey: '',
    countryFallback: apiData.country || (apiData.city?.country?.name) || '',
    country: apiData.country || (apiData.city?.country?.name) || '', // 添加country字段以便兼容
    cityKey: '', // 添加城市key字段
    cityFallback: apiData.city?.name || '', // 添加城市fallback字段
    city: apiData.city?.name || '', // 添加city字段以便兼容
    gradeLevelKeys: [], // API数据没有keys，只有实际值
    gradeLevelFallbacks: ensureArray(apiData.gradeLevel),
    sessionKeys: [], // API数据没有keys，只有实际值
    sessionFallbacks: ensureArray(apiData.sessions),
    deadlineKey: '',
    deadlineFallback: apiData.deadline ? new Date(apiData.deadline).toLocaleDateString() : '',
    durationKey: '',
    durationFallback: apiData.duration || '',
    featuredImage: apiData.featuredImage, // 添加featuredImage字段
    gallery: ensureArray(apiData.gallery), // 添加gallery字段
    images: images.length > 0 ? images : ['/placeholder.svg'],
    highlightsKeys: [], // API数据没有keys，只有实际值
    highlightsFallbacks: ensureArray(apiData.highlights),
    academicsKeys: [], // API数据没有keys，只有实际值
    academicsFallbacks: ensureArray(apiData.academics),
    itineraryKeys: [], // API数据没有keys，只有实际值
    itineraryFallbacks: ensureArray(apiData.itinerary),
    admissionKeys: [], // API数据没有keys，只有实际值
    admissionFallbacks: ensureArray(apiData.requirements),
  }
}

// 支持中英文的国际项目数据结构（保留作为fallback）
const programsData = {
  "singapore-english-camp": {
    programId: "singapore-english-camp",
    titleKey: "programs.singaporeEnglish.title",
    titleFallback: "2025年新加坡海峡空英语营",
    descriptionKey: "programs.singaporeEnglish.description",
    descriptionFallback:
      "新加坡海峡空英语营是一个为期7天的沉浸式项目，专为10至15岁的学生设计，该项目旨在提升学生的英语水平。",
    typeKeys: ["programs.types.language", "programs.types.cultural"],
    typeFallbacks: ["语言强化", "国际交流"],
    countryKey: "countries.singapore",
    countryFallback: "新加坡",
    gradeLevelKeys: ["grades.elementary", "grades.middleSchool"],
    gradeLevelFallbacks: ["小学", "中学"],
    sessionKeys: ["programs.singaporeEnglish.sessions.session1", "programs.singaporeEnglish.sessions.session2"],
    sessionFallbacks: ["2025年7月20日 - 7月26日", "2025年8月15日 - 8月21日"],
    deadlineKey: "programs.singaporeEnglish.deadline",
    deadlineFallback: "2025年6月30日",
    durationKey: "programs.singaporeEnglish.duration",
    durationFallback: "1周；7天",
    backgroundImage: "/uploads/1749482112471-drvihfdfns6.jpg",
    images: [
      "/uploads/1749482112471-drvihfdfns6.jpg",
      "/uploads/1749482121332-m1xsowjsvnb.jpg",
      "/uploads/1749482112470-limd1eseua.jpg",
    ],
    highlightsKeys: [
      "programs.singaporeEnglish.highlights.highlight1",
      "programs.singaporeEnglish.highlights.highlight2",
      "programs.singaporeEnglish.highlights.highlight3",
      "programs.singaporeEnglish.highlights.highlight4",
      "programs.singaporeEnglish.highlights.highlight5",
    ],
    highlightsFallbacks: [
      "专为青少年设计的英语课程",
      "小班教学，个性化指导",
      "丰富的户外活动和文化体验",
      "安全的学习环境",
      "结业证书认证",
    ],
    academicsKeys: [
      "programs.singaporeEnglish.academics.academic1",
      "programs.singaporeEnglish.academics.academic2",
      "programs.singaporeEnglish.academics.academic3",
      "programs.singaporeEnglish.academics.academic4",
      "programs.singaporeEnglish.academics.academic5",
    ],
    academicsFallbacks: [
      "基础英语语法和词汇",
      "口语表达和发音训练",
      "英语阅读理解",
      "简单英语写作",
      "英语游戏和互动活动",
    ],
    itineraryKeys: [
      "programs.singaporeEnglish.itinerary.item1",
      "programs.singaporeEnglish.itinerary.item2",
      "programs.singaporeEnglish.itinerary.item3",
      "programs.singaporeEnglish.itinerary.item4",
      "programs.singaporeEnglish.itinerary.item5",
      "programs.singaporeEnglish.itinerary.item6",
      "programs.singaporeEnglish.itinerary.item7",
      "programs.singaporeEnglish.itinerary.item8",
    ],
    itineraryFallbacks: [
      "英语基础课程",
      "互动游戏活动",
      "文化探索活动",
      "小组合作项目",
      "户外英语实践",
      "艺术创作活动",
      "成果展示准备",
      "结业庆祝活动",
    ],
    admissionKeys: [
      "programs.singaporeEnglish.admission.req1",
      "programs.singaporeEnglish.admission.req2",
      "programs.singaporeEnglish.admission.req3",
      "programs.singaporeEnglish.admission.req4",
      "programs.singaporeEnglish.admission.material1",
      "programs.singaporeEnglish.admission.material2",
      "programs.singaporeEnglish.admission.material3",
      "programs.singaporeEnglish.admission.material4",
      "programs.singaporeEnglish.admission.material5",
    ],
    admissionFallbacks: [
      "年龄：10-15岁",
      "学历：小学或初中在读",
      "语言：无特殊要求",
      "身体健康，喜欢学习",
      "申请表",
      "家长同意书",
      "学校成绩单",
      "健康证明",
      "护照复印件",
    ],
  },
  "singapore-stem-ai": {
    programId: "singapore-stem-ai",
    titleKey: "programs.singaporeSTEM.title",
    titleFallback: "2025年新加坡STEM与AI营",
    descriptionKey: "programs.singaporeSTEM.description",
    descriptionFallback:
      "新加坡科学与创新STEM夏令营是一个为期7天的沉浸式项目，专为7岁及以上儿童设计，探索科学技术的奥秘。",
    typeKeys: ["programs.types.stem", "programs.types.innovation"],
    typeFallbacks: ["STEM与科学创新", "创新研究"],
    countryKey: "countries.singapore",
    countryFallback: "新加坡",
    gradeLevelKeys: ["grades.elementary", "grades.middleSchool", "grades.highSchool"],
    gradeLevelFallbacks: ["小学", "中学", "高中"],
    sessionKeys: ["programs.singaporeSTEM.sessions.session1", "programs.singaporeSTEM.sessions.session2"],
    sessionFallbacks: ["2025年7月25日 - 7月31日", "2025年8月20日 - 8月26日"],
    deadlineKey: "programs.singaporeSTEM.deadline",
    deadlineFallback: "2025年7月5日",
    durationKey: "programs.singaporeSTEM.duration",
    durationFallback: "1周；7天",
    backgroundImage: "/uploads/1749482230546-mejabquouid.jpg",
    images: [
      "/uploads/1749482230546-mejabquouid.jpg",
      "/uploads/1749482230538-v15ljcon85n.jpg",
      "/uploads/1749482112470-limd1eseua.jpg",
    ],
    highlightsKeys: [
      "programs.singaporeSTEM.highlights.highlight1",
      "programs.singaporeSTEM.highlights.highlight2",
      "programs.singaporeSTEM.highlights.highlight3",
      "programs.singaporeSTEM.highlights.highlight4",
      "programs.singaporeSTEM.highlights.highlight5",
    ],
    highlightsFallbacks: [
      "动手实践的STEM项目",
      "人工智能基础知识学习",
      "科学实验和探索",
      "团队合作和创新思维",
      "专业导师指导",
    ],
    academicsKeys: [
      "programs.singaporeSTEM.academics.academic1",
      "programs.singaporeSTEM.academics.academic2",
      "programs.singaporeSTEM.academics.academic3",
      "programs.singaporeSTEM.academics.academic4",
      "programs.singaporeSTEM.academics.academic5",
    ],
    academicsFallbacks: ["基础编程概念", "机器人制作和编程", "科学实验方法", "数学逻辑思维", "创新设计思维"],
    itineraryKeys: [
      "programs.singaporeSTEM.itinerary.item1",
      "programs.singaporeSTEM.itinerary.item2",
      "programs.singaporeSTEM.itinerary.item3",
      "programs.singaporeSTEM.itinerary.item4",
      "programs.singaporeSTEM.itinerary.item5",
      "programs.singaporeSTEM.itinerary.item6",
      "programs.singaporeSTEM.itinerary.item7",
      "programs.singaporeSTEM.itinerary.item8",
    ],
    itineraryFallbacks: [
      "STEM基础课程",
      "编程入门学习",
      "机器人制作",
      "科学实验室",
      "AI概念学习",
      "团队项目制作",
      "成果展示",
      "结业仪式",
    ],
    admissionKeys: [
      "programs.singaporeSTEM.admission.req1",
      "programs.singaporeSTEM.admission.req2",
      "programs.singaporeSTEM.admission.req3",
      "programs.singaporeSTEM.admission.req4",
      "programs.singaporeSTEM.admission.material1",
      "programs.singaporeSTEM.admission.material2",
      "programs.singaporeSTEM.admission.material3",
      "programs.singaporeSTEM.admission.material4",
      "programs.singaporeSTEM.admission.material5",
    ],
    admissionFallbacks: [
      "年龄：7岁及以上",
      "学历：小学或以上",
      "语言：基础英语理解能力",
      "对科学技术有兴趣",
      "申请表",
      "家长同意书",
      "学校成绩单",
      "健康证明",
      "护照复印件",
    ],
  },
}

interface ProgramDetailPageProps {
  params: {
    programId: string
  }
}

const ProgramDetailPage: React.FC<ProgramDetailPageProps> = ({ params }) => {
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
      let fetchedProgram = await getInternationalProgram(programId, i18n.language)

      if (fetchedProgram) {
        // 如果从API获取到数据，直接使用（不需要转换，因为会在渲染时转换）
        setProgram(fetchedProgram)
      } else {
        // 如果API没有数据，使用fallback数据
        const fallbackProgram = programsData[programId as keyof typeof programsData]

        if (!fallbackProgram) {
          notFound()
        }
        setProgram(fallbackProgram)
      }
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

  // 判断是否为API数据（有id字段）还是fallback数据（有programId字段）
  const isApiData = program.id && !program.programId
  const transformedProgram = isApiData ? transformProgramData(program) : program

  return (
    <div className="min-h-screen flex flex-col">
      <LanguageInitializer />
      <InternationalProgramDetailHero
        titleKey={transformedProgram.titleKey || ''}
        titleFallback={transformedProgram.title || transformedProgram.titleFallback || ''}
        countryKey={transformedProgram.countryKey || ''}
        countryFallback={transformedProgram.country || transformedProgram.countryFallback || ''}
        backgroundImage={transformedProgram.featuredImage || transformedProgram.backgroundImage || ''}
      />
      <div className="flex-grow bg-gray-50">
        <InternationalProgramDetail program={transformedProgram} />
      </div>
      <Footer />
    </div>
  )
}

export default ProgramDetailPage
