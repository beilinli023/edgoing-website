"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin, GraduationCap } from 'lucide-react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Image from "next/image"
import { useTranslation } from "react-i18next"
import { useContent } from "@/hooks/useContent"

interface Program {
  programId: string
  titleKey: string
  titleFallback: string
  descriptionKey: string
  descriptionFallback: string
  typeKeys: string[]
  typeFallbacks: string[]
  countryKey: string
  countryFallback: string
  gradeLevelKeys: string[]
  gradeLevelFallbacks: string[]
  sessionKeys: string[]
  sessionFallbacks: string[]
  deadlineKey: string
  deadlineFallback: string
  durationKey: string
  durationFallback: string
  images: string[]
  highlightsKeys: string[]
  highlightsFallbacks: string[]
  academicsKeys: string[]
  academicsFallbacks: string[]
  itineraryKeys: string[]
  itineraryFallbacks: string[]
  admissionKeys: string[]
  admissionFallbacks: string[]
}

interface InternationalProgramDetailProps {
  program: Program
}

const InternationalProgramDetail: React.FC<InternationalProgramDetailProps> = ({ program }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isClient, setIsClient] = useState(false)
  const { t, ready, i18n } = useTranslation()
  const { getContent } = useContent()

  useEffect(() => {
    setIsClient(true)
  }, [])

  // 强制组件在语言切换时重新渲染
  const [forceRender, setForceRender] = useState(0)
  
  useEffect(() => {
    // 当语言或i18n准备状态改变时，强制重新渲染
    setForceRender(prev => prev + 1)
  }, [i18n.language, ready])

  const getText = (key: string, fallback: string) => {
    // 优先从数据库获取内容，如果没有则使用 i18n
    const dbContent = getContent(key)
    if (dbContent) return dbContent

    // During SSR or before i18n is ready, return fallback to prevent hydration mismatch
    if (!isClient || !ready) return fallback
    try {
      const translated = t(key)
      return translated && translated !== key ? translated : fallback
    } catch {
      return fallback
    }
  }

  const getTextWithFallbacks = (key: string, fallbackZh: string, fallbackEn: string) => {
    // 优先从数据库获取内容，如果没有则使用 i18n
    const dbContent = getContent(key)
    if (dbContent) return dbContent

    // 在客户端，即使 i18n 还没准备好，也要考虑当前语言设置
    if (!isClient || !ready) {
      // 客户端检查i18n语言设置，服务端默认英文
      if (isClient && i18n && i18n.language) {
        return i18n.language === 'en' ? fallbackEn : fallbackZh
      }
      return fallbackEn
    }

    try {
      const translation = t(key)
      // If translation returns the key itself (meaning no translation found), use fallback
      if (translation === key) {
        return i18n.language === 'en' ? fallbackEn : fallbackZh
      }
      return translation || (i18n.language === 'en' ? fallbackEn : fallbackZh)
    } catch {
      return i18n.language === 'en' ? fallbackEn : fallbackZh
    }
  }

  // 获取图片数组，优先使用gallery，fallback到featuredImage
  const getImageUrl = (imageData: any): string => {
    if (typeof imageData === 'string') {
      return imageData
    }
    if (imageData && typeof imageData === 'object' && imageData.url) {
      return imageData.url
    }
    return "/placeholder.svg"
  }

  const getImagesArray = () => {
    let imagesList: string[] = []

    // 处理gallery数组
    if (program.gallery && Array.isArray(program.gallery) && program.gallery.length > 0) {
      imagesList = program.gallery.map(getImageUrl)
    }
    // 如果没有gallery，尝试使用images（fallback数据）
    else if (program.images && Array.isArray(program.images) && program.images.length > 0) {
      imagesList = program.images.map(getImageUrl)
    }
    // 如果都没有，使用featuredImage
    else if (program.featuredImage) {
      imagesList = [getImageUrl(program.featuredImage)]
    }

    // 如果还是没有图片，使用placeholder
    if (imagesList.length === 0) {
      imagesList = ["/placeholder.svg"]
    }

    return imagesList
  }

  const images = getImagesArray()

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  return (
    <div className="container mx-auto px-8 py-12 max-w-5xl">
      {/* 图片轮播 */}
      <div className="relative mb-12">
        <div className="relative h-[400px] overflow-hidden rounded-lg">
          <Image
            src={images[currentImageIndex] || "/placeholder.svg"}
            alt={`${getText(program.titleKey || '', program.titleFallback || program.title || '')} - ${getText("common.image", "图片")} ${currentImageIndex + 1}`}
            fill
            className="object-cover"
          />

          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-6 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-3 rounded-full shadow-lg"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-6 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-3 rounded-full shadow-lg"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
        </div>

        {/* 图片指示器 */}
        {images.length > 1 && (
          <div className="flex justify-center mt-6 space-x-3">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`w-3 h-3 rounded-full transition-colors ${index === currentImageIndex ? "bg-blue-600" : "bg-gray-300"}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* 项目信息标签 */}
      <div className="py-8 mb-12">
        <div className="space-y-6">
          {/* 第一行：项目类型 + 时长 */}
          <div className="flex flex-wrap items-center gap-8">
            <div className="flex items-center gap-3">
              <span className="text-base font-medium text-gray-700">{getTextWithFallbacks("program.projectType", "项目类型", "Project Type")}:</span>
              <div className="flex gap-2">
                {program.typeKeys.length > 0 ? (
                  program.typeKeys.map((typeKey, index) => (
                    <Badge key={index} variant="secondary" className="text-sm px-3 py-1">
                      {getText(typeKey, program.typeFallbacks[index])}
                    </Badge>
                  ))
                ) : (
                  program.typeFallbacks.map((type, index) => (
                    <Badge key={index} variant="secondary" className="text-sm px-3 py-1">
                      {type}
                    </Badge>
                  ))
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-gray-600" />
              <span className="text-base font-medium text-gray-700">{getTextWithFallbacks("program.duration", "时长", "Duration")}:</span>
              <span className="text-base font-medium text-gray-900">
                {program.durationKey ? getText(program.durationKey, program.durationFallback) : program.durationFallback}
              </span>
            </div>
          </div>

          {/* 第二行：城市 + 年级 */}
          <div className="flex flex-wrap items-center gap-8">
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-gray-600" />
              <span className="text-base font-medium text-gray-700">{getTextWithFallbacks("program.city", "城市", "City")}:</span>
              <span className="text-base font-medium text-gray-900">
                {program.cityKey ? getText(program.cityKey, program.cityFallback) : program.cityFallback || program.city}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <GraduationCap className="w-5 h-5 text-gray-600" />
              <span className="text-base font-medium text-gray-700">{getTextWithFallbacks("program.gradeLevel", "年级", "Grade Level")}:</span>
              <div className="flex gap-2">
                {program.gradeLevelKeys.length > 0 ? (
                  program.gradeLevelKeys.map((gradeKey, index) => (
                    <Badge key={index} variant="outline" className="text-sm px-3 py-1">
                      {getText(gradeKey, program.gradeLevelFallbacks[index])}
                    </Badge>
                  ))
                ) : (
                  program.gradeLevelFallbacks.map((grade, index) => (
                    <Badge key={index} variant="outline" className="text-sm px-3 py-1">
                      {grade}
                    </Badge>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* 第三行：营期 */}
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-gray-600" />
            <span className="text-base font-medium text-gray-700">{getTextWithFallbacks("program.sessions", "营期", "Sessions")}:</span>
            <div className="flex flex-wrap gap-2">
              {program.sessionKeys.length > 0 ? (
                program.sessionKeys.map((sessionKey, index) => (
                  <Badge key={index} variant="default" className="text-sm bg-blue-100 text-blue-800 px-3 py-1">
                    {getText(sessionKey, program.sessionFallbacks[index])}
                  </Badge>
                ))
              ) : (
                program.sessionFallbacks.map((session, index) => (
                  <Badge key={index} variant="default" className="text-sm bg-blue-100 text-blue-800 px-3 py-1">
                    {session}
                  </Badge>
                ))
              )}
            </div>
          </div>

          {/* 第四行：截止日期 */}
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-red-600" />
            <span className="text-base font-medium text-gray-700">{getTextWithFallbacks("program.deadline", "截止日期", "Deadline")}:</span>
            <Badge variant="destructive" className="text-sm px-3 py-1">
              {program.deadlineKey ? getText(program.deadlineKey, program.deadlineFallback) : program.deadlineFallback}
            </Badge>
          </div>
        </div>
      </div>

      {/* 项目描述 */}
      <div className="py-8 mb-12">
        <h3 className="text-2xl font-semibold mb-6 text-gray-900">{getTextWithFallbacks("program.introduction", "项目介绍", "Program Introduction")}</h3>
        <p className="text-gray-700 leading-relaxed text-base">
          {program.descriptionKey ? getText(program.descriptionKey, program.descriptionFallback) : program.descriptionFallback}
        </p>
      </div>

      {/* 标签页内容 */}
      <div className="py-8 mb-8">
        <Tabs defaultValue="highlights" className="w-full">
          <TabsList className="w-full flex justify-start border-b border-gray-200 bg-transparent h-auto p-0 rounded-none">
            <TabsTrigger
              value="highlights"
              className="data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:bg-transparent text-gray-600 hover:text-gray-800 rounded-none px-6 py-3 border-b-2 border-transparent font-medium"
            >
              {getTextWithFallbacks("tabs.highlights", "项目亮点", "Highlights")}
            </TabsTrigger>
            <TabsTrigger
              value="features"
              className="data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:bg-transparent text-gray-600 hover:text-gray-800 rounded-none px-6 py-3 border-b-2 border-transparent font-medium"
            >
              {getTextWithFallbacks("tabs.features", "项目特色", "Features")}
            </TabsTrigger>
            <TabsTrigger
              value="itinerary"
              className="data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:bg-transparent text-gray-600 hover:text-gray-800 rounded-none px-6 py-3 border-b-2 border-transparent font-medium"
            >
              {getTextWithFallbacks("tabs.itinerary", "行程安排", "Itinerary")}
            </TabsTrigger>
            <TabsTrigger
              value="additional"
              className="data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:bg-transparent text-gray-600 hover:text-gray-800 rounded-none px-6 py-3 border-b-2 border-transparent font-medium"
            >
              {getTextWithFallbacks("tabs.additional", "额外信息", "Additional Info")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="highlights" className="mt-8">
            <div className="space-y-6">
              <ul className="space-y-4">
                {program.highlightsKeys.length > 0 ? (
                  program.highlightsKeys.map((highlightKey, index) => (
                    <li className="flex items-start" key={index}>
                      <span className="text-blue-500 mr-3 mt-1 text-lg">•</span>
                      <span className="text-gray-700 leading-relaxed text-lg">
                        {getText(highlightKey, program.highlightsFallbacks[index])}
                      </span>
                    </li>
                  ))
                ) : (
                  program.highlightsFallbacks.map((highlight, index) => (
                    <li className="flex items-start" key={index}>
                      <span className="text-blue-500 mr-3 mt-1 text-lg">•</span>
                      <span className="text-gray-700 leading-relaxed text-lg">
                        {highlight}
                      </span>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="features" className="mt-8">
            <div className="space-y-6">
              <div className="space-y-4 text-gray-700">
                <ul className="space-y-4">
                  {program.academicsKeys.length > 0 ? (
                    program.academicsKeys.map((academicKey, index) => (
                      <li className="flex items-start" key={index}>
                        <span className="text-blue-500 mr-3 mt-1 text-lg">•</span>
                        <span className="text-gray-700 leading-relaxed text-lg">
                          {getText(academicKey, program.academicsFallbacks[index])}
                        </span>
                      </li>
                    ))
                  ) : (
                    program.academicsFallbacks.map((academic, index) => (
                      <li className="flex items-start" key={index}>
                        <span className="text-blue-500 mr-3 mt-1 text-lg">•</span>
                        <span className="text-gray-700 leading-relaxed text-lg">
                          {academic}
                        </span>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="itinerary" className="mt-8">
            <div className="space-y-6">
              <ul className="space-y-4">
                {program.itineraryKeys.length > 0 ? (
                  program.itineraryKeys.map((itineraryKey, index) => (
                    <li className="flex items-start" key={index}>
                      <span className="text-blue-500 mr-3 mt-1 text-lg">•</span>
                      <span className="text-gray-700 leading-relaxed text-lg">
                        {getText(itineraryKey, program.itineraryFallbacks[index])}
                      </span>
                    </li>
                  ))
                ) : (
                  program.itineraryFallbacks.map((itinerary, index) => (
                    <li className="flex items-start" key={index}>
                      <span className="text-blue-500 mr-3 mt-1 text-lg">•</span>
                      <span className="text-gray-700 leading-relaxed text-lg">
                        {itinerary}
                      </span>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="additional" className="mt-8">
            <div className="space-y-6">
              <ul className="space-y-4">
                {program.admissionKeys.length > 0 ? (
                  program.admissionKeys.map((admissionKey, index) => (
                    <li className="flex items-start" key={index}>
                      <span className="text-blue-500 mr-3 mt-1 text-lg">•</span>
                      <span className="text-gray-700 leading-relaxed text-lg">
                        {getText(admissionKey, program.admissionFallbacks[index])}
                      </span>
                    </li>
                  ))
                ) : (
                  program.admissionFallbacks.map((admission, index) => (
                    <li className="flex items-start" key={index}>
                      <span className="text-blue-500 mr-3 mt-1 text-lg">•</span>
                      <span className="text-gray-700 leading-relaxed text-lg">
                        {admission}
                      </span>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default InternationalProgramDetail
