"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Footer from "@/components/Footer"
import Image from "next/image"
import { CalendarDays, User, ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react"
import { useTranslation } from "react-i18next"
import { useContent } from "@/hooks/useContent"
import { Button } from "@/components/ui/button"
import SafeImage from "@/components/SafeImage"

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
  publishedAt?: string
}

// 轮播图组件
const ImageCarousel: React.FC<{ images: Array<{ id: string; url: string; alt?: string }> }> = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0)

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  if (!images || images.length === 0) {
    // 占位符轮播图
    return (
      <div className="relative w-full h-[400px] bg-gray-200 rounded-lg overflow-hidden mb-8">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-300 rounded-lg flex items-center justify-center">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-sm">轮播图占位符</p>
            <p className="text-xs text-gray-400">可在CMS中上传多张图片</p>
          </div>
        </div>

        {/* 轮播控制按钮 */}
        <button className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all duration-200 opacity-50">
          <ChevronLeft className="w-6 h-6 text-gray-600" />
        </button>
        <button className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all duration-200 opacity-50">
          <ChevronRight className="w-6 h-6 text-gray-600" />
        </button>
      </div>
    )
  }

  return (
    <div className="relative w-full h-[400px] rounded-lg overflow-hidden mb-8">
      <SafeImage
        src={images[currentIndex].url}
        alt={images[currentIndex].alt || `轮播图 ${currentIndex + 1}`}
        fill
        className="w-full h-full"
        placeholderText="博客图片"
      />

      {/* 轮播控制按钮 */}
      {images.length > 1 && (
        <>
          <button
            onClick={prevImage}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all duration-200"
          >
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          </button>
          <button
            onClick={nextImage}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all duration-200"
          >
            <ChevronRight className="w-6 h-6 text-gray-600" />
          </button>

          {/* 指示器 */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  index === currentIndex ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

const BlogContent: React.FC<{ blog: Blog }> = ({ blog }) => {
  const { i18n } = useTranslation()
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const formatDate = (dateString: string) => {
    if (!isClient) {
      // 服务器端渲染时返回简单格式，避免水合错误
      return dateString.split('T')[0]
    }

    const date = new Date(dateString)
    const language = i18n.language || 'zh'

    // 使用更简单的格式化方式，避免本地化差异导致的水合错误
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()

    if (language === 'en') {
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December']
      return `${monthNames[date.getMonth()]} ${day}, ${year}`
    } else {
      return `${year}年${month}月${day}日`
    }
  }

  // 将纯文本内容转换为HTML格式，实现所见即所得的效果
  const formatContent = (content: string) => {
    if (!content) return ''

    // 处理内容，保持原有的换行和空行格式
    return content
      .split('\n\n') // 双换行符分隔段落
      .map(paragraph => {
        const trimmedParagraph = paragraph.trim()
        if (!trimmedParagraph) {
          // 空段落转换为空行
          return '<div class="h-4"></div>'
        }
        // 段落内的单换行符转换为<br>，保持原有换行
        return `<p class="mb-4 leading-relaxed">${trimmedParagraph.replace(/\n/g, '<br>')}</p>`
      })
      .join('') // 不添加额外间距，由CSS控制
  }

  // 准备轮播图数据
  const carouselImages = blog.carouselImages && blog.carouselImages.length > 0
    ? blog.carouselImages.map(item => item.media)
    : blog.image
      ? [blog.image]
      : []

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-8 md:px-12 lg:px-20 xl:px-24 2xl:px-32 py-8">
        {/* 返回按钮 */}
        <Button
          variant="ghost"
          onClick={() => router.push('/blog')}
          className="mb-6 text-gray-600 hover:text-gray-900 p-0 h-auto font-normal"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回博客列表
        </Button>

        {/* 标题 */}
        <h1 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900 leading-tight">
          {blog.title}
        </h1>

        {/* 博客元信息 */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-8">
          <div className="flex items-center">
            <User className="w-4 h-4 mr-1" />
            <span>{blog.author}</span>
          </div>
          <div className="flex items-center">
            <CalendarDays className="w-4 h-4 mr-1" />
            <span>{formatDate(blog.publishedAt || blog.createdAt)}</span>
          </div>
          <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
            {blog.program}
          </div>
        </div>

        {/* 轮播图 */}
        <ImageCarousel images={carouselImages} />

        {/* 博客内容 */}
        <div
          className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-blue-600 prose-strong:text-gray-900"
          dangerouslySetInnerHTML={{ __html: formatContent(blog.content) }}
        />
      </div>
    </div>
  )
}

export default function BlogPage() {
  const params = useParams()
  const { i18n } = useTranslation()
  const { getContent } = useContent()
  const [blog, setBlog] = useState<Blog | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const slug = params.id as string

  const getText = (key: string, fallbackZh: string, fallbackEn: string) => {
    // 优先从数据库获取内容，如果没有则使用 i18n
    const dbContent = getContent(key)
    if (dbContent) return dbContent

    return i18n.language === 'en' ? fallbackEn : fallbackZh
  }

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setLoading(true)
        const language = i18n.language || 'zh'
        const response = await fetch(`/api/blogs/${slug}?language=${language}`)

        if (response.ok) {
          const data = await response.json()
          setBlog(data.blog)
        } else if (response.status === 404) {
          setError('Blog not found')
        } else {
          setError('Failed to fetch blog')
        }
      } catch (error) {
        setError('Network error')
      } finally {
        setLoading(false)
      }
    }

    if (slug) {
      fetchBlog()
    }
  }, [slug, i18n.language])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">
          {/* 避免水合错误，使用骨架屏而不是文本 */}
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400"></div>
            <div className="h-4 bg-gray-300 rounded w-16 animate-pulse"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {getText('blog.notFound', '博客未找到', 'Blog Not Found')}
          </h1>
          <p className="text-gray-600">
            {getText('blog.notFoundDesc', '抱歉，您要查找的博客文章不存在。', 'Sorry, the blog article you are looking for does not exist.')}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow">
        <BlogContent blog={blog} />
      </main>
      <Footer />
    </div>
  )
}
