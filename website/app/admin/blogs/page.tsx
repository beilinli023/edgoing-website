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
import { Plus, Edit, Trash2, BookOpen, ArrowLeft } from 'lucide-react'
import { DarkThemeWrapper, GlassCard, DarkButton } from '@/components/admin/DarkThemeWrapper'
import ImageUpload from '@/components/ImageUpload'
import MultiImageUpload from '@/components/MultiImageUpload'
import Image from 'next/image'
import { useTranslation } from 'react-i18next'

interface Blog {
  id: string
  title: string
  slug: string
  content: string
  author: string
  program: string
  grade: string
  status: string
  language: string
  order: number
  image?: {
    id: string
    url: string
    alt?: string
  }
  carouselImages?: Array<{
    id: string
    order: number
    media: {
      id: string
      url: string
      alt?: string
      filename: string
    }
  }>
  authorUser: {
    id: string
    name: string
    username: string
  }
  translations?: Array<{
    id: string
    language: string
    title: string
    slug: string
    content: string
    author: string
    program: string
    grade: string
  }>
  createdAt: string
  updatedAt: string
}

export default function BlogsPage() {
  const { t, i18n, ready } = useTranslation('common')

  // Helper function to get translation with fallback
  const getTranslation = (key: string, fallback: string) => {
    if (!ready) return fallback
    const translation = t(key)
    return translation === key ? fallback : translation
  }

  const [blogs, setBlogs] = useState<Blog[]>([])
  const language = 'zh' // 🔧 固定为中文，移除语言切换功能
  const [activeTab, setActiveTab] = useState('zh') // 控制编辑表单中的标签页
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null)

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    author: '',
    program: '',
    grade: '',
    status: 'PUBLISHED',
    order: 0,
    imageId: '' as string | null,
    carouselImageIds: [] as string[],
    translations: {
      en: {
        title: '',
        slug: '',
        content: '',
        author: '',
        program: '',
        grade: '',
      },
      zh: {
        title: '',
        slug: '',
        content: '',
        author: '',
        program: '',
        grade: '',
      }
    }
  })

  const [selectedImage, setSelectedImage] = useState<any>(null)
  const [selectedCarouselImages, setSelectedCarouselImages] = useState<any[]>([])
  const router = useRouter()

  // 内容格式化预览函数
  const formatContentPreview = (content: string) => {
    if (!content) return ''

    return content
      .split('\n\n') // 双换行符分隔段落
      .map(paragraph => {
        const trimmedParagraph = paragraph.trim()
        if (!trimmedParagraph) {
          return '<div class="h-4"></div>'
        }
        return `<p class="mb-4 leading-relaxed">${trimmedParagraph.replace(/\n/g, '<br>')}</p>`
      })
      .join('')
  }

  useEffect(() => {
    fetchData()
  }, []) // 🔧 移除language依赖，因为语言已固定

  useEffect(() => {
    // 确保i18n语言设置为中文
    if (ready && i18n.language !== 'zh') {
      i18n.changeLanguage('zh')
    }
  }, [ready, i18n])

  // 🗑️ 移除语言切换处理函数，因为语言已固定为中文

  const fetchData = async () => {
    try {
      // 获取数据库中的博客（固定使用中文）
      const blogsResponse = await fetch(`/api/admin/blogs?language=zh`)
      if (blogsResponse.ok) {
        const blogsData = await blogsResponse.json()
        setBlogs(blogsData.blogs)
      } else if (blogsResponse.status === 401) {
        router.push('/admin/login')
      } else {
        setError('Failed to fetch blogs')
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

  // 生成URL slug
  const generateSlug = (title: string) => {
    if (!title || title.trim() === '') {
      return `blog-${Date.now()}`
    }

    // 中文字符转换为拼音或英文的简化处理
    // 这里使用简单的方法：移除中文字符，保留英文和数字
    let slug = title
      .toLowerCase()
      .replace(/[\u4e00-\u9fff]/g, '') // 移除中文字符
      .replace(/[^\w\s-]/g, '') // 移除其他特殊字符
      .replace(/\s+/g, '-') // 空格替换为连字符
      .replace(/-+/g, '-') // 多个连字符替换为单个
      .replace(/^-+|-+$/g, '') // 移除开头和结尾的连字符
      .trim()

    // 如果处理后的slug为空或太短，使用标题的拼音或时间戳
    if (!slug || slug.length < 2) {
      // 对于纯中文标题，使用时间戳加上简化标识
      const timestamp = Date.now()
      return `blog-${timestamp}`
    }

    return slug
  }

  // 当标题改变时自动生成slug
  const handleTitleChange = (lang: string, title: string) => {
    handleTranslationChange(lang, 'title', title)
    const slug = generateSlug(title)
    handleTranslationChange(lang, 'slug', slug)
  }

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      content: '',
      author: '',
      program: '',
      grade: '',
      status: 'PUBLISHED',
      order: 0,
      imageId: null,
      carouselImageIds: [],
      translations: {
        en: {
          title: '',
          slug: '',
          content: '',
          author: '',
          program: '',
          grade: '',
        },
        zh: {
          title: '',
          slug: '',
          content: '',
          author: '',
          program: '',
          grade: '',
        }
      }
    })
    setSelectedImage(null)
    setSelectedCarouselImages([])
    setEditingBlog(null)
    setShowCreateForm(false)
    setActiveTab('zh') // 重置标签页到中文
  }

  const handleCreate = () => {
    resetForm()
    setShowCreateForm(true)
    setActiveTab('zh') // 设置标签页到中文
  }

  const handleEdit = (blog: Blog) => {
    // 填充表单数据
    const zhTranslation = blog.translations?.find(t => t.language === 'zh')
    const enTranslation = blog.translations?.find(t => t.language === 'en')

    // 确保slug存在，如果不存在则生成
    const ensureSlug = (title: string, existingSlug?: string) => {
      if (existingSlug && existingSlug.trim() !== '') {
        return existingSlug
      }
      return generateSlug(title)
    }

    setFormData({
      title: blog.title,
      slug: blog.slug,
      content: blog.content,
      author: blog.author,
      program: blog.program,
      grade: blog.grade,
      status: blog.status,
      order: blog.order,
      imageId: blog.image?.id || '',
      carouselImageIds: blog.carouselImages?.map(img => img.media.id) || [],
      translations: {
        zh: {
          title: zhTranslation?.title || blog.title,
          slug: ensureSlug(zhTranslation?.title || blog.title, zhTranslation?.slug || blog.slug),
          content: zhTranslation?.content || blog.content,
          author: zhTranslation?.author || blog.author,
          program: zhTranslation?.program || blog.program,
          grade: zhTranslation?.grade || blog.grade,
        },
        en: {
          title: enTranslation?.title || '',
          slug: enTranslation?.title ? ensureSlug(enTranslation.title, enTranslation?.slug) : '',
          content: enTranslation?.content || '',
          author: enTranslation?.author || '',
          program: enTranslation?.program || '',
          grade: enTranslation?.grade || '',
        }
      }
    })

    setSelectedImage(blog.image || null)
    setSelectedCarouselImages(blog.carouselImages?.map(img => img.media) || [])
    setEditingBlog(blog)
    setShowCreateForm(true)
    setActiveTab('zh') // 设置标签页到中文
  }

  const handleSubmit = async () => {
    try {
      setSaving(true)
      setError('')

      // 验证必填字段
      const zhData = formData.translations.zh
      const enData = formData.translations.en

      if (!zhData.title || !zhData.content || !zhData.author || !zhData.program || !zhData.grade) {
        setError('请填写中文标题、内容、作者、项目和级别')
        return
      }

      // 确保slug存在
      const ensureSlugForSubmit = (title: string, existingSlug: string) => {
        if (existingSlug && existingSlug.trim() !== '') {
          return existingSlug
        }
        return generateSlug(title)
      }

      const zhSlug = ensureSlugForSubmit(zhData.title, zhData.slug)
      const enSlug = enData.title ? ensureSlugForSubmit(enData.title, enData.slug) : ''

      // 准备提交数据
      const submitData = {
        title: zhData.title,
        slug: zhSlug,
        content: zhData.content,
        author: zhData.author,
        program: zhData.program,
        grade: zhData.grade,
        status: formData.status,
        order: formData.order,
        imageId: formData.imageId || null,
        carouselImageIds: formData.carouselImageIds,
        translations: [
          {
            language: 'zh',
            title: zhData.title,
            slug: zhSlug,
            content: zhData.content,
            author: zhData.author,
            program: zhData.program,
            grade: zhData.grade,
          },
          ...(enData.title && enData.content && enData.author && enData.program && enData.grade ? [{
            language: 'en',
            title: enData.title,
            slug: enSlug,
            content: enData.content,
            author: enData.author,
            program: enData.program,
            grade: enData.grade,
          }] : [])
        ]
      }

      const url = editingBlog ? `/api/admin/blogs/${editingBlog.id}` : '/api/admin/blogs'
      const method = editingBlog ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      })

      if (response.ok) {
        setSuccess(editingBlog ? '博客更新成功！' : '博客创建成功！')
        resetForm()
        fetchData()
      } else {
        const errorData = await response.json()
        setError(errorData.error || '操作失败')
      }
    } catch (error) {
      setError('网络错误，请重试')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这篇博客吗？此操作不可撤销。')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/blogs/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setSuccess('博客删除成功！')
        fetchData()
      } else {
        setError('删除失败')
      }
    } catch (error) {
      setError('网络错误，请重试')
    }
  }

  if (loading || !ready) {
    return (
      <DarkThemeWrapper
        title="博客库"
        description="管理所有博客文章，支持图片上传和多语言内容"
        loading={true}
      >
        <div />
      </DarkThemeWrapper>
    )
  }

  return (
    <DarkThemeWrapper
      title={getTranslation('admin.blogs.title', '博客库')}
      description={getTranslation('admin.blogs.description', '管理所有博客文章，支持图片上传和多语言内容')}
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

        {/* 博客库管理 */}
        {!showCreateForm && (
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold text-white">{getTranslation('admin.blogs.title', '博客库')}</h3>
                <p className="text-slate-300">{getTranslation('admin.blogs.description', '管理所有博客文章，支持图片上传和多语言内容')}</p>
              </div>
              <DarkButton onClick={handleCreate} variant="primary">
                <Plus className="w-4 h-4 mr-2" />
                {getTranslation('admin.blogs.addBlog', '添加博客')}
              </DarkButton>
            </div>
            <div>
              <div className="space-y-4">
                {blogs.length === 0 ? (
                  <div className="text-center py-8 text-slate-300">
                    {getTranslation('admin.blogs.noBlogs', '暂无博客文章，点击上方"添加博客"按钮创建第一篇文章')}
                  </div>
                ) : (
                  blogs.map((blog) => (
                    <div key={blog.id} className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          {blog.image && (
                            <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                              <Image
                                src={blog.image.url}
                                alt={blog.image.alt || blog.title}
                                width={64}
                                height={64}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="font-semibold text-white">{blog.title}</h3>
                              <Badge className={blog.status === 'PUBLISHED' ? 'bg-green-500/20 text-green-300 border-green-500/30' : 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'}>
                                {blog.status === 'PUBLISHED' ? getTranslation('admin.blogs.published', '已发布') : getTranslation('admin.blogs.draft', '草稿')}
                              </Badge>
                            </div>
                            <div className="text-sm text-slate-300 mb-2 space-y-1">
                              <p><span className="font-medium">作者:</span> {blog.author}</p>
                              <p><span className="font-medium">项目:</span> {blog.program}</p>
                              <p><span className="font-medium">级别:</span> {blog.grade}</p>
                            </div>
                            <p className="text-sm text-slate-400 line-clamp-2">{blog.content}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <DarkButton
                            variant="secondary"
                            size="sm"
                            onClick={() => handleEdit(blog)}
                            title={getTranslation('admin.blogs.edit', '编辑')}
                          >
                            <Edit className="w-4 h-4" />
                          </DarkButton>
                          <DarkButton
                            variant="danger"
                            size="sm"
                            onClick={() => handleDelete(blog.id)}
                            title={getTranslation('admin.blogs.delete', '删除')}
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

        {/* 创建/编辑博客表单 */}
        {showCreateForm && (
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <DarkButton
                  variant="secondary"
                  size="sm"
                  onClick={resetForm}
                  className="flex items-center space-x-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{getTranslation('admin.blogs.backToList', '返回博客列表')}</span>
                </DarkButton>
                <h3 className="text-xl font-semibold text-white">{editingBlog ? getTranslation('admin.blogs.editBlog', '编辑博客') : getTranslation('admin.blogs.createBlog', '添加博客')}</h3>
              </div>
              <DarkButton variant="secondary" onClick={resetForm}>
                {getTranslation('admin.blogs.cancel', '取消')}
              </DarkButton>
            </div>
            <div>
              <div className="space-y-6">
                {/* 封面照片上传 */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    {getTranslation('admin.blogs.coverImage', '封面照片')}
                  </label>
                  <ImageUpload
                    onImageUploaded={(image) => {
                      setSelectedImage(image)
                      setFormData(prev => ({ ...prev, imageId: image.id }))
                    }}
                    currentImage={selectedImage}
                    onImageRemoved={() => {
                      setSelectedImage(null)
                      setFormData(prev => ({ ...prev, imageId: null }))
                    }}
                  />
                </div>

                {/* 轮播图上传 */}
                <div>
                  <MultiImageUpload
                    onImagesSelect={(images) => {
                      setSelectedCarouselImages(images)
                      setFormData(prev => ({
                        ...prev,
                        carouselImageIds: images.map(img => img.id)
                      }))
                    }}
                    selectedImages={selectedCarouselImages}
                    maxImages={10}
                    label={getTranslation('admin.blogs.carouselImages', '轮播图')}
                    description={getTranslation('admin.blogs.carouselDescription', '拖拽图片到此处，或点击选择文件')}
                  />
                </div>

                {/* 基本信息 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      {getTranslation('admin.blogs.status', '状态')}
                    </label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => handleInputChange('status', value)}
                    >
                      <SelectTrigger className="bg-white/10 border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PUBLISHED">{getTranslation('admin.blogs.published', '已发布')}</SelectItem>
                        <SelectItem value="DRAFT">{getTranslation('admin.blogs.draft', '草稿')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      {getTranslation('admin.blogs.order', '排序')}
                    </label>
                    <Input
                      type="number"
                      value={formData.order}
                      onChange={(e) => handleInputChange('order', parseInt(e.target.value) || 0)}
                      placeholder="0"
                      className="h-12 bg-white/10 border-white/20 text-white placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {/* 多语言内容 */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-white/10">
                    <TabsTrigger value="zh" className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-slate-300">中文内容</TabsTrigger>
                    <TabsTrigger value="en" className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-slate-300">English Content</TabsTrigger>
                  </TabsList>

                  <TabsContent value="zh" className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        标题 *
                      </label>
                      <Input
                        value={formData.translations.zh.title}
                        onChange={(e) => handleTitleChange('zh', e.target.value)}
                        placeholder="请输入博客标题"
                        className="h-12 bg-white/10 border-white/20 text-white placeholder:text-slate-400"
                      />
                    </div>

                    {/* URL Slug 自动生成，不显示输入框 */}
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        URL Slug (自动生成)
                      </label>
                      <div className="h-12 px-3 py-2 border border-white/20 rounded-md bg-white/5 flex items-center text-slate-300">
                        {formData.translations.zh.slug || '将根据标题自动生成'}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        作者 *
                      </label>
                      <Input
                        value={formData.translations.zh.author}
                        onChange={(e) => handleTranslationChange('zh', 'author', e.target.value)}
                        placeholder="请输入作者姓名"
                        className="h-12 bg-white/10 border-white/20 text-white placeholder:text-slate-400"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        项目 *
                      </label>
                      <Input
                        value={formData.translations.zh.program}
                        onChange={(e) => handleTranslationChange('zh', 'program', e.target.value)}
                        placeholder="请输入项目名称"
                        className="h-12 bg-white/10 border-white/20 text-white placeholder:text-slate-400"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        级别 *
                      </label>
                      <Input
                        value={formData.translations.zh.grade}
                        onChange={(e) => handleTranslationChange('zh', 'grade', e.target.value)}
                        placeholder="请输入级别"
                        className="h-12 bg-white/10 border-white/20 text-white placeholder:text-slate-400"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        内容 *
                        <span className="text-xs text-slate-400 ml-2">
                          (提示：单次回车=换行，双次回车=段落分隔)
                        </span>
                      </label>
                      <Textarea
                        value={formData.translations.zh.content}
                        onChange={(e) => handleTranslationChange('zh', 'content', e.target.value)}
                        placeholder="请输入博客内容&#10;&#10;示例：&#10;这是第一段内容。&#10;&#10;这是第二段内容，中间有空行分隔。&#10;这是第二段的第二行。"
                        rows={12}
                        className="resize-none font-mono text-sm leading-relaxed bg-white/10 border-white/20 text-white placeholder:text-slate-400"
                        style={{ whiteSpace: 'pre-wrap' }}
                      />
                      <div className="text-xs text-slate-400 mt-1">
                        所见即所得：您在此处的换行和空行将在前端网站中保持相同格式
                      </div>
                      {/* 内容预览 */}
                      {formData.translations.zh.content && (
                        <div className="mt-4 p-4 border border-white/20 rounded-lg bg-white/5">
                          <div className="text-sm font-medium text-white mb-2">预览效果：</div>
                          <div
                            className="prose prose-sm max-w-none prose-headings:text-white prose-p:text-slate-300 prose-a:text-blue-400 prose-strong:text-white"
                            dangerouslySetInnerHTML={{ __html: formatContentPreview(formData.translations.zh.content) }}
                          />
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="en" className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Title *
                      </label>
                      <Input
                        value={formData.translations.en.title}
                        onChange={(e) => handleTitleChange('en', e.target.value)}
                        placeholder="Enter blog title"
                        className="h-12 bg-white/10 border-white/20 text-white placeholder:text-slate-400"
                      />
                    </div>

                    {/* URL Slug 自动生成，不显示输入框 */}
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        URL Slug (Auto-generated)
                      </label>
                      <div className="h-12 px-3 py-2 border border-white/20 rounded-md bg-white/5 flex items-center text-slate-300">
                        {formData.translations.en.slug || 'Will be generated from title'}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Author *
                      </label>
                      <Input
                        value={formData.translations.en.author}
                        onChange={(e) => handleTranslationChange('en', 'author', e.target.value)}
                        placeholder="Enter author name"
                        className="h-12 bg-white/10 border-white/20 text-white placeholder:text-slate-400"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Program *
                      </label>
                      <Input
                        value={formData.translations.en.program}
                        onChange={(e) => handleTranslationChange('en', 'program', e.target.value)}
                        placeholder="Enter program name"
                        className="h-12 bg-white/10 border-white/20 text-white placeholder:text-slate-400"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Grade *
                      </label>
                      <Input
                        value={formData.translations.en.grade}
                        onChange={(e) => handleTranslationChange('en', 'grade', e.target.value)}
                        placeholder="Enter grade level"
                        className="h-12 bg-white/10 border-white/20 text-white placeholder:text-slate-400"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Content *
                        <span className="text-xs text-slate-400 ml-2">
                          (Tip: Single Enter = Line break, Double Enter = Paragraph break)
                        </span>
                      </label>
                      <Textarea
                        value={formData.translations.en.content}
                        onChange={(e) => handleTranslationChange('en', 'content', e.target.value)}
                        placeholder="Enter blog content&#10;&#10;Example:&#10;This is the first paragraph.&#10;&#10;This is the second paragraph with empty line separation.&#10;This is the second line of the second paragraph."
                        rows={12}
                        className="resize-none font-mono text-sm leading-relaxed bg-white/10 border-white/20 text-white placeholder:text-slate-400"
                        style={{ whiteSpace: 'pre-wrap' }}
                      />
                      <div className="text-xs text-slate-400 mt-1">
                        WYSIWYG: Line breaks and empty lines here will maintain the same format on the frontend website
                      </div>
                      {/* 内容预览 */}
                      {formData.translations.en.content && (
                        <div className="mt-4 p-4 border border-white/20 rounded-lg bg-white/5">
                          <div className="text-sm font-medium text-white mb-2">Preview:</div>
                          <div
                            className="prose prose-sm max-w-none prose-headings:text-white prose-p:text-slate-300 prose-a:text-blue-400 prose-strong:text-white"
                            dangerouslySetInnerHTML={{ __html: formatContentPreview(formData.translations.en.content) }}
                          />
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>

                {/* 提交按钮 */}
                <div className="flex justify-end space-x-4">
                  <DarkButton variant="secondary" onClick={resetForm}>
                    {getTranslation('admin.blogs.cancel', '取消')}
                  </DarkButton>
                  <DarkButton
                    onClick={handleSubmit}
                    disabled={saving}
                    variant="primary"
                  >
                    {saving ? getTranslation('admin.blogs.saving', '保存中...') : (editingBlog ? getTranslation('admin.blogs.update', '更新') : getTranslation('admin.blogs.create', '创建'))}
                  </DarkButton>
                </div>
              </div>
            </div>
          </GlassCard>
        )}
      </div>
    </DarkThemeWrapper>
  )
}
