"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import Footer from "@/components/Footer"
import { useTranslation } from "react-i18next"
import { useContent } from "@/hooks/useContent"
import { Play, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

// 动态导入组件，禁用SSR
const PageHero = dynamic(() => import("@/components/PageHero"), {
  ssr: false,
  loading: () => (
    <div className="relative h-[400px] w-full overflow-hidden bg-gray-200">
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4 md:px-8 max-w-4xl mx-auto">
        <div className="h-12 bg-gray-300 rounded w-64 mb-4 animate-pulse"></div>
        <div className="h-6 bg-gray-300 rounded w-96 animate-pulse"></div>
      </div>
    </div>
  )
})

interface Video {
  id: string
  title: string
  description: string
  thumbnail: string
  videoUrl: string
  category: string
}

const ITEMS_PER_PAGE = 9

export default function VideosPage() {
  const { t, ready, i18n } = useTranslation()
  const { getContent } = useContent()
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)

  const getText = (key: string, fallbackZh: string, fallbackEn: string) => {
    const dbContent = getContent(key)
    if (dbContent) return dbContent

    if (!ready) {
      return i18n.language === 'en' ? fallbackEn : fallbackZh
    }

    try {
      const translation = t(key)
      if (translation && translation !== key) return translation
    } catch {
      // Fallback to provided fallbacks
    }

    return i18n.language === 'en' ? fallbackEn : fallbackZh
  }

  const handleVideoClick = (video: Video) => {
    if (video.videoUrl) {
      // 在新标签页中打开视频链接
      window.open(video.videoUrl, '_blank', 'noopener,noreferrer')
    } else {
      console.warn('Video URL not available for:', video.title)
    }
  }

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true)
        // 从CMS视频库获取数据
        const response = await fetch(`/api/videos?language=${i18n.language}&page=${currentPage}&limit=${ITEMS_PER_PAGE}`)
        if (response.ok) {
          const data = await response.json()
          setVideos(data.videos || [])
          setTotalPages(data.pagination?.pages || 0)
        } else {
          console.error('Failed to fetch videos')
          setVideos([])
        }
      } catch (error) {
        console.error('Error fetching videos:', error)
        setVideos([])
      } finally {
        setLoading(false)
      }
    }

    fetchVideos()
  }, [i18n.language, currentPage])

  // 视频数据已经是当前页的数据，不需要再次切片
  const currentVideos = videos

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

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PageHero
        title={getText("videos.hero.title", "精选视频", "Featured Videos")}
        description={getText("videos.hero.description", "观看我们的教育项目和文化交流精彩视频，了解学生们的真实体验和收获。", "Watch our exciting videos of educational programs and cultural exchanges, learn about students' real experiences and achievements.")}
        backgroundImage="/uploads/1749482112471-c1mnfqm9tyq.jpg"
      />
      <main className="flex-grow">
        <div className="container mx-auto px-8 md:px-12 lg:px-16 xl:px-20 py-16 space-y-6">
          {/* 精选视频标题 */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {getText('videos.featured.title', '精选视频', 'Featured Videos')}
            </h2>
          </div>

          {/* 视频网格 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentVideos.map((video) => (
              <div
                key={video.id}
                onClick={() => handleVideoClick(video)}
                className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group"
              >
                {/* 视频缩略图 */}
                <div className="relative w-full aspect-[12/5]">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                  {/* 播放按钮覆盖层 */}
                  <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center group-hover:bg-opacity-40 transition-all duration-200">
                    <div className="w-10 h-10 bg-white bg-opacity-90 rounded-full flex items-center justify-center group-hover:bg-opacity-100 transition-all duration-200">
                      <Play className="w-3.5 h-3.5 text-gray-800 ml-0.5" fill="currentColor" />
                    </div>
                  </div>
                </div>

                {/* 视频信息 */}
                <div className="p-3">
                  <div className="mb-2">
                    <span className="inline-block bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs font-medium">
                      {video.category}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2">
                    {video.title}
                  </h3>
                  <p className="text-gray-600 text-xs line-clamp-2">
                    {video.description}
                  </p>
                </div>
              </div>
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
                className={`flex items-center space-x-1 ${
                  currentPage < totalPages
                    ? "bg-blue-600 hover:bg-blue-700 border-blue-600 text-white"
                    : "border-gray-300 text-gray-600"
                }`}
              >
                <span className="text-sm">{getText('pagination.next', '下一页', 'Next')}</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
