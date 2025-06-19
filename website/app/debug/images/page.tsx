"use client"

import { useState, useEffect } from 'react'
import SafeImage from '@/components/SafeImage'

interface DebugData {
  stats: any
  blogs: any[]
  mediaFiles: any[]
  issues: any
}

/**
 * 🔍 图片调试页面
 * 
 * 用于诊断博客图片显示问题
 */
export default function ImageDebugPage() {
  const [debugData, setDebugData] = useState<DebugData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchDebugData = async () => {
      try {
        const response = await fetch('/api/debug/blogs')
        if (response.ok) {
          const data = await response.json()
          setDebugData(data)
        } else {
          setError('Failed to fetch debug data')
        }
      } catch (error) {
        setError('Network error')
      } finally {
        setLoading(false)
      }
    }

    fetchDebugData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">图片调试页面</h1>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-300 rounded w-1/4 mb-4"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-1/3"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">图片调试页面</h1>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!debugData) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">图片调试页面</h1>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <p className="text-yellow-600">无调试数据</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🔍 图片调试页面</h1>

        {/* 统计信息 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-2">总博客数</h3>
            <p className="text-3xl font-bold text-blue-600">{debugData.stats.totalBlogs}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-2">有封面图</h3>
            <p className="text-3xl font-bold text-green-600">{debugData.stats.blogsWithImages}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-2">有轮播图</h3>
            <p className="text-3xl font-bold text-purple-600">{debugData.stats.blogsWithCarousels}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-2">无图片</h3>
            <p className="text-3xl font-bold text-red-600">{debugData.stats.blogsWithoutImages}</p>
          </div>
        </div>

        {/* 问题列表 */}
        {(debugData.issues.missingImageIds.length > 0 || debugData.issues.emptyImageUrls.length > 0) && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-red-800 mb-4">🚨 发现的问题</h2>
            
            {debugData.issues.missingImageIds.length > 0 && (
              <div className="mb-4">
                <h3 className="font-semibold text-red-700 mb-2">缺失的图片文件:</h3>
                <ul className="list-disc list-inside text-red-600">
                  {debugData.issues.missingImageIds.map((issue: any, index: number) => (
                    <li key={index}>
                      博客 "{issue.title}" (ID: {issue.blogId}) 的图片 {issue.imageId} 不存在
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {debugData.issues.emptyImageUrls.length > 0 && (
              <div>
                <h3 className="font-semibold text-red-700 mb-2">空的图片URL:</h3>
                <ul className="list-disc list-inside text-red-600">
                  {debugData.issues.emptyImageUrls.map((issue: any, index: number) => (
                    <li key={index}>
                      媒体文件 {issue.filename} (ID: {issue.mediaId}) 的URL为空
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* 博客列表 */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">📝 博客图片详情</h2>
          <div className="space-y-4">
            {debugData.blogs.map((blog: any) => (
              <div key={blog.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-32 h-24">
                    {blog.hasMainImage ? (
                      <SafeImage
                        src={blog.mainImage.url}
                        alt={blog.mainImage.alt || blog.title}
                        width={128}
                        height={96}
                        className="w-full h-full object-cover rounded"
                        placeholderText="加载中"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center">
                        <span className="text-gray-500 text-xs">无图片</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">{blog.title}</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p><strong>状态:</strong> {blog.status}</p>
                        <p><strong>图片ID:</strong> {blog.imageId || '无'}</p>
                        <p><strong>有封面图:</strong> {blog.hasMainImage ? '是' : '否'}</p>
                      </div>
                      <div>
                        <p><strong>轮播图数量:</strong> {blog.carouselCount}</p>
                        {blog.hasMainImage && (
                          <>
                            <p><strong>图片URL:</strong> <code className="text-xs bg-gray-100 px-1 rounded">{blog.mainImage.url}</code></p>
                            <p><strong>文件大小:</strong> {Math.round(blog.mainImage.size / 1024)}KB</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 媒体文件列表 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">🖼️ 媒体文件</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left">预览</th>
                  <th className="px-4 py-2 text-left">文件名</th>
                  <th className="px-4 py-2 text-left">URL</th>
                  <th className="px-4 py-2 text-left">类型</th>
                  <th className="px-4 py-2 text-left">大小</th>
                </tr>
              </thead>
              <tbody>
                {debugData.mediaFiles.map((media: any) => (
                  <tr key={media.id} className="border-t">
                    <td className="px-4 py-2">
                      <div className="w-16 h-12">
                        <SafeImage
                          src={media.url}
                          alt={media.filename}
                          width={64}
                          height={48}
                          className="w-full h-full object-cover rounded"
                          placeholderText="预览"
                        />
                      </div>
                    </td>
                    <td className="px-4 py-2 text-sm">{media.filename}</td>
                    <td className="px-4 py-2 text-xs">
                      <code className="bg-gray-100 px-1 rounded">{media.url}</code>
                    </td>
                    <td className="px-4 py-2 text-sm">{media.mimeType}</td>
                    <td className="px-4 py-2 text-sm">{Math.round(media.size / 1024)}KB</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
