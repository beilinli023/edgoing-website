"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Edit, Trash2, Quote, Eye, ArrowLeft } from 'lucide-react'
import ImageUpload from '@/components/ImageUpload'
import Image from 'next/image'
import { useTranslation } from 'react-i18next'
import { DarkThemeWrapper, NotificationMessage, GlassCard, DarkButton } from '@/components/admin/DarkThemeWrapper'

interface Testimonial {
  id: string
  content: string
  author: string
  role: string
  program: string
  status: string
  language: string
  order: number
  media?: {
    id: string
    url: string
    alt?: string
  }
  users: {
    id: string
    name: string
    username: string
  }
  testimonial_translations?: Array<{
    id: string
    language: string
    content: string
    author: string
    role: string
    program: string
  }>
  createdAt: string
  updatedAt: string
}



export default function TestimonialsPage() {
  const { t, i18n, ready } = useTranslation('common')



  // Helper function to get translation with fallback
  const getTranslation = (key: string, fallback: string) => {
    if (!ready) return fallback
    const translation = t(key)
    return translation === key ? fallback : translation
  }
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [settings, setSettings] = useState<any[]>([])
  const [language, setLanguage] = useState('zh')
  const [activeTab, setActiveTab] = useState('zh') // 控制编辑表单中的标签页
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null)

  const [formData, setFormData] = useState({
    content: '',
    author: '',
    role: '',
    program: '',
    status: 'PUBLISHED',
    order: 0,
    imageId: '',
    translations: {
      en: {
        content: '',
        author: '',
        role: '',
        program: '',
      },
      zh: {
        content: '',
        author: '',
        role: '',
        program: '',
      }
    }
  })

  const [selectedImage, setSelectedImage] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    fetchData()
  }, [language])

  useEffect(() => {
    // Ensure i18n language is set correctly
    if (ready && i18n.language !== language) {
      i18n.changeLanguage(language)
    }
  }, [ready, language, i18n])

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage)
    setActiveTab(newLanguage) // 同步更新编辑表单中的标签页
    i18n.changeLanguage(newLanguage)
  }

  const fetchData = async () => {
    try {
      // 获取数据库中的学员故事
      const testimonialsResponse = await fetch(`/api/admin/testimonials?language=${language}`)
      if (testimonialsResponse.ok) {
        const testimonialsData = await testimonialsResponse.json()
        setTestimonials(testimonialsData.testimonials)
      } else if (testimonialsResponse.status === 401) {
        router.push('/admin/login')
      } else {
        setError('Failed to fetch testimonials')
      }
    } catch (error) {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (key: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleTranslationChange = (lang: string, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      translations: {
        ...prev.translations,
        [lang]: {
          ...prev.translations[lang as keyof typeof prev.translations],
          [field]: value
        }
      }
    }))
  }



  const resetForm = () => {
    setFormData({
      content: '',
      author: '',
      role: '',
      program: '',
      status: 'PUBLISHED',
      order: 0,
      imageId: '',
      translations: {
        en: {
          content: '',
          author: '',
          role: '',
          program: '',
        },
        zh: {
          content: '',
          author: '',
          role: '',
          program: '',
        }
      }
    })
    setSelectedImage(null)
    setEditingTestimonial(null)
    setShowCreateForm(false)
    setActiveTab(language) // 重置标签页到当前语言
  }

  const handleCreate = () => {
    resetForm()
    setShowCreateForm(true)
    setActiveTab(language) // 设置标签页到当前语言
  }

  const handleEdit = (testimonial: Testimonial) => {
    // 准备翻译数据
    const translations = {
      en: {
        content: '',
        author: '',
        role: '',
        program: '',
      },
      zh: {
        content: '',
        author: '',
        role: '',
        program: '',
      }
    }

    // 根据API返回的数据结构填入翻译数据
    if (testimonial.language === 'en') {
      // 如果当前显示的是英文内容，说明主内容是英文，翻译是中文
      translations.en = {
        content: testimonial.content,
        author: testimonial.author,
        role: testimonial.role,
        program: testimonial.program,
      }

      // 从testimonial_translations数组中找到中文翻译
      const zhTranslation = testimonial.testimonial_translations?.find(t => t.language === 'zh')
      if (zhTranslation) {
        translations.zh = {
          content: zhTranslation.content,
          author: zhTranslation.author,
          role: zhTranslation.role,
          program: zhTranslation.program,
        }
      }
    } else {
      // 如果当前显示的是中文内容，说明主内容是中文，翻译是英文
      translations.zh = {
        content: testimonial.content,
        author: testimonial.author,
        role: testimonial.role,
        program: testimonial.program,
      }

      // 从testimonial_translations数组中找到英文翻译
      const enTranslation = testimonial.testimonial_translations?.find(t => t.language === 'en')
      if (enTranslation) {
        translations.en = {
          content: enTranslation.content,
          author: enTranslation.author,
          role: enTranslation.role,
          program: enTranslation.program,
        }
      }
    }

    setFormData({
      content: translations.zh.content, // 使用中文内容作为主内容
      author: translations.zh.author,
      role: translations.zh.role,
      program: translations.zh.program,
      status: testimonial.status,
      order: testimonial.order,
      imageId: testimonial.media?.id || '',
      translations,
    })
    setSelectedImage(testimonial.media || null)
    setEditingTestimonial(testimonial)
    setShowCreateForm(true)
    setActiveTab(language) // 设置标签页到当前语言
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      // 准备翻译数据
      const translations = []

      // 添加所有有内容的翻译
      if (formData.translations.en.content) {
        translations.push({
          language: 'en',
          content: formData.translations.en.content,
          author: formData.translations.en.author,
          role: formData.translations.en.role,
          program: formData.translations.en.program,
        })
      }

      if (formData.translations.zh.content) {
        translations.push({
          language: 'zh',
          content: formData.translations.zh.content,
          author: formData.translations.zh.author,
          role: formData.translations.zh.role,
          program: formData.translations.zh.program,
        })
      }

      // 总是使用中文内容作为主记录
      const payload = {
        content: formData.translations.zh.content || formData.content,
        author: formData.translations.zh.author || formData.author,
        role: formData.translations.zh.role || formData.role,
        program: formData.translations.zh.program || formData.program,
        status: formData.status,
        order: formData.order,
        imageId: selectedImage?.id || null,
        language: 'zh', // 总是保存为中文主记录
        translations: translations.filter(t => t.language !== 'zh'), // 只保存英文翻译
      }

      const url = editingTestimonial
        ? `/api/admin/testimonials/${editingTestimonial.id}`
        : '/api/admin/testimonials'

      const method = editingTestimonial ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        const result = await response.json()
        setSuccess(editingTestimonial ? getTranslation('admin.testimonials.updateSuccess', '学员故事更新成功！') : getTranslation('admin.testimonials.createSuccess', '学员故事创建成功！'))
        setTimeout(() => setSuccess(''), 3000)
        resetForm()
        fetchData()
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to save testimonial')
      }
    } catch (error) {
      setError('Network error. Please try again.')
    } finally {
      setSaving(false)
    }
  }



  const handleDelete = async (id: string) => {
    if (!confirm(getTranslation('admin.testimonials.confirmDelete', '确定要删除这个学员故事吗？'))) return

    try {
      const response = await fetch(`/api/admin/testimonials/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setSuccess(getTranslation('admin.testimonials.deleteSuccess', '学员故事删除成功！'))
        setTimeout(() => setSuccess(''), 3000)
        fetchData()
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to delete testimonial')
      }
    } catch (error) {
      setError('Network error. Please try again.')
    }
  }

  const handleImageUploaded = (media: any) => {
    setSelectedImage(media)
  }

  const handleImageRemoved = () => {
    setSelectedImage(null)
  }







  const headerActions = (
    <>
              <Select value={language} onValueChange={handleLanguageChange}>
        <SelectTrigger className="w-32 bg-white/10 border-white/20 text-white backdrop-blur-sm">
                  <SelectValue />
                </SelectTrigger>
        <SelectContent className="bg-slate-800 border-slate-600">
          <SelectItem value="zh" className="text-white hover:bg-slate-700">{getTranslation('admin.testimonials.chinese', '中文')}</SelectItem>
          <SelectItem value="en" className="text-white hover:bg-slate-700">{getTranslation('admin.testimonials.english', 'English')}</SelectItem>
                </SelectContent>
              </Select>
    </>
  )

  return (
    <DarkThemeWrapper
      title={getTranslation('admin.testimonials.title', '👥 学员故事库')}
      description={getTranslation('admin.testimonials.description', '管理所有学员故事，支持图片上传和多语言内容')}
      loading={loading || !ready}
      headerActions={headerActions}
    >
          {error && (
          <NotificationMessage type="error" message={error} onClose={() => setError('')} />
          )}

          {success && (
          <NotificationMessage type="success" message={success} onClose={() => setSuccess('')} />
          )}

          {/* 学员故事库管理 */}
          {!showCreateForm && (
          <GlassCard className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent mb-2">
                  📚 学员故事库
                </h2>
                <p className="text-slate-300">
                  {getTranslation('admin.testimonials.description', '管理所有学员故事，支持图片上传和多语言内容')}
                </p>
              </div>
              <DarkButton variant="primary" onClick={handleCreate}>
                    <Plus className="w-4 h-4 mr-2" />
                    {getTranslation('admin.testimonials.addStory', '添加学员故事')}
              </DarkButton>
            </div>
                <div className="space-y-4">
                  {testimonials.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center border border-white/20">
                    <Quote className="h-10 w-10 text-white/60" />
                  </div>
                  <p className="text-slate-300 mb-6 text-lg">
                      {getTranslation('admin.testimonials.noStories', '暂无学员故事，点击上方"添加学员故事"按钮创建第一个故事')}
                  </p>
                    </div>
                  ) : (
                    testimonials.map((testimonial) => (
                  <div key={testimonial.id} className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 hover:-translate-y-1">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4 flex-1">
                            {testimonial.media && (
                          <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border border-white/20">
                                <Image
                                  src={testimonial.media.url}
                                  alt={testimonial.media.alt || testimonial.author}
                                  width={64}
                                  height={64}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3 mb-3">
                            <h3 className="font-semibold text-white text-lg">{testimonial.author}</h3>
                            <div className={`px-3 py-1 rounded-full text-sm font-medium border ${
                              testimonial.status === 'PUBLISHED' 
                                ? 'bg-green-500/20 border-green-400/30 text-green-200' 
                                : 'bg-gray-500/20 border-gray-400/30 text-gray-300'
                            }`}>
                              {testimonial.status === 'PUBLISHED' ? '✅ 已发布' : '📝 草稿'}
                            </div>
                              </div>
                          <p className="text-slate-300 mb-2">
                            <span className="text-blue-300 font-medium">身份：</span>{testimonial.role} · 
                            <span className="text-purple-300 font-medium ml-2">项目：</span>{testimonial.program}
                          </p>
                          <p className="text-slate-400 line-clamp-2">{testimonial.content}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                        <DarkButton
                          variant="secondary"
                              size="sm"
                              onClick={() => handleEdit(testimonial)}
                            >
                              <Edit className="w-4 h-4" />
                        </DarkButton>
                        <DarkButton
                          variant="danger"
                              size="sm"
                              onClick={() => handleDelete(testimonial.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                        </DarkButton>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
          </GlassCard>
          )}



          {/* 创建/编辑表单 */}
          {showCreateForm && (
          <GlassCard className="p-8">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={resetForm}
                      className="flex items-center space-x-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>{getTranslation('admin.testimonials.backToList', '返回学员故事列表')}</span>
                    </Button>
                    <span>{editingTestimonial ? getTranslation('admin.testimonials.editStory', '编辑学员故事') : getTranslation('admin.testimonials.createStory', '添加学员故事')}</span>
                  </div>
                  <Button variant="outline" onClick={resetForm}>
                    {getTranslation('admin.testimonials.cancel', '取消')}
                  </Button>
                </CardTitle>
                <CardDescription>
                  {editingTestimonial ? getTranslation('admin.testimonials.editStory', '编辑学员故事') : getTranslation('admin.testimonials.createStory', '添加学员故事')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="zh">中文内容</TabsTrigger>
                      <TabsTrigger value="en">English Content</TabsTrigger>
                    </TabsList>

                    <TabsContent value="zh" className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            学员姓名 <span className="text-red-500">*</span>
                          </label>
                          <Input
                            value={formData.translations.zh.author}
                            onChange={(e) => handleTranslationChange('zh', 'author', e.target.value)}
                            placeholder="请输入学员姓名"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            学员身份 <span className="text-red-500">*</span>
                          </label>
                          <Input
                            value={formData.translations.zh.role}
                            onChange={(e) => handleTranslationChange('zh', 'role', e.target.value)}
                            placeholder="如：高中生、大学生、学生家长等"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          参与项目 <span className="text-red-500">*</span>
                        </label>
                        <Input
                          value={formData.translations.zh.program}
                          onChange={(e) => handleTranslationChange('zh', 'program', e.target.value)}
                          placeholder="请输入项目名称"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          学员故事 <span className="text-red-500">*</span>
                        </label>
                        <Textarea
                          value={formData.translations.zh.content}
                          onChange={(e) => handleTranslationChange('zh', 'content', e.target.value)}
                          rows={4}
                          placeholder="请输入学员的故事或感言..."
                        />
                      </div>
                    </TabsContent>

                    <TabsContent value="en" className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Student Name
                          </label>
                          <Input
                            value={formData.translations.en.author}
                            onChange={(e) => handleTranslationChange('en', 'author', e.target.value)}
                            placeholder="Enter student name"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Student Role
                          </label>
                          <Input
                            value={formData.translations.en.role}
                            onChange={(e) => handleTranslationChange('en', 'role', e.target.value)}
                            placeholder="e.g., High School Student, Parent, etc."
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Program Participated
                        </label>
                        <Input
                          value={formData.translations.en.program}
                          onChange={(e) => handleTranslationChange('en', 'program', e.target.value)}
                          placeholder="Enter program name"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Student Story
                        </label>
                        <Textarea
                          value={formData.translations.en.content}
                          onChange={(e) => handleTranslationChange('en', 'content', e.target.value)}
                          rows={4}
                          placeholder="Enter student's story or testimonial..."
                        />
                      </div>
                    </TabsContent>
                  </Tabs>

                  <ImageUpload
                    onImageUploaded={handleImageUploaded}
                    currentImage={selectedImage}
                    onImageRemoved={handleImageRemoved}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">{getTranslation('admin.testimonials.status', '状态')}</label>
                      <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PUBLISHED">{getTranslation('admin.testimonials.published', '已发布')}</SelectItem>
                          <SelectItem value="DRAFT">{getTranslation('admin.testimonials.draft', '草稿')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">{getTranslation('admin.testimonials.order', '排序')}</label>
                      <Input
                        type="number"
                        value={formData.order}
                        onChange={(e) => handleInputChange('order', parseInt(e.target.value) || 0)}
                        placeholder={getTranslation('admin.testimonials.placeholders.order', '数字越小排序越靠前')}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4">
                    <Button variant="outline" onClick={resetForm}>
                      {getTranslation('admin.testimonials.cancel', '取消')}
                    </Button>
                    <Button
                      onClick={handleSave}
                      disabled={saving || (!formData.translations.zh.content && !formData.translations.en.content) || (!formData.translations.zh.author && !formData.translations.en.author)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {saving ? getTranslation('admin.testimonials.saving', '保存中...') : (editingTestimonial ? getTranslation('admin.testimonials.update', '更新') : getTranslation('admin.testimonials.create', '创建'))}
                    </Button>
                  </div>
                </div>
              </CardContent>
          </GlassCard>
          )}
      </DarkThemeWrapper>
  )
}
