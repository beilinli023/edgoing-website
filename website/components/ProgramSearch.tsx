"use client"

import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { Checkbox } from "@/components/ui/checkbox"
import { useContent } from "@/hooks/useContent"
import { useProgramFilter } from "@/contexts/ProgramFilterContext"

interface InternationalProgram {
  id: string
  title: string
  slug: string
  type: string[]
  city?: {
    id: string
    name: string
    nameEn?: string
    country?: {
      name: string
      nameEn?: string
    }
  }
  gradeLevel: string[]
  description: string
  featuredImage?: string
  deadline?: string
  duration: string
}

const ProgramSearch = () => {
  const { t, i18n, ready } = useTranslation()
  const { getContent } = useContent()
  const {
    selectedTypes,
    selectedCountries,
    selectedGrades,
    setSelectedTypes,
    setSelectedCountries,
    setSelectedGrades
  } = useProgramFilter()
  const [programs, setPrograms] = useState<InternationalProgram[]>([])
  const [loading, setLoading] = useState(true)
  const [isClient, setIsClient] = useState(false)
  const [sharedFields, setSharedFields] = useState<any>({
    programTypes: [],
    gradeLevels: [],
    countries: [],
    cities: []
  })

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

  // 翻译字段 - 从共享字段数据中查找对应的翻译
  const translateField = (value: string, type: 'programType' | 'gradeLevel' | 'country' | 'city') => {
    if (type === 'programType') {
      const programType = sharedFields.programTypes.find((pt: any) => pt.name === value)
      if (programType) {
        return i18n.language === 'en' && programType.nameEn ? programType.nameEn : programType.name
      }
    } else if (type === 'gradeLevel') {
      const gradeLevel = sharedFields.gradeLevels.find((gl: any) => gl.name === value)
      if (gradeLevel) {
        return i18n.language === 'en' && gradeLevel.nameEn ? gradeLevel.nameEn : gradeLevel.name
      }
    } else if (type === 'country') {
      const country = sharedFields.countries.find((c: any) => c.name === value)
      if (country) {
        return i18n.language === 'en' && country.nameEn ? country.nameEn : country.name
      }
    } else if (type === 'city') {
      const city = sharedFields.cities.find((c: any) => c.name === value)
      if (city) {
        return i18n.language === 'en' && city.nameEn ? city.nameEn : city.name
      }
    }

    return value
  }

  // 获取项目数据
  const fetchPrograms = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/programs?language=${i18n.language}&limit=1000`) // 获取所有项目用于筛选
      if (response.ok) {
        const data = await response.json()
        setPrograms(data.programs)
      }
    } catch (error) {
      console.error('Failed to fetch programs:', error)
    } finally {
      setLoading(false)
    }
  }

  // 获取共享字段数据
  const fetchSharedFields = async () => {
    try {
      const response = await fetch('/api/admin/shared-fields')
      if (response.ok) {
        const data = await response.json()
        setSharedFields(data)
      }
    } catch (error) {
      console.error('Failed to fetch shared fields:', error)
    }
  }

  useEffect(() => {
    fetchPrograms()
    fetchSharedFields()
  }, [i18n.language])

  // 从实际项目数据中提取可用的筛选选项
  const getAvailableOptions = () => {
    if (loading || programs.length === 0) {
      return {
        programTypes: [],
        countries: [],
        gradeOptions: []
      }
    }

    // 提取所有项目类型
    const allTypes = new Set<string>()
    programs.forEach(program => {
      if (program.type && Array.isArray(program.type)) {
        program.type.forEach(type => allTypes.add(type))
      }
    })

    // 提取所有国家
    const allCountries = new Set<string>()
    programs.forEach(program => {
      if (program.city?.country?.name) {
        allCountries.add(program.city.country.name)
      }
    })

    // 提取所有年级水平
    const allGrades = new Set<string>()
    programs.forEach(program => {
      if (program.gradeLevel && Array.isArray(program.gradeLevel)) {
        program.gradeLevel.forEach(grade => allGrades.add(grade))
      }
    })

    return {
      programTypes: Array.from(allTypes),
      countries: Array.from(allCountries),
      gradeOptions: Array.from(allGrades)
    }
  }

  const { programTypes, countries, gradeOptions } = getAvailableOptions()

  const handleTypeChange = (type: string) => {
    setSelectedTypes(selectedTypes.includes(type) ? selectedTypes.filter((t) => t !== type) : [...selectedTypes, type])
  }

  const handleCountryChange = (country: string) => {
    setSelectedCountries(selectedCountries.includes(country) ? selectedCountries.filter((c) => c !== country) : [...selectedCountries, country])
  }

  const handleGradeChange = (grade: string) => {
    setSelectedGrades(selectedGrades.includes(grade) ? selectedGrades.filter((g) => g !== grade) : [...selectedGrades, grade])
  }

  if (loading) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <h2 className="text-lg font-bold mb-4">{getText('search.filterPrograms', '筛选项目', 'Filter Programs')}</h2>
        <div className="text-center py-8 text-gray-500">
          {getText('common.loading', '加载中...', 'Loading...')}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <h2 className="text-lg font-bold mb-4">{getText('search.filterPrograms', '筛选项目', 'Filter Programs')}</h2>

      {/* 项目类型 */}
      {programTypes.length > 0 && (
        <div className="mb-4">
          <h3 className="font-medium mb-2 text-sm">{getText('search.programType', '项目类型', 'Program Type')}</h3>
          <div className="space-y-1.5">
            {programTypes.map((type) => (
              <div key={type} className="flex items-center space-x-2">
                <Checkbox
                  id={`type-${type}`}
                  checked={selectedTypes.includes(type)}
                  onCheckedChange={() => handleTypeChange(type)}
                />
                <label htmlFor={`type-${type}`} className="text-xs cursor-pointer">
                  {translateField(type, 'programType')}
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 国家 */}
      {countries.length > 0 && (
        <div className="mb-4">
          <h3 className="font-medium mb-2 text-sm">{getText('search.country', '国家', 'Country')}</h3>
          <div className="space-y-1.5">
            {countries.map((country) => (
              <div key={country} className="flex items-center space-x-2">
                <Checkbox
                  id={`country-${country}`}
                  checked={selectedCountries.includes(country)}
                  onCheckedChange={() => handleCountryChange(country)}
                />
                <label htmlFor={`country-${country}`} className="text-xs cursor-pointer">
                  {translateField(country, 'country')}
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 年级水平 */}
      {gradeOptions.length > 0 && (
        <div className="mb-4">
          <h3 className="font-medium mb-2 text-sm">{getText('search.gradeLevel', '年级水平', 'Grade Level')}</h3>
          <div className="space-y-1.5">
            {gradeOptions.map((grade) => (
              <div key={grade} className="flex items-center space-x-2">
                <Checkbox
                  id={`grade-${grade}`}
                  checked={selectedGrades.includes(grade)}
                  onCheckedChange={() => handleGradeChange(grade)}
                />
                <label htmlFor={`grade-${grade}`} className="text-xs cursor-pointer">
                  {translateField(grade, 'gradeLevel')}
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 如果没有任何筛选选项，显示提示信息 */}
      {!loading && programTypes.length === 0 && countries.length === 0 && gradeOptions.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          {getText('search.noFiltersAvailable', '暂无可用的筛选选项', 'No filters available')}
        </div>
      )}
    </div>
  )
}

export default ProgramSearch
