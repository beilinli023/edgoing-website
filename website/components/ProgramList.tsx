"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight, Clock } from "lucide-react"
import { Button } from "./ui/button"
import { useTranslation } from "react-i18next"
import { useContent } from "@/hooks/useContent"
import { useProgramFilter } from "@/contexts/ProgramFilterContext"
import ProgramCardSkeleton from "./ProgramCardSkeleton"

interface InternationalProgram {
  id: string
  title: string
  slug: string
  type: string[]
  gradeLevel: string[]
  city?: {
    id: string
    name: string
    nameEn?: string
    country?: {
      name: string
      nameEn?: string
    }
  }
  description: string
  featuredImage?: string
  deadline?: string
  duration: string
  applicationsCount?: number
}

const ITEMS_PER_PAGE = 6

const ProgramList = () => {
  const { t, i18n, ready } = useTranslation()
  const { getContent } = useContent()
  const { selectedTypes, selectedCountries, selectedGrades } = useProgramFilter()
  const [allPrograms, setAllPrograms] = useState<InternationalProgram[]>([])
  const [filteredPrograms, setFilteredPrograms] = useState<InternationalProgram[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [sharedFields, setSharedFields] = useState<{
    programTypes: Array<{ id: string; name: string; nameEn?: string }>
    gradeLevels: Array<{ id: string; name: string; nameEn?: string }>
    countries: Array<{ id: string; name: string; nameEn?: string }>
  }>({
    programTypes: [],
    gradeLevels: [],
    countries: []
  })

  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const getText = (key: string, fallbackZh: string, fallbackEn?: string) => {
    // 优先从数据库获取内容，如果没有则使用 i18n
    const dbContent = getContent(key)
    if (dbContent) return dbContent

    // During SSR or before i18n is ready, return appropriate fallback to prevent hydration mismatch
    if (!isClient || !ready) {
      // Return English fallback for consistency with default language
      return fallbackEn || fallbackZh
    }

    try {
      const translation = t(key)
      // If translation returns the key itself (meaning no translation found), use fallback
      if (translation === key) {
        return i18n.language === 'en' ? (fallbackEn || fallbackZh) : fallbackZh
      }
      return translation || (i18n.language === 'en' ? (fallbackEn || fallbackZh) : fallbackZh)
    } catch {
      return i18n.language === 'en' ? (fallbackEn || fallbackZh) : fallbackZh
    }
  }

  // 获取共享字段数据
  useEffect(() => {
    const fetchSharedFields = async () => {
      try {
        const response = await fetch('/api/shared-fields')
        if (response.ok) {
          const data = await response.json()
          setSharedFields({
            programTypes: data.programTypes || [],
            gradeLevels: data.gradeLevels || [],
            countries: data.countries || []
          })
        }
      } catch (error) {
        console.error('Error fetching shared fields:', error)
      }
    }

    fetchSharedFields()
  }, [])

  // 翻译字段 - 从共享字段数据中查找对应的翻译
  const translateField = (value: string, type: 'programType' | 'gradeLevel' | 'country') => {
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
    } else if (type === 'country') {
      const country = sharedFields.countries.find(c => c.name === value)
      if (country) {
        return i18n.language === 'en' && country.nameEn ? country.nameEn : country.name
      }
    }

    return value
  }

  useEffect(() => {
    fetchAllPrograms()
  }, [i18n.language])

  // 筛选逻辑
  useEffect(() => {
    applyFilters()
  }, [allPrograms, selectedTypes, selectedCountries, selectedGrades])

  // 分页逻辑
  useEffect(() => {
    const totalFilteredPrograms = filteredPrograms.length
    const pages = Math.ceil(totalFilteredPrograms / ITEMS_PER_PAGE)
    setTotalPages(pages)

    // 如果当前页超出范围，重置到第一页
    if (currentPage > pages && pages > 0) {
      setCurrentPage(1)
    }
  }, [filteredPrograms, currentPage])

  const fetchAllPrograms = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/programs?language=${i18n.language}&limit=1000`) // 获取所有项目
      if (response.ok) {
        const data = await response.json()
        setAllPrograms(data.programs)
      } else {
        setError('Failed to fetch programs')
      }
    } catch (error) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...allPrograms]

    // 按项目类型筛选
    if (selectedTypes.length > 0) {
      filtered = filtered.filter(program =>
        program.type && program.type.some(type => selectedTypes.includes(type))
      )
    }

    // 按国家筛选
    if (selectedCountries.length > 0) {
      filtered = filtered.filter(program =>
                  program.city?.country && selectedCountries.includes(program.city.country.name)
      )
    }

    // 按年级筛选 - 需要添加gradeLevel字段到接口
    if (selectedGrades.length > 0) {
      filtered = filtered.filter(program =>
        program.gradeLevel && program.gradeLevel.some(grade => selectedGrades.includes(grade))
      )
    }

    setFilteredPrograms(filtered)
    setCurrentPage(1) // 重置到第一页
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">{getText('common.loading', '加载中...', 'Loading...')}</div>
      </div>
    )
  }

  if (loading) {
    return <ProgramCardSkeleton count={6} />
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-red-500">{error}</div>
      </div>
    )
  }

  if (filteredPrograms.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">{getText('programList.noPrograms', '暂无项目', 'No programs available')}</div>
      </div>
    )
  }

  // 计算当前页的项目
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentPrograms = filteredPrograms.slice(startIndex, endIndex)

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentPrograms.map((program, index) => (
          <Link
            key={program.id}
            href={`/programs/${program.slug}`}
            className="program-card group relative bg-white rounded-xl overflow-hidden shadow-lg flex flex-col h-full min-h-[400px] border border-gray-100 card-loading"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {/* 卡片光泽效果 */}
            <div className="card-shine"></div>

            <div className="relative h-48 overflow-hidden">
              <img
                src={program.featuredImage || "/placeholder.svg"}
                alt={program.title}
                className="program-image w-full h-full object-cover"
              />

              {/* 图片遮罩层 */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              {/* 项目类型标签 */}
              <div className="absolute top-3 left-3">
                <div className="flex flex-wrap gap-1">
                  {program.type.slice(0, 2).map((type, index) => (
                    <span
                      key={index}
                      className="program-tag px-2 py-1 text-xs font-medium text-white bg-blue-600/90 backdrop-blur-sm rounded-full"
                    >
                      {translateField(type, 'programType')}
                    </span>
                  ))}
                </div>
              </div>


            </div>
            <div className="card-content p-6 flex-grow flex flex-col relative">
              {/* 装饰性渐变背景 */}
              <div className="gradient-border absolute top-0 left-0 w-full h-1"></div>

              {/* 标题 - 固定高度为2行 */}
              <h3 className="text-lg font-bold text-gray-900 mb-4 line-clamp-2 leading-tight h-[3.5rem] flex items-start group-hover:text-blue-600 transition-colors duration-300">
                {program.title}
              </h3>

              {/* 项目信息网格 */}
              <div className="space-y-3 mb-4">
                {/* 城市信息 */}
                <div className="flex items-center space-x-2">
                  <div className="info-dot w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">{getText('programList.city', '城市', 'City')}:</span>
                  <span className="text-sm font-medium text-gray-800">
                    {program.city ? (
                      i18n.language === 'en' && program.city.nameEn ? program.city.nameEn : program.city.name
                    ) : (
                      getText('programList.noCityAssigned', '未分配城市', 'No city assigned')
                    )}
                  </span>
                </div>

                {/* 时长信息 */}
                <div className="flex items-center space-x-2">
                  <div className="info-dot w-2 h-2 bg-green-500 rounded-full" style={{ animationDelay: '0.5s' }}></div>
                  <span className="text-sm text-gray-600">{getText('programList.duration', '时长', 'Duration')}:</span>
                  <span className="text-sm font-medium text-gray-800">{program.duration}</span>
                </div>
              </div>

              {/* 截止日期 - 放在底部 */}
              {program.deadline && (
                <div className="mt-auto">
                  <div className="deadline-warning bg-red-50 border border-red-200 rounded-lg p-3 flex items-center space-x-2">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <Clock className="h-4 w-4 text-red-600" />
                    </div>
                    <div>
                      <p className="text-xs text-red-600 font-medium">
                        {getText('programList.deadline', '截止日期', 'Deadline')}
                      </p>
                      <p className="text-sm font-bold text-red-700">
                        {typeof program.deadline === 'string'
                          ? program.deadline.includes('T')
                            ? program.deadline.split('T')[0]
                            : program.deadline
                          : new Date(program.deadline).toISOString().split('T')[0]
                        }
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* 查看详情按钮 */}
              <div className="mt-4">
                <div className="view-details-btn w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center py-2 rounded-lg font-medium text-sm">
                  {getText('programList.viewDetails', '查看详情', 'View Details')}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2 mt-8">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
            disabled={currentPage === 1}
            className={currentPage > 1 ? "border-blue-500 text-blue-600 hover:bg-blue-50" : ""}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <span className="text-sm text-gray-600">{getText('pagination.previous', '上一页', 'Previous')}</span>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentPage(page)}
              className={`min-w-[32px] ${
                currentPage === page
                  ? "bg-blue-600 hover:bg-blue-700 border-blue-600"
                  : "border-gray-300 hover:border-blue-500 hover:text-blue-600"
              }`}
            >
              {page}
            </Button>
          ))}

          <span className="text-sm text-gray-600">{getText('pagination.next', '下一页', 'Next')}</span>

          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
            disabled={currentPage === totalPages}
            className={currentPage < totalPages ? "border-blue-500 text-blue-600 hover:bg-blue-50" : ""}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}

export default ProgramList
