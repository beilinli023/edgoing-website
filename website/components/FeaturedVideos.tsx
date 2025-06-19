"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Play, ArrowRight } from "lucide-react"
import { useTranslation } from "react-i18next"
import { useContent } from "@/hooks/useContent"

interface Video {
  id: string
  slug: string
  title: string
  description: string
  category: string
  thumbnail: string | null
  videoUrl: string | null
  order: number
  createdAt: string
}

const FeaturedVideos = () => {
  const { i18n } = useTranslation()
  const { getContent } = useContent()
  const [videos, setVideos] = useState<Video[]>([])
  const [totalVideos, setTotalVideos] = useState(0)
  const [loading, setLoading] = useState(true)

  const getText = (key: string, zhText: string, enText?: string) => {
    return getContent(key, zhText, enText || zhText)
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
        // 获取前3个视频用于显示
        const response = await fetch(`/api/videos?language=${i18n.language}&limit=3`)
        if (response.ok) {
          const data = await response.json()
          setVideos(data.videos || [])
          setTotalVideos(data.pagination?.total || 0)
        } else {
          console.error('Failed to fetch videos')
          setVideos([])
          setTotalVideos(0)
        }
      } catch (error) {
        console.error('Error fetching videos:', error)
        setVideos([])
        setTotalVideos(0)
      } finally {
        setLoading(false)
      }
    }

    fetchVideos()
  }, [i18n.language])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">{getText('common.loading', '加载中...', 'Loading...')}</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 精选视频标题 */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {getText('videos.featured.title', '精选视频', 'Featured Videos')}
        </h2>
      </div>

      {/* 视频网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {videos.map((video) => (
          <div
            key={video.id}
            onClick={() => handleVideoClick(video)}
            className="rounded-lg overflow-hidden transition-all duration-200 cursor-pointer group"
          >
            {/* 视频缩略图 */}
            <div className="relative w-full aspect-[12/5]">
              {video.thumbnail ? (
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <Play className="w-10 h-10 text-gray-400" />
                </div>
              )}
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

      {/* 查看更多链接 - 只有超过3个视频时才显示 */}
      {totalVideos > 3 && (
        <div className="flex justify-center mt-8">
          <Link
            href="/videos"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
          >
            {getText('videos.viewMore', '查看更多视频', 'View More Videos')}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>
      )}
    </div>
  )
}

export default FeaturedVideos
