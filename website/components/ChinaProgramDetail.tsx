"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin, GraduationCap } from 'lucide-react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Image from "next/image"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTranslation } from "react-i18next"

interface Program {
  programId: string
  title: string
  description: string
  type: string[]
  city?: {
    id: string
    name: string
    nameEn?: string
    countries?: {
      name: string
      nameEn?: string
    }
  }
  gradeLevel: string[]
  duration: string
  sessions: string[]
  deadline: string
  images: (string | { url: string; alt?: string })[]
  gallery?: (string | { url: string; alt?: string })[]
  featuredImage?: string | { url: string; alt?: string }
  highlights?: string[]
  academics?: string[]
  itinerary?: string[]
  requirements?: string[]
}

interface ChinaProgramDetailProps {
  program: Program
}

const ChinaProgramDetail: React.FC<ChinaProgramDetailProps> = ({ program }) => {
  const { t, i18n } = useTranslation()
  const [sharedFields, setSharedFields] = useState<{
    programTypes: Array<{ id: string; name: string; nameEn?: string }>
    gradeLevels: Array<{ id: string; name: string; nameEn?: string }>
  }>({
    programTypes: [],
    gradeLevels: []
  })

  // 获取共享字段数据
  useEffect(() => {
    const fetchSharedFields = async () => {
      try {
        const response = await fetch('/api/shared-fields')
        if (response.ok) {
          const data = await response.json()
          setSharedFields({
            programTypes: data.programTypes || [],
            gradeLevels: data.gradeLevels || []
          })
        }
      } catch (error) {
        console.error('Error fetching shared fields:', error)
      }
    }

    fetchSharedFields()
  }, [])

  // 翻译字段 - 从共享字段数据中查找对应的翻译
  const translateField = (value: string, type: 'programType' | 'gradeLevel') => {
    if (type === 'programType') {
      const programType = sharedFields.programTypes.find(pt => pt.name === value)
      if (programType) {
        return i18n.language === 'en' && programType.nameEn ? programType.nameEn : programType.name
      }
    } else if (type === 'gradeLevel') {
      const gradeLevel = sharedFields.gradeLevels.find(gl => gl.name === value)
      if (gradeLevel) {
        return i18n.language === 'en' && gradeLevel.nameEn ? gradeLevel.nameEn : gradeLevel.name
      }
    }

    return value
  }
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // 获取图片数组，优先使用gallery，fallback到images，最后使用featuredImage
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
    // 如果没有gallery，尝试使用images
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
            alt={`${program.title} - 图片 ${currentImageIndex + 1}`}
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
            {images.map((_: string, index: number) => (
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
              <span className="text-base font-medium text-gray-700">{t('programDetail.projectType')}:</span>
              <div className="flex gap-2">
                {(program.type || []).map((type, index) => (
                  <Badge key={index} variant="secondary" className="text-sm px-3 py-1">
                    {translateField(type, 'programType')}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-gray-600" />
              <span className="text-base font-medium text-gray-700">{t('programDetail.duration')}:</span>
              <span className="text-base font-medium text-gray-900">{program.duration}</span>
            </div>
          </div>

          {/* 第二行：城市 + 年级 */}
          <div className="flex flex-wrap items-center gap-8">
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-gray-600" />
              <span className="text-base font-medium text-gray-700">{t('programDetail.city')}:</span>
              <span className="text-base font-medium text-gray-900">
                {program.city ? (i18n.language === 'en' && program.city.nameEn ? program.city.nameEn : program.city.name) : 'No city assigned'}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <GraduationCap className="w-5 h-5 text-gray-600" />
              <span className="text-base font-medium text-gray-700">{t('programDetail.gradeLevel')}:</span>
              <div className="flex gap-2">
                {(program.gradeLevel || []).map((grade, index) => (
                  <Badge key={index} variant="outline" className="text-sm px-3 py-1">
                    {translateField(grade, 'gradeLevel')}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* 第三行：营期 */}
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-gray-600" />
            <span className="text-base font-medium text-gray-700">{t('programDetail.sessions')}:</span>
            <div className="flex flex-wrap gap-2">
              {(program.sessions || []).map((session, index) => (
                <Badge key={index} variant="default" className="text-sm bg-blue-100 text-blue-800 px-3 py-1">
                  {session}
                </Badge>
              ))}
            </div>
          </div>

          {/* 第四行：截止日期 */}
          {program.deadline && (
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-red-600" />
              <span className="text-base font-medium text-gray-700">{t('programDetail.deadline')}:</span>
              <Badge variant="destructive" className="text-sm px-3 py-1">
                {typeof program.deadline === 'string'
                  ? program.deadline.includes('T')
                    ? program.deadline.split('T')[0]
                    : program.deadline
                  : new Date(program.deadline).toISOString().split('T')[0]
                }
              </Badge>
            </div>
          )}
        </div>
      </div>

      {/* 项目描述 */}
      <div className="py-8 mb-12">
        <h3 className="text-2xl font-semibold mb-6 text-gray-800 leading-relaxed">{t('programDetail.projectIntroduction')}</h3>
        <p className="text-gray-700 leading-relaxed text-base">{program.description}</p>
      </div>


      {/* 标签页内容 */}
      <div className="py-8">
        <Tabs defaultValue="highlights" className="w-full">
          <TabsList className="w-full flex justify-start border-b border-gray-200 bg-transparent h-auto p-0 rounded-none mb-8">
            <TabsTrigger
              value="highlights"
              className="data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:bg-transparent text-gray-600 hover:text-gray-800 rounded-none px-6 py-3 border-b-2 border-transparent font-medium text-base"
            >
              {t('tabs.highlights')}
            </TabsTrigger>
            <TabsTrigger
              value="academics"
              className="data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:bg-transparent text-gray-600 hover:text-gray-800 rounded-none px-6 py-3 border-b-2 border-transparent font-medium text-base"
            >
              {t('tabs.academics')}
            </TabsTrigger>
            <TabsTrigger
              value="itinerary"
              className="data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:bg-transparent text-gray-600 hover:text-gray-800 rounded-none px-6 py-3 border-b-2 border-transparent font-medium text-base"
            >
              {t('tabs.itinerary')}
            </TabsTrigger>
            <TabsTrigger
              value="admission"
              className="data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:bg-transparent text-gray-600 hover:text-gray-800 rounded-none px-6 py-3 border-b-2 border-transparent font-medium text-base"
            >
              {t('tabs.admission')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="highlights" className="mt-6">
            <div className="space-y-4">
              {program.highlights && program.highlights.length > 0 ? (
                <ul className="space-y-3">
                  {program.highlights.map((highlight: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-500 mr-3 mt-1 text-lg">•</span>
                      <span className="text-gray-700 leading-relaxed text-base">{highlight}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-3 mt-1 text-lg">•</span>
                    <span className="text-gray-700 leading-relaxed text-base">{t('programDetail.defaultHighlights.highlight1')}</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-3 mt-1 text-lg">•</span>
                    <span className="text-gray-700 leading-relaxed text-base">{t('programDetail.defaultHighlights.highlight2')}</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-3 mt-1 text-lg">•</span>
                    <span className="text-gray-700 leading-relaxed text-base">{t('programDetail.defaultHighlights.highlight3')}</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-3 mt-1 text-lg">•</span>
                    <span className="text-gray-700 leading-relaxed text-base">{t('programDetail.defaultHighlights.highlight4')}</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-3 mt-1 text-lg">•</span>
                    <span className="text-gray-700 leading-relaxed text-base">{t('programDetail.defaultHighlights.highlight5')}</span>
                  </li>
                </ul>
              )}
            </div>
          </TabsContent>

          <TabsContent value="academics" className="mt-6">
            <div className="space-y-4">
              <div className="space-y-4 text-gray-700">
                {program.academics && program.academics.length > 0 ? (
                  <ul className="space-y-3">
                      {program.academics.map((academic: string, index: number) => (
                        <li key={index} className="flex items-start">
                          <span className="text-blue-500 mr-3 mt-1 text-lg">•</span>
                          <span className="text-gray-700 leading-relaxed text-base">{academic}</span>
                        </li>
                      ))}
                    </ul>
                ) : (
                  <ul className="space-y-3">
                      <li className="flex items-start">
                        <span className="text-blue-500 mr-3 mt-1 text-lg">•</span>
                        <span className="text-gray-700 leading-relaxed text-base">{t('programDetail.defaultAcademics.academic1')}</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-500 mr-3 mt-1 text-lg">•</span>
                        <span className="text-gray-700 leading-relaxed text-base">{t('programDetail.defaultAcademics.academic2')}</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-500 mr-3 mt-1 text-lg">•</span>
                        <span className="text-gray-700 leading-relaxed text-base">{t('programDetail.defaultAcademics.academic3')}</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-500 mr-3 mt-1 text-lg">•</span>
                        <span className="text-gray-700 leading-relaxed text-base">{t('programDetail.defaultAcademics.academic4')}</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-500 mr-3 mt-1 text-lg">•</span>
                        <span className="text-gray-700 leading-relaxed text-base">{t('programDetail.defaultAcademics.academic5')}</span>
                      </li>
                    </ul>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="itinerary" className="mt-6">
            <div className="space-y-4">
              {program.itinerary && program.itinerary.length > 0 ? (
                <ul className="space-y-3">
                  {program.itinerary.map((item: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-500 mr-3 mt-1 text-lg">•</span>
                      <span className="text-gray-700 leading-relaxed text-base">{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="space-y-6">
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-800 mb-4 text-base">{t('programDetail.week1Title')}</h4>
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <span className="text-blue-500 mr-3 mt-1 text-lg">•</span>
                        <span className="text-gray-700 leading-relaxed text-base">{t('programDetail.defaultItinerary.week1.item1')}</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-500 mr-3 mt-1 text-lg">•</span>
                        <span className="text-gray-700 leading-relaxed text-base">{t('programDetail.defaultItinerary.week1.item2')}</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-500 mr-3 mt-1 text-lg">•</span>
                        <span className="text-gray-700 leading-relaxed text-base">{t('programDetail.defaultItinerary.week1.item3')}</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-500 mr-3 mt-1 text-lg">•</span>
                        <span className="text-gray-700 leading-relaxed text-base">{t('programDetail.defaultItinerary.week1.item4')}</span>
                      </li>
                    </ul>
                  </div>
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-800 mb-4 text-base">{t('programDetail.week2Title')}</h4>
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <span className="text-blue-500 mr-3 mt-1 text-lg">•</span>
                        <span className="text-gray-700 leading-relaxed text-base">{t('programDetail.defaultItinerary.week2.item1')}</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-500 mr-3 mt-1 text-lg">•</span>
                        <span className="text-gray-700 leading-relaxed text-base">{t('programDetail.defaultItinerary.week2.item2')}</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-500 mr-3 mt-1 text-lg">•</span>
                        <span className="text-gray-700 leading-relaxed text-base">{t('programDetail.defaultItinerary.week2.item3')}</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-500 mr-3 mt-1 text-lg">•</span>
                        <span className="text-gray-700 leading-relaxed text-base">{t('programDetail.defaultItinerary.week2.item4')}</span>
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="admission" className="mt-6">
            <div className="space-y-4">
              <div className="space-y-4 text-gray-700">
                {program.requirements && program.requirements.length > 0 ? (
                  <ul className="space-y-3">
                    {program.requirements.map((requirement: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <span className="text-blue-500 mr-3 mt-1 text-lg">•</span>
                        <span className="text-gray-700 leading-relaxed text-base">{requirement}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-3 mt-1 text-lg">•</span>
                      <span className="text-gray-700 leading-relaxed text-base">{t('programDetail.defaultRequirements.requirement1')}</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-3 mt-1 text-lg">•</span>
                      <span className="text-gray-700 leading-relaxed text-base">{t('programDetail.defaultRequirements.requirement2')}</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-3 mt-1 text-lg">•</span>
                      <span className="text-gray-700 leading-relaxed text-base">{t('programDetail.defaultRequirements.requirement3')}</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-3 mt-1 text-lg">•</span>
                      <span className="text-gray-700 leading-relaxed text-base">{t('programDetail.defaultRequirements.requirement4')}</span>
                    </li>
                  </ul>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default ChinaProgramDetail
