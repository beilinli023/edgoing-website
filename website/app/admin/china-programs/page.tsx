"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Plus, Edit, Trash2, MapPin, Clock, Users, Calendar, ArrowLeft } from 'lucide-react'
import Image from 'next/image'
import ImageUpload, { MultiImageUpload } from '@/components/ImageUpload'
import { DarkThemeWrapper, GlassCard, DarkButton } from '@/components/admin/DarkThemeWrapper'

interface ChinaProgram {
  id: string
  title: string
  slug: string
  description: string
  city: string
  duration: string
  price?: number
  currency: string
  deadline?: string
  featuredImage?: string
  type: string[]
  gradeLevel: string[]
  sessions: string[]
  status: string
  createdAt: string
  updatedAt: string
  author: {
    name: string
    username: string
  }
  _count: {
    applications: number
  }
}

export default function ChinaProgramsPage() {
  const { t, ready } = useTranslation('common')
  const router = useRouter()
  const [programs, setPrograms] = useState<ChinaProgram[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingProgram, setEditingProgram] = useState<ChinaProgram | null>(null)
  const [language, setLanguage] = useState('zh')
  const [saving, setSaving] = useState(false)
  const [user, setUser] = useState<any>(null)

  // Shared fields data
  const [sharedFields, setSharedFields] = useState({
    programTypes: [] as any[],
    gradeLevels: [] as any[],
    countries: [] as any[],
    cities: [] as any[]
  })

  // Form data
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    country: '',
    cityId: '',
    duration: '',
    deadline: '',
    featuredImage: null as any,
    gallery: [] as any[],
    highlights: [] as string[],
    academics: [] as string[],
    itinerary: [] as string[],
    requirements: [] as string[],
    type: [] as string[],
    gradeLevel: [] as string[],
    sessions: [] as string[],
    status: 'DRAFT',
  })

  // Helper function to get translation with fallback
  const getTranslation = (key: string, fallback: string) => {
    if (!ready) return fallback
    const translation = t(key)
    return translation === key ? fallback : translation
  }

  // Helper function to get field name based on current language
  const getFieldName = (item: any) => {
    if (language === 'en' && item.nameEn) {
      return item.nameEn
    }
    return item.name
  }

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      } else {
        // Only redirect to login if authentication is not disabled
        if (process.env.NEXT_PUBLIC_DISABLE_AUTH !== 'true') {
          router.push('/admin/login')
          return
        } else {
          console.log('🔓 Authentication disabled - using development mode')
          // Set a mock user for development
          setUser({
            id: 'dev-user-id',
            email: 'dev@edgoing.com',
            username: 'developer',
            role: 'ADMIN',
            name: 'Development User'
          })
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      // Only redirect to login if authentication is not disabled
      if (process.env.NEXT_PUBLIC_DISABLE_AUTH !== 'true') {
        router.push('/admin/login')
        return
      } else {
        console.log('🔓 Authentication disabled - using development mode')
        // Set a mock user for development
        setUser({
          id: 'dev-user-id',
          email: 'dev@edgoing.com',
          username: 'developer',
          role: 'ADMIN',
          name: 'Development User'
        })
      }
    }
  }

  const fetchPrograms = async () => {
    try {
      const response = await fetch(`/api/admin/china-programs?language=${language}`)
      if (response.ok) {
        const data = await response.json()
        setPrograms(data.programs)
      } else if (response.status === 401) {
        router.push('/admin/login')
        return
      } else {
        setError('Failed to fetch programs')
      }
    } catch (error) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const fetchSharedFields = async () => {
    try {
      const response = await fetch('/api/admin/shared-fields')
      if (response.ok) {
        const data = await response.json()
        setSharedFields({
          programTypes: data.programTypes,
          gradeLevels: data.gradeLevels,
          countries: data.countries,
          cities: data.cities // 保留所有城市，稍后根据选择的国家过滤
        })
      } else if (response.status === 401) {
        router.push('/admin/login')
        return
      } else {
        console.error('Failed to fetch shared fields')
      }
    } catch (error) {
      console.error('Error fetching shared fields:', error)
    }
  }

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (user) {
      fetchPrograms()
      fetchSharedFields()
    }
  }, [language, user])

  const handleLanguageChange = async (newLanguage: string) => {
    setLanguage(newLanguage)
    setLoading(true)

    // If we're currently editing a program, reload the data for the new language
    if (editingProgram && showCreateForm) {
      try {
        const response = await fetch(`/api/admin/china-programs/${editingProgram.id}?language=${newLanguage}`)
        if (response.ok) {
          const fullProgram = await response.json()
          setFormData({
            title: fullProgram.title || '',
            slug: fullProgram.slug,
            description: fullProgram.description || '',
            country: fullProgram.country || '',
            cityId: fullProgram.cityId || '',
            duration: fullProgram.duration || '',
            deadline: fullProgram.deadline ? new Date(fullProgram.deadline).toISOString().split('T')[0] : '',
            featuredImage: fullProgram.featuredImage ? { id: 'existing', url: fullProgram.featuredImage, alt: fullProgram.title } : null,
            gallery: Array.isArray(fullProgram.gallery) ? fullProgram.gallery.map((url: string, index: number) => ({ id: `existing-${index}`, url, alt: `图片 ${index + 1}` })) : (fullProgram.gallery ? JSON.parse(fullProgram.gallery).map((url: string, index: number) => ({ id: `existing-${index}`, url, alt: `图片 ${index + 1}` })) : []),
            highlights: Array.isArray(fullProgram.highlights) ? fullProgram.highlights : (fullProgram.highlights ? JSON.parse(fullProgram.highlights) : []),
            academics: Array.isArray(fullProgram.academics) ? fullProgram.academics : (fullProgram.academics ? JSON.parse(fullProgram.academics) : []),
            itinerary: Array.isArray(fullProgram.itinerary) ? fullProgram.itinerary : (fullProgram.itinerary ? JSON.parse(fullProgram.itinerary) : []),
            requirements: Array.isArray(fullProgram.requirements) ? fullProgram.requirements : (fullProgram.requirements ? JSON.parse(fullProgram.requirements) : []),
            type: Array.isArray(fullProgram.type) ? fullProgram.type : (fullProgram.type ? JSON.parse(fullProgram.type) : []),
            gradeLevel: Array.isArray(fullProgram.gradeLevel) ? fullProgram.gradeLevel : (fullProgram.gradeLevel ? JSON.parse(fullProgram.gradeLevel) : []),
            sessions: Array.isArray(fullProgram.sessions) ? fullProgram.sessions : (fullProgram.sessions ? JSON.parse(fullProgram.sessions) : []),
            status: fullProgram.status,
          })
        }
      } catch (error) {
        console.error('Error reloading program data for new language:', error)
      }
    }

    // Reload the programs list for the new language
    fetchPrograms()
    setLoading(false)
  }

  const handleCreate = () => {
    setEditingProgram(null)
    setFormData({
      title: '',
      slug: '',
      description: '',
      country: '',
      cityId: '',
      duration: '',
      deadline: '',
      featuredImage: null,
      gallery: [],
      highlights: [],
      academics: [],
      itinerary: [],
      requirements: [],
      type: [],
      gradeLevel: [],
      sessions: [],
      status: 'DRAFT',
    })
    setShowCreateForm(true)
  }

  const handleEdit = async (program: ChinaProgram) => {
    setEditingProgram(program)

    // 获取完整的项目数据
    try {
      const response = await fetch(`/api/admin/china-programs/${program.id}?language=${language}`)
      if (response.ok) {
        const fullProgram = await response.json()
        setFormData({
          title: fullProgram.title,
          slug: fullProgram.slug,
          description: fullProgram.description,

          country: fullProgram.country || '',
          cityId: fullProgram.cityId || '',
          duration: fullProgram.duration,
          deadline: fullProgram.deadline ? new Date(fullProgram.deadline).toISOString().split('T')[0] : '',
          featuredImage: fullProgram.featuredImage ? { id: 'existing', url: fullProgram.featuredImage, alt: fullProgram.title } : null,
          gallery: Array.isArray(fullProgram.gallery) ? fullProgram.gallery.map((url: string, index: number) => ({ id: `existing-${index}`, url, alt: `图片 ${index + 1}` })) : (fullProgram.gallery ? JSON.parse(fullProgram.gallery).map((url: string, index: number) => ({ id: `existing-${index}`, url, alt: `图片 ${index + 1}` })) : []),
          highlights: Array.isArray(fullProgram.highlights) ? fullProgram.highlights : (fullProgram.highlights ? JSON.parse(fullProgram.highlights) : []),
          academics: Array.isArray(fullProgram.academics) ? fullProgram.academics : (fullProgram.academics ? JSON.parse(fullProgram.academics) : []),
          itinerary: Array.isArray(fullProgram.itinerary) ? fullProgram.itinerary : (fullProgram.itinerary ? JSON.parse(fullProgram.itinerary) : []),
          requirements: Array.isArray(fullProgram.requirements) ? fullProgram.requirements : (fullProgram.requirements ? JSON.parse(fullProgram.requirements) : []),
          type: Array.isArray(fullProgram.type) ? fullProgram.type : (fullProgram.type ? JSON.parse(fullProgram.type) : []),
          gradeLevel: Array.isArray(fullProgram.gradeLevel) ? fullProgram.gradeLevel : (fullProgram.gradeLevel ? JSON.parse(fullProgram.gradeLevel) : []),
          sessions: Array.isArray(fullProgram.sessions) ? fullProgram.sessions : (fullProgram.sessions ? JSON.parse(fullProgram.sessions) : []),

          status: fullProgram.status,
        })
      } else {
        // 如果获取失败，使用基本数据
        setFormData({
          title: program.title,
          slug: program.slug,
          description: program.description,

          country: '',
          cityId: '',
          duration: program.duration,
          deadline: program.deadline ? new Date(program.deadline).toISOString().split('T')[0] : '',
          featuredImage: program.featuredImage ? { id: 'existing', url: program.featuredImage, alt: program.title } : null,
          gallery: [],
          highlights: [],
          academics: [],
          itinerary: [],
          requirements: [],
          type: program.type || [],
          gradeLevel: program.gradeLevel || [],
          sessions: program.sessions || [],

          status: program.status,
        })
      }
    } catch (error) {
      console.error('Error fetching program details:', error)
      setError('Failed to load program details')
    }

    setShowCreateForm(true)
  }

  const resetForm = () => {
    setShowCreateForm(false)
    setEditingProgram(null)
    setFormData({
      title: '',
      slug: '',
      description: '',
      country: '',
      cityId: '',
      duration: '',
      deadline: '',
      featuredImage: null,
      gallery: [],
      highlights: [],
      academics: [],
      itinerary: [],
      requirements: [],
      type: [],
      gradeLevel: [],
      sessions: [],
      status: 'DRAFT',
    })
  }

  // 返回到项目列表，确保显示当前语言的项目列表
  const handleBackToList = async () => {
    setShowCreateForm(false)
    setEditingProgram(null)

    // 确保项目列表显示当前语言的内容
    // 重新获取当前语言的项目列表
    setLoading(true)
    await fetchPrograms()
    setLoading(false)
  }

  // 中文到拼音的简单映射（常用字符）
  const chineseToPinyin: { [key: string]: string } = {
    '马': 'ma', '来': 'lai', '西': 'xi', '亚': 'ya', '艾': 'ai', '德': 'de', '科': 'ke', '特': 'te', '学': 'xue', '校': 'xiao',
    '中': 'zhong', '国': 'guo', '创': 'chuang', '新': 'xin', '之': 'zhi', '道': 'dao', '文': 'wen', '化': 'hua', '根': 'gen', '基': 'ji',
    '到': 'dao', '数': 'shu', '字': 'zi', '未': 'wei', '北': 'bei', '京': 'jing', '上': 'shang', '海': 'hai', '深': 'shen', '圳': 'zhen',
    '广': 'guang', '州': 'zhou', '杭': 'hang', '成': 'cheng', '都': 'du', '重': 'chong', '庆': 'qing', '天': 'tian', '津': 'jin',
    '南': 'nan', '宁': 'ning', '安': 'an', '武': 'wu', '汉': 'han', '长': 'chang', '沙': 'sha', '昆': 'kun', '明': 'ming',
    '大': 'da', '连': 'lian', '青': 'qing', '岛': 'dao', '厦': 'xia', '门': 'men', '福': 'fu', '建': 'jian', '台': 'tai', '湾': 'wan',
    '香': 'xiang', '港': 'gang', '澳': 'ao', '商': 'shang', '业': 'ye', '探': 'tan', '索': 'suo', '体': 'ti', '验': 'yan',
    '项': 'xiang', '目': 'mu', '游': 'you', '历': 'li', '史': 'shi', '传': 'chuan', '统': 'tong', '现': 'xian', '代': 'dai',
    '技': 'ji', '术': 'shu', '发': 'fa', '展': 'zhan', '研': 'yan', '究': 'jiu', '教': 'jiao', '育': 'yu', '培': 'pei', '训': 'xun',
    '语': 'yu', '言': 'yan', '艺': 'yi', '音': 'yin', '乐': 'le', '美': 'mei', '食': 'shi', '旅': 'lv', '行': 'xing',
    '金': 'jin', '融': 'rong', '经': 'jing', '济': 'ji', '管': 'guan', '理': 'li', '市': 'shi', '场': 'chang', '营': 'ying', '销': 'xiao',
    '设': 'she', '计': 'ji', '工': 'gong', '程': 'cheng', '医': 'yi', '疗': 'liao', '健': 'jian', '康': 'kang', '环': 'huan', '境': 'jing',
    '保': 'bao', '护': 'hu', '可': 'ke', '持': 'chi', '续': 'xu', '能': 'neng', '源': 'yuan', '交': 'jiao', '通': 'tong', '运': 'yun', '输': 'shu'
  }

  // 生成slug的函数
  const generateSlug = (title: string) => {
    // 首先尝试将中文字符转换为拼音
    let slug = title
      .split('')
      .map(char => chineseToPinyin[char] || char)
      .join('')
      .toLowerCase()
      .trim()
      // 移除所有非英文字母、数字、空格和连字符的字符
      .replace(/[^a-z0-9\s-]/g, '')
      // 将多个空格或连字符替换为单个连字符
      .replace(/[\s-]+/g, '-')
      // 移除开头和结尾的连字符
      .replace(/^-+|-+$/g, '')

    // 如果生成的slug为空或太短，使用fallback
    if (!slug || slug.length < 2) {
      slug = 'program-' + Date.now()
    }

    return slug
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => {
      const newData = {
        ...prev,
        [field]: value
      }

      // 如果修改的是标题，自动生成slug
      if (field === 'title') {
        newData.slug = generateSlug(value)
      }

      return newData
    })
  }

  // 处理数组字段的辅助函数
  const handleArrayFieldChange = (field: string, value: string) => {
    const items = value.split('\n').filter(item => item.trim() !== '')
    setFormData(prev => ({
      ...prev,
      [field]: items
    }))
  }

  const getArrayFieldValue = (field: string) => {
    const value = formData[field as keyof typeof formData]
    return Array.isArray(value) ? value.join('\n') : ''
  }

  // 处理多选字段的辅助函数
  const handleMultiSelectChange = (field: string, selectedValues: string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: selectedValues
    }))
  }

  // 检查某个值是否被选中
  const isValueSelected = (field: string, value: string) => {
    const fieldValue = formData[field as keyof typeof formData]
    return Array.isArray(fieldValue) && fieldValue.includes(value)
  }

  // 切换选择状态
  const toggleSelection = (field: string, value: string) => {
    const currentValues = formData[field as keyof typeof formData] as string[]
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value]

    handleMultiSelectChange(field, newValues)
  }

  // 获取当前选择国家的城市列表
  const getAvailableCities = () => {
    if (!formData.country) {
      return []
    }
    return sharedFields.cities.filter((city: any) => city.countries && city.countries.name === formData.country)
  }

  // 处理国家选择变更
  const handleCountryChange = (countryName: string) => {
    setFormData(prev => ({
      ...prev,
      country: countryName,
      cityId: '' // 清空城市选择
    }))
  }

  // 处理特色图片上传
  const handleFeaturedImageUpload = (media: any) => {
    setFormData(prev => ({
      ...prev,
      featuredImage: media
    }))
  }

  // 处理特色图片移除
  const handleFeaturedImageRemove = () => {
    setFormData(prev => ({
      ...prev,
      featuredImage: null
    }))
  }

  // 处理图片画廊上传
  const handleGalleryImagesUpload = (newImages: any[]) => {
    setFormData(prev => ({
      ...prev,
      gallery: [...prev.gallery, ...newImages]
    }))
  }

  // 处理图片画廊移除
  const handleGalleryImageRemove = (index: number) => {
    setFormData(prev => ({
      ...prev,
      gallery: prev.gallery.filter((_, i) => i !== index)
    }))
  }

  // 处理更新确认
  const handleUpdateWithConfirmation = async () => {
    if (!editingProgram) return

    // 滚动到页面顶部，确保用户能看到确认弹出框
    window.scrollTo({ top: 0, behavior: 'smooth' })

    // 稍微延迟一下，让滚动动画完成
    setTimeout(() => {
      const shouldUpdate = confirm(getTranslation('admin.chinaPrograms.confirmUpdate', '确定要更新这个中国项目吗？'))
      if (shouldUpdate) {
        handleSave()
      }
    }, 300)
  }

  const handleSave = async () => {
    if (!formData.title || !formData.description || !formData.country || !formData.cityId || !formData.duration) {
      setError('Please fill in all required fields')
      return
    }

    // 确保slug存在，如果不存在或为空则生成
    let finalSlug = formData.slug
    if (!formData.slug || formData.slug.trim() === '') {
      finalSlug = generateSlug(formData.title)
      setFormData(prev => ({
        ...prev,
        slug: finalSlug
      }))
    }

    setSaving(true)
    setError('')

    try {
      const payload = {
        ...formData,
        slug: finalSlug, // 使用确保存在的slug
        featuredImage: formData.featuredImage?.url || null,
        gallery: formData.gallery.map((img: any) => img.url),
        language,
      }

      const url = editingProgram
        ? `/api/admin/china-programs/${editingProgram.id}`
        : '/api/admin/china-programs'

      const method = editingProgram ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        await response.json()
        setSuccess(editingProgram ? getTranslation('admin.chinaPrograms.updateSuccess', '中国项目更新成功！') : getTranslation('admin.chinaPrograms.createSuccess', '中国项目创建成功！'))
        setTimeout(() => setSuccess(''), 3000)

        // 如果是编辑模式，保持在编辑页面并重新加载当前语言的数据
        if (editingProgram) {
          // 重新加载当前语言的数据以确保显示最新的翻译内容
          try {
            const response = await fetch(`/api/admin/china-programs/${editingProgram.id}?language=${language}`)
            if (response.ok) {
              const data = await response.json()
              const fullProgram = data.program
              setFormData({
                title: fullProgram.title || '',
                slug: fullProgram.slug || '',
                description: fullProgram.description || '',
                country: fullProgram.country || '',
                cityId: fullProgram.cityId || '',
                duration: fullProgram.duration || '',
                deadline: fullProgram.deadline ? new Date(fullProgram.deadline).toISOString().split('T')[0] : '',
                featuredImage: fullProgram.featuredImage ? { id: 'existing', url: fullProgram.featuredImage, alt: fullProgram.title } : null,
                gallery: Array.isArray(fullProgram.gallery) ? fullProgram.gallery.map((url: string, index: number) => ({ id: `existing-${index}`, url, alt: `图片 ${index + 1}` })) : (fullProgram.gallery ? JSON.parse(fullProgram.gallery).map((url: string, index: number) => ({ id: `existing-${index}`, url, alt: `图片 ${index + 1}` })) : []),
                highlights: Array.isArray(fullProgram.highlights) ? fullProgram.highlights : (fullProgram.highlights ? JSON.parse(fullProgram.highlights) : []),
                academics: Array.isArray(fullProgram.academics) ? fullProgram.academics : (fullProgram.academics ? JSON.parse(fullProgram.academics) : []),
                itinerary: Array.isArray(fullProgram.itinerary) ? fullProgram.itinerary : (fullProgram.itinerary ? JSON.parse(fullProgram.itinerary) : []),
                requirements: Array.isArray(fullProgram.requirements) ? fullProgram.requirements : (fullProgram.requirements ? JSON.parse(fullProgram.requirements) : []),
                type: Array.isArray(fullProgram.type) ? fullProgram.type : (fullProgram.type ? JSON.parse(fullProgram.type) : []),
                gradeLevel: Array.isArray(fullProgram.gradeLevel) ? fullProgram.gradeLevel : (fullProgram.gradeLevel ? JSON.parse(fullProgram.gradeLevel) : []),
                sessions: Array.isArray(fullProgram.sessions) ? fullProgram.sessions : (fullProgram.sessions ? JSON.parse(fullProgram.sessions) : []),
                status: fullProgram.status,
              })
            }
          } catch (error) {
            console.error('Error reloading program data:', error)
          }
        } else {
          // 如果是创建模式，返回列表页面
          resetForm()
        }

        fetchPrograms()
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to save program')
      }
    } catch (error) {
      setError('Network error. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm(getTranslation('admin.chinaPrograms.confirmDelete', '确定要删除这个中国项目吗？'))) return

    try {
      const response = await fetch(`/api/admin/china-programs/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setSuccess(getTranslation('admin.chinaPrograms.deleteSuccess', '中国项目删除成功！'))
        setTimeout(() => setSuccess(''), 3000)
        fetchPrograms()
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to delete program')
      }
    } catch (error) {
      setError('Network error. Please try again.')
    }
  }

  if (loading || !ready || !user) {
    return (
      <DarkThemeWrapper
        title="游学中国项目"
        description="管理游学中国项目，包括项目详情、图片和申请管理"
        loading={true}
      >
        <div />
      </DarkThemeWrapper>
    )
  }

  return (
    <DarkThemeWrapper
      title={getTranslation('admin.chinaPrograms.title', '游学中国项目管理')}
      description={getTranslation('admin.chinaPrograms.description', '管理所有游学中国项目，包括项目信息、图片和申请管理')}
      headerActions={
        <div className="flex items-center space-x-4">
          <Select value={language} onValueChange={handleLanguageChange}>
            <SelectTrigger className="w-32 bg-white/10 border-white/20 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="zh">{getTranslation('admin.chinaPrograms.chinese', '中文')}</SelectItem>
              <SelectItem value="en">{getTranslation('admin.chinaPrograms.english', 'English')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      }
    >
      <div className="space-y-6">
        {error && (
          <div className="bg-red-500/20 border border-red-500/30 text-red-200 px-4 py-3 rounded-lg mb-6 backdrop-blur-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-500/20 border border-green-500/30 text-green-200 px-4 py-3 rounded-lg mb-6 backdrop-blur-sm">
            {success}
          </div>
        )}

        {/* 项目列表 */}
        {!showCreateForm && (
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold text-white">{getTranslation('admin.chinaPrograms.title', '游学中国项目管理')}</h3>
                <p className="text-slate-300">{getTranslation('admin.chinaPrograms.description', '管理所有游学中国项目，包括项目信息、图片和申请管理')}</p>
              </div>
              <DarkButton onClick={handleCreate} variant="primary">
                <Plus className="w-4 h-4 mr-2" />
                {getTranslation('admin.chinaPrograms.addProgram', '添加中国项目')}
              </DarkButton>
            </div>
            <div>
              <div className="space-y-4">
                {programs.length === 0 ? (
                  <div className="text-center py-8 text-slate-300">
                    {getTranslation('admin.chinaPrograms.noPrograms', '暂无中国项目，点击上方"添加中国项目"按钮创建第一个项目')}
                  </div>
                ) : (
                  programs.map((program) => (
                    <div key={program.id} className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          {program.featuredImage && (
                            <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                              <Image
                                src={program.featuredImage}
                                alt={program.title}
                                width={64}
                                height={64}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="font-semibold text-white">{program.title}</h3>
                              <Badge className={program.status === 'PUBLISHED' ? 'bg-green-500/20 text-green-300 border-green-500/30' : 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'}>
                                {program.status === 'PUBLISHED' ? getTranslation('admin.chinaPrograms.published', '已发布') : getTranslation('admin.chinaPrograms.draft', '草稿')}
                              </Badge>
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-slate-300 mb-2">
                              <div className="flex items-center">
                                <MapPin className="w-4 h-4 mr-1" />
                                {program.city ? getFieldName(program.city) : 'No city assigned'}
                              </div>
                              <div className="flex items-center">
                                <Clock className="w-4 h-4 mr-1" />
                                {program.duration}
                              </div>
                              <div className="flex items-center">
                                <Users className="w-4 h-4 mr-1" />
                                {program._count.applications} 申请
                              </div>
                              {program.deadline && (
                                <div className="flex items-center">
                                  <Calendar className="w-4 h-4 mr-1" />
                                  截止: {typeof program.deadline === 'string'
                                    ? program.deadline.includes('T')
                                      ? program.deadline.split('T')[0]
                                      : program.deadline
                                    : new Date(program.deadline).toISOString().split('T')[0]
                                  }
                                </div>
                              )}
                            </div>
                            <p className="text-sm text-slate-400 line-clamp-2">{program.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <DarkButton
                            variant="secondary"
                            size="sm"
                            onClick={() => handleEdit(program)}
                            title={getTranslation('admin.chinaPrograms.edit', '编辑')}
                          >
                            <Edit className="w-4 h-4" />
                          </DarkButton>
                          <DarkButton
                            variant="danger"
                            size="sm"
                            onClick={() => handleDelete(program.id)}
                            title={getTranslation('admin.chinaPrograms.delete', '删除')}
                          >
                            <Trash2 className="w-4 h-4" />
                          </DarkButton>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </GlassCard>
        )}

          {/* 创建/编辑表单 */}
          {showCreateForm && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleBackToList}
                      className="flex items-center space-x-1"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>{getTranslation('admin.chinaPrograms.backToList', '返回游学中国项目列表')}</span>
                    </Button>
                    <span>{editingProgram ? getTranslation('admin.chinaPrograms.editProgram', '编辑中国项目') : getTranslation('admin.chinaPrograms.createProgram', '添加中国项目')}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {editingProgram && (
                      <Button
                        onClick={handleUpdateWithConfirmation}
                        disabled={saving || !formData.title || !formData.description || !formData.country || !formData.cityId || !formData.duration}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        {saving ? getTranslation('admin.chinaPrograms.saving', '保存中...') : getTranslation('admin.chinaPrograms.update', '更新')}
                      </Button>
                    )}
                    <Button variant="outline" onClick={resetForm}>
                      {getTranslation('admin.chinaPrograms.cancel', '取消')}
                    </Button>
                  </div>
                </CardTitle>
                <CardDescription>
                  {editingProgram ? getTranslation('admin.chinaPrograms.editProgram', '编辑中国项目') : getTranslation('admin.chinaPrograms.createProgram', '添加中国项目')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      {getTranslation('admin.chinaPrograms.programTitle', '项目标题')} <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder={getTranslation('admin.chinaPrograms.placeholders.programTitle', '请输入项目标题')}
                    />
                    {formData.slug && (
                      <p className="text-xs text-gray-500">
                        项目链接将自动生成为: <code className="bg-gray-100 px-1 rounded">{formData.slug}</code>
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      {getTranslation('admin.chinaPrograms.programDescription', '项目描述')} <span className="text-red-500">*</span>
                    </label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={5}
                      placeholder={getTranslation('admin.chinaPrograms.placeholders.programDescription', '请输入项目描述...')}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        {getTranslation('admin.chinaPrograms.country', '国家')} <span className="text-red-500">*</span>
                      </label>
                      <Select value={formData.country} onValueChange={handleCountryChange}>
                        <SelectTrigger>
                          <SelectValue placeholder={getTranslation('admin.chinaPrograms.placeholders.country', '请选择国家')} />
                        </SelectTrigger>
                        <SelectContent>
                          {sharedFields.countries.map((country) => (
                            <SelectItem key={country.id} value={country.name}>
                              {getFieldName(country)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        {getTranslation('admin.chinaPrograms.city', '城市')} <span className="text-red-500">*</span>
                      </label>
                      <Select
                        value={formData.cityId}
                        onValueChange={(value) => handleInputChange('cityId', value)}
                        disabled={!formData.country}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={
                            formData.country
                              ? getTranslation('admin.chinaPrograms.placeholders.city', '请选择城市')
                              : getTranslation('admin.chinaPrograms.placeholders.selectCountryFirst', '请先选择国家')
                          } />
                        </SelectTrigger>
                        <SelectContent>
                          {getAvailableCities().map((city) => (
                            <SelectItem key={city.id} value={city.id}>
                              {getFieldName(city)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        {getTranslation('admin.chinaPrograms.duration', '项目时长')} <span className="text-red-500">*</span>
                      </label>
                      <Input
                        value={formData.duration}
                        onChange={(e) => handleInputChange('duration', e.target.value)}
                        placeholder={getTranslation('admin.chinaPrograms.placeholders.duration', '如：2周；14天')}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        {getTranslation('admin.chinaPrograms.deadline', '申请截止日期')}
                      </label>
                      <Input
                        type="date"
                        value={formData.deadline}
                        onChange={(e) => handleInputChange('deadline', e.target.value)}
                      />
                    </div>
                  </div>









                  {/* 特色图片上传 */}
                  <ImageUpload
                    label={getTranslation('admin.chinaPrograms.featuredImage', '特色图片')}
                    onImageUploaded={handleFeaturedImageUpload}
                    currentImage={formData.featuredImage}
                    onImageRemoved={handleFeaturedImageRemove}
                  />

                  {/* 图片画廊上传 */}
                  <MultiImageUpload
                    label={getTranslation('admin.chinaPrograms.gallery', '图片画廊')}
                    onImagesUploaded={handleGalleryImagesUpload}
                    currentImages={formData.gallery}
                    onImageRemoved={handleGalleryImageRemove}
                    maxImages={10}
                  />

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      {getTranslation('admin.chinaPrograms.type', '项目类型')}
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 border rounded-lg">
                      {sharedFields.programTypes.map((type) => (
                        <div key={type.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`type-${type.id}`}
                            checked={isValueSelected('type', type.name)}
                            onCheckedChange={() => toggleSelection('type', type.name)}
                          />
                          <label
                            htmlFor={`type-${type.id}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                          >
                            {getFieldName(type)}
                          </label>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500">选择适用的项目类型</p>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      {getTranslation('admin.chinaPrograms.gradeLevel', '适合年级')}
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 border rounded-lg">
                      {sharedFields.gradeLevels.map((level) => (
                        <div key={level.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`grade-${level.id}`}
                            checked={isValueSelected('gradeLevel', level.name)}
                            onCheckedChange={() => toggleSelection('gradeLevel', level.name)}
                          />
                          <label
                            htmlFor={`grade-${level.id}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                          >
                            {getFieldName(level)}
                          </label>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500">选择适合的年级</p>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      {getTranslation('admin.chinaPrograms.sessions', '营期安排')}
                    </label>
                    <Textarea
                      value={getArrayFieldValue('sessions')}
                      onChange={(e) => handleArrayFieldChange('sessions', e.target.value)}
                      rows={5}
                      placeholder={getTranslation('admin.chinaPrograms.placeholders.sessions', '如：2025年7月10日 - 7月19日\n2025年8月10日 - 8月19日')}
                    />
                    <p className="text-xs text-gray-500">每行输入一个营期</p>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      {getTranslation('admin.chinaPrograms.highlights', '亮点 (Highlights)')}
                    </label>
                    <Textarea
                      value={getArrayFieldValue('highlights')}
                      onChange={(e) => handleArrayFieldChange('highlights', e.target.value)}
                      rows={6}
                      placeholder={getTranslation('admin.chinaPrograms.placeholders.highlights', '如：参观华为、腾讯总部\n深圳科技园区实地考察\n与科技从业者交流')}
                    />
                    <p className="text-xs text-gray-500">每行输入一个亮点</p>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      {getTranslation('admin.chinaPrograms.academics', '学术 (Academics)')}
                    </label>
                    <Textarea
                      value={getArrayFieldValue('academics')}
                      onChange={(e) => handleArrayFieldChange('academics', e.target.value)}
                      rows={6}
                      placeholder={getTranslation('admin.chinaPrograms.placeholders.academics', '如：中国科技发展史\n人工智能应用案例\n5G技术发展')}
                    />
                    <p className="text-xs text-gray-500">每行输入一个学术模块</p>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      {getTranslation('admin.chinaPrograms.itinerary', '行程 (Itinerary)')}
                    </label>
                    <Textarea
                      value={getArrayFieldValue('itinerary')}
                      onChange={(e) => handleArrayFieldChange('itinerary', e.target.value)}
                      rows={6}
                      placeholder={getTranslation('admin.chinaPrograms.placeholders.itinerary', '如：第1-2天：深圳科技发展概览\n第3-4天：华为参访体验')}
                    />
                    <p className="text-xs text-gray-500">每行输入一个行程安排</p>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      {getTranslation('admin.chinaPrograms.requirements', '申请 (Admission)')}
                    </label>
                    <Textarea
                      value={getArrayFieldValue('requirements')}
                      onChange={(e) => handleArrayFieldChange('requirements', e.target.value)}
                      rows={5}
                      placeholder={getTranslation('admin.chinaPrograms.placeholders.requirements', '如：年龄16-24岁\n理工科背景优先\n对科技创新有浓厚兴趣')}
                    />
                    <p className="text-xs text-gray-500">每行输入一个申请要求</p>
                  </div>





                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">{getTranslation('admin.chinaPrograms.status', '状态')}</label>
                      <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PUBLISHED">{getTranslation('admin.chinaPrograms.published', '已发布')}</SelectItem>
                          <SelectItem value="DRAFT">{getTranslation('admin.chinaPrograms.draft', '草稿')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4">
                    <Button variant="outline" onClick={resetForm}>
                      {getTranslation('admin.chinaPrograms.cancel', '取消')}
                    </Button>
                    <Button
                      onClick={editingProgram ? handleUpdateWithConfirmation : handleSave}
                      disabled={saving || !formData.title || !formData.description || !formData.country || !formData.cityId || !formData.duration}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {saving ? getTranslation('admin.chinaPrograms.saving', '保存中...') : (editingProgram ? getTranslation('admin.chinaPrograms.update', '更新') : getTranslation('admin.chinaPrograms.create', '创建'))}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
        )}
      </div>
    </DarkThemeWrapper>
  )
}
