"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight, User } from "lucide-react"
import { Button } from "./ui/button"
import { useTranslation } from "react-i18next"
import { useContent } from "@/hooks/useContent"
import SafeText from "@/components/SafeText"
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

const ITEMS_PER_PAGE = 6

const BlogList = () => {
  const { t, i18n, ready } = useTranslation()
  const { getContent } = useContent()
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const getText = (key: string, fallbackZh: string, fallbackEn: string) => {
    // 优先从数据库获取内容，如果没有则使用 i18n
    const dbContent = getContent(key)
    if (dbContent) return dbContent

    if (!ready) return i18n.language === 'en' ? fallbackEn : fallbackZh
    try {
      const translation = t(key)
      if (translation && translation !== key) return translation
    } catch {
      // Fallback to provided fallbacks
    }

    return i18n.language === 'en' ? fallbackEn : fallbackZh
  }

  const fetchBlogs = async () => {
    try {
      setLoading(true)
      const language = i18n.language || 'zh'

      console.log('Fetching blogs with language:', language)

      // 创建一个公共API来获取已发布的博客
      const url = `/api/blogs?language=${language}&status=PUBLISHED&page=${currentPage}&limit=${ITEMS_PER_PAGE}`
      console.log('API URL:', url)

      const response = await fetch(url)
      console.log('Response status:', response.status)

      if (response.ok) {
        const data = await response.json()
        setBlogs(data.blogs || [])
        setTotalPages(data.pagination?.pages || 1)
      } else {
        const errorText = await response.text()
        console.error('API error:', response.status, errorText)
        setError(`Failed to fetch blogs: ${response.status}`)
      }
    } catch (error) {
      console.error('Network error:', error)
      setError('Network error: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBlogs()
  }, [i18n.language, currentPage])

  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
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

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-red-500">{error}</div>
      </div>
    )
  }

  if (blogs.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">{getText('blog.noBlogs', '暂无博客文章', 'No blog articles available')}</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 博客文章标题 */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          <SafeText
            i18nKey="blog.articles.title"
            fallbackZh="博客文章"
            fallbackEn="Blog Articles"
            skeletonWidth="w-24"
          />
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {blogs.map((blog) => (
          <Link
            key={blog.id}
            href={`/blog/${blog.slug}`}
            className="rounded-lg overflow-hidden transition-all duration-200 flex flex-col h-full"
          >
            <div className="relative h-40">
              <SafeImage
                src={blog.image?.url}
                alt={blog.image?.alt || blog.title}
                fill
                className="w-full h-full"
                placeholderText="封面图片"
              />
            </div>
            <div className="p-3 flex-grow flex flex-col">
              {/* 标题 */}
              <h3 className="text-base font-semibold text-gray-900 mb-2 line-clamp-2 leading-tight">
                {blog.title}
              </h3>

              {/* 底部信息 - 作者和项目 */}
              <div className="mt-auto space-y-1.5">
                <div className="flex items-center text-sm text-gray-600">
                  <User className="w-3.5 h-3.5 mr-1" />
                  <span className="text-xs">{blog.author}</span>
                </div>

                <div className="text-sm">
                  <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs font-medium">
                    {blog.program}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* 分页 */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="flex items-center space-x-1"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="text-sm text-gray-600">{getText('pagination.previous', '上一页', 'Previous')}</span>
          </Button>

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

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="flex items-center space-x-1"
          >
            <span className="text-sm text-gray-600">{getText('pagination.next', '下一页', 'Next')}</span>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  )
}

export default BlogList
