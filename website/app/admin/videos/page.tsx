"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Edit, Trash2, Search, Eye, EyeOff, ArrowLeft, Upload, Link as LinkIcon, Play } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import ImageUpload from '@/components/ImageUpload'
import VideoUpload from '@/components/VideoUpload'

interface Video {
  id: string
  slug: string
  categoryZh: string
  categoryEn: string
  titleZh: string
  titleEn: string
  descriptionZh: string
  descriptionEn: string
  thumbnailId?: string
  media?: {
    id: string
    url: string
    alt?: string
    filename: string
    mimeType: string
    size: number
  }
  videoFile?: string
  videoUrl?: string
  isPublished: boolean
  order: number
  createdAt: string
  users: {
    id: string
    name: string
    username: string
  }
}

interface FormData {
  categoryZh: string
  categoryEn: string
  titleZh: string
  titleEn: string
  descriptionZh: string
  descriptionEn: string
  thumbnailId: string | null
  videoFile: string
  videoUrl: string
  isPublished: boolean
  order: number
}

const initialFormData: FormData = {
  categoryZh: '',
  categoryEn: '',
  titleZh: '',
  titleEn: '',
  descriptionZh: '',
  descriptionEn: '',
  thumbnailId: null,
  videoFile: '',
  videoUrl: '',
  isPublished: false,
  order: 0
}

export default function VideosPage() {
  const router = useRouter()
  const { t, i18n } = useTranslation()
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentLanguage, setCurrentLanguage] = useState<'zh' | 'en'>('zh')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingVideo, setEditingVideo] = useState<Video | null>(null)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [selectedThumbnail, setSelectedThumbnail] = useState<any>(null)
  const [submitting, setSubmitting] = useState(false)
  const [videoSource, setVideoSource] = useState<'upload' | 'url'>('url')

  const getTranslation = (key: string, zhText: string, enText?: string) => {
    if (i18n.language === 'en' && enText) {
      return enText
    }
    return zhText
  }

  useEffect(() => {
    fetchVideos()
  }, [currentLanguage, searchTerm])

  const fetchVideos = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        language: currentLanguage,
        ...(searchTerm && { search: searchTerm })
      })

      const response = await fetch(`/api/admin/videos?${params}`)
      if (response.ok) {
        const data = await response.json()
        setVideos(data.videos)
      }
    } catch (error) {
      console.error('Failed to fetch videos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateVideo = () => {
    setEditingVideo(null)
    setFormData(initialFormData)
    setSelectedThumbnail(null)
    setVideoSource('url')
    setIsDialogOpen(true)
  }

  const handleEditVideo = (video: Video) => {
    setEditingVideo(video)
    setFormData({
      categoryZh: video.categoryZh,
      categoryEn: video.categoryEn,
      titleZh: video.titleZh,
      titleEn: video.titleEn,
      descriptionZh: video.descriptionZh,
      descriptionEn: video.descriptionEn,
      thumbnailId: video.media?.id || null,
      videoFile: video.videoFile || '',
      videoUrl: video.videoUrl || '',
      isPublished: video.isPublished,
      order: video.order
    })
    setSelectedThumbnail(video.media || null)
    setVideoSource(video.videoFile ? 'upload' : 'url')
    setIsDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // 验证必填字段
    const requiredFields = [
      { field: 'categoryZh', name: '视频类型（中文）' },
      { field: 'categoryEn', name: '视频类型（英文）' },
      { field: 'titleZh', name: '视频标题（中文）' },
      { field: 'titleEn', name: '视频标题（英文）' },
      { field: 'descriptionZh', name: '视频简介（中文）' },
      { field: 'descriptionEn', name: '视频简介（英文）' }
    ]

    const missingFields = requiredFields.filter(({ field }) => !formData[field as keyof FormData])

    if (missingFields.length > 0) {
      const missingFieldNames = missingFields.map(({ name }) => name).join('、')
      alert(`请填写以下必填字段：${missingFieldNames}`)
      return
    }

    // 验证视频源
    if (!formData.videoFile && !formData.videoUrl) {
      alert('请上传视频文件或输入视频链接')
      return
    }

    setSubmitting(true)

    try {
      const url = editingVideo
        ? `/api/admin/videos/${editingVideo.id}`
        : '/api/admin/videos'

      const method = editingVideo ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setIsDialogOpen(false)
        fetchVideos()
        setFormData(initialFormData)
        setSelectedThumbnail(null)
      } else {
        const error = await response.json()
        alert(error.error || '保存视频失败')
      }
    } catch (error) {
      console.error('Failed to save video:', error)
      alert('保存视频失败')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteVideo = async (video: Video) => {
    if (!confirm(getTranslation('admin.videos.confirmDelete', '确定要删除这个视频吗？', 'Are you sure you want to delete this video?'))) {
      return
    }

    try {
      const response = await fetch(`/api/admin/videos/${video.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchVideos()
      } else {
        alert('Failed to delete video')
      }
    } catch (error) {
      console.error('Failed to delete video:', error)
      alert('Failed to delete video')
    }
  }

  const handleThumbnailUpload = (image: any) => {
    setSelectedThumbnail(image)
    setFormData(prev => ({ ...prev, thumbnailId: image.id }))
  }

  const handleThumbnailRemove = () => {
    setSelectedThumbnail(null)
    setFormData(prev => ({ ...prev, thumbnailId: null }))
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 页面标题和操作 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => router.push('/admin')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{getTranslation('common.back', '返回', 'Back')}</span>
          </Button>
          <h1 className="text-2xl font-bold">
            {getTranslation('admin.videos.title', '博客视频库', 'Blog Video Library')}
          </h1>
        </div>
        <Button onClick={handleCreateVideo} className="flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>{getTranslation('admin.videos.addVideo', '添加视频', 'Add Video')}</span>
        </Button>
      </div>

      {/* 语言切换和搜索 */}
      <div className="flex items-center justify-between mb-6">
        <Tabs value={currentLanguage} onValueChange={(value) => setCurrentLanguage(value as 'zh' | 'en')}>
          <TabsList>
            <TabsTrigger value="zh">中文</TabsTrigger>
            <TabsTrigger value="en">English</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder={getTranslation('admin.videos.searchPlaceholder', '搜索视频...', 'Search videos...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>
      </div>

      {/* 视频列表 */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">{getTranslation('common.loading', '加载中...', 'Loading...')}</div>
        </div>
      ) : (
        <Card>
          <div className="overflow-hidden">
            {/* 表头 */}
            <div className="bg-gray-50 px-6 py-3 border-b">
              <div className="grid grid-cols-12 gap-4 items-center text-sm font-medium text-gray-700">
                <div className="col-span-1">{getTranslation('admin.videos.thumbnail', '封面', 'Thumbnail')}</div>
                <div className="col-span-2">{getTranslation('admin.videos.category', '类型', 'Category')}</div>
                <div className="col-span-3">{getTranslation('admin.videos.title', '标题', 'Title')}</div>
                <div className="col-span-3">{getTranslation('admin.videos.description', '简介', 'Description')}</div>
                <div className="col-span-1">{getTranslation('admin.videos.status', '状态', 'Status')}</div>
                <div className="col-span-1">{getTranslation('admin.videos.order', '排序', 'Order')}</div>
                <div className="col-span-1">{getTranslation('admin.videos.actions', '操作', 'Actions')}</div>
              </div>
            </div>

            {/* 视频列表 */}
            <div className="divide-y divide-gray-200">
              {videos.map((video) => (
                <div key={video.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="grid grid-cols-12 gap-4 items-center">
                    {/* 缩略图 */}
                    <div className="col-span-1">
                      <div className="relative w-16 h-12 rounded overflow-hidden bg-gray-100">
                        {video.media ? (
                          <img
                            src={video.media.url}
                            alt={currentLanguage === 'zh' ? video.titleZh : video.titleEn}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              console.error('图片加载失败:', video.media.url)
                              e.currentTarget.style.display = 'none'
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Play className="w-4 h-4 text-gray-400" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 类型 */}
                    <div className="col-span-2">
                      <Badge variant="outline" className="text-xs">
                        {currentLanguage === 'zh' ? video.categoryZh : video.categoryEn}
                      </Badge>
                    </div>

                    {/* 标题 */}
                    <div className="col-span-3">
                      <h3 className="font-medium text-gray-900 line-clamp-2 text-sm">
                        {currentLanguage === 'zh' ? video.titleZh : video.titleEn}
                      </h3>
                    </div>

                    {/* 简介 */}
                    <div className="col-span-3">
                      <p className="text-gray-600 text-xs line-clamp-2">
                        {currentLanguage === 'zh' ? video.descriptionZh : video.descriptionEn}
                      </p>
                    </div>

                    {/* 状态 */}
                    <div className="col-span-1">
                      {video.isPublished ? (
                        <Badge variant="default" className="bg-green-500 text-xs">
                          <Eye className="w-3 h-3 mr-1" />
                          {getTranslation('admin.videos.published', '已发布', 'Published')}
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          <EyeOff className="w-3 h-3 mr-1" />
                          {getTranslation('admin.videos.draft', '草稿', 'Draft')}
                        </Badge>
                      )}
                    </div>

                    {/* 排序 */}
                    <div className="col-span-1">
                      <span className="text-sm text-gray-500">#{video.order}</span>
                    </div>

                    {/* 操作 */}
                    <div className="col-span-1">
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditVideo(video)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteVideo(video)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 空状态 */}
            {videos.length === 0 && (
              <div className="text-center py-12">
                <Play className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">
                  {getTranslation('admin.videos.noVideos', '暂无视频', 'No videos found')}
                </p>
                <Button onClick={handleCreateVideo}>
                  <Plus className="w-4 h-4 mr-2" />
                  {getTranslation('admin.videos.addVideo', '添加视频', 'Add Video')}
                </Button>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* 添加/编辑视频对话框 */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingVideo
                ? getTranslation('admin.videos.editVideo', '编辑视频', 'Edit Video')
                : getTranslation('admin.videos.addVideo', '添加视频', 'Add Video')
              }
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Tabs defaultValue="zh" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="zh">中文内容</TabsTrigger>
                <TabsTrigger value="en">English Content</TabsTrigger>
              </TabsList>

              <TabsContent value="zh" className="space-y-4">
                <div>
                  <Label htmlFor="categoryZh">{getTranslation('admin.videos.categoryZh', '视频类型（中文）', 'Category (Chinese)')}</Label>
                  <Input
                    id="categoryZh"
                    value={formData.categoryZh}
                    onChange={(e) => setFormData(prev => ({ ...prev, categoryZh: e.target.value }))}
                    placeholder={getTranslation('admin.videos.categoryPlaceholder', '如：项目介绍', 'e.g., Project Introduction')}
                    className="h-12"
                  />
                </div>

                <div>
                  <Label htmlFor="titleZh">{getTranslation('admin.videos.titleZh', '视频标题（中文）', 'Title (Chinese)')}</Label>
                  <Input
                    id="titleZh"
                    value={formData.titleZh}
                    onChange={(e) => setFormData(prev => ({ ...prev, titleZh: e.target.value }))}
                    placeholder={getTranslation('admin.videos.titlePlaceholder', '输入视频标题', 'Enter video title')}
                    className="h-12"
                  />
                </div>

                <div>
                  <Label htmlFor="descriptionZh">{getTranslation('admin.videos.descriptionZh', '视频简介（中文）', 'Description (Chinese)')}</Label>
                  <Textarea
                    id="descriptionZh"
                    value={formData.descriptionZh}
                    onChange={(e) => setFormData(prev => ({ ...prev, descriptionZh: e.target.value }))}
                    placeholder={getTranslation('admin.videos.descriptionPlaceholder', '输入视频简介', 'Enter video description')}
                    className="min-h-[100px]"
                  />
                </div>
              </TabsContent>

              <TabsContent value="en" className="space-y-4">
                <div>
                  <Label htmlFor="categoryEn">{getTranslation('admin.videos.categoryEn', '视频类型（英文）', 'Category (English)')}</Label>
                  <Input
                    id="categoryEn"
                    value={formData.categoryEn}
                    onChange={(e) => setFormData(prev => ({ ...prev, categoryEn: e.target.value }))}
                    placeholder="e.g., Project Introduction"
                    className="h-12"
                  />
                </div>

                <div>
                  <Label htmlFor="titleEn">{getTranslation('admin.videos.titleEn', '视频标题（英文）', 'Title (English)')}</Label>
                  <Input
                    id="titleEn"
                    value={formData.titleEn}
                    onChange={(e) => setFormData(prev => ({ ...prev, titleEn: e.target.value }))}
                    placeholder="Enter video title"
                    className="h-12"
                  />
                </div>

                <div>
                  <Label htmlFor="descriptionEn">{getTranslation('admin.videos.descriptionEn', '视频简介（英文）', 'Description (English)')}</Label>
                  <Textarea
                    id="descriptionEn"
                    value={formData.descriptionEn}
                    onChange={(e) => setFormData(prev => ({ ...prev, descriptionEn: e.target.value }))}
                    placeholder="Enter video description"
                    className="min-h-[100px]"
                  />
                </div>
              </TabsContent>
            </Tabs>

            {/* 视频封面图 */}
            <div>
              <ImageUpload
                label={getTranslation('admin.videos.thumbnail', '视频封面图', 'Video Thumbnail')}
                onImageUploaded={handleThumbnailUpload}
                currentImage={selectedThumbnail}
                onImageRemoved={handleThumbnailRemove}
              />
            </div>

            {/* 视频源选择 */}
            <div>
              <Label>{getTranslation('admin.videos.videoSource', '视频来源', 'Video Source')}</Label>
              <Tabs value={videoSource} onValueChange={(value) => setVideoSource(value as 'upload' | 'url')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="upload" className="flex items-center space-x-2">
                    <Upload className="w-4 h-4" />
                    <span>{getTranslation('admin.videos.uploadVideo', '上传视频', 'Upload Video')}</span>
                  </TabsTrigger>
                  <TabsTrigger value="url" className="flex items-center space-x-2">
                    <LinkIcon className="w-4 h-4" />
                    <span>{getTranslation('admin.videos.videoLink', '视频链接', 'Video Link')}</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="upload" className="mt-4">
                  <VideoUpload
                    label={getTranslation('admin.videos.videoFile', '视频文件', 'Video File')}
                    onVideoUploaded={(videoPath) => {
                      setFormData(prev => ({ ...prev, videoFile: videoPath, videoUrl: '' }))
                    }}
                    currentVideo={formData.videoFile || null}
                    onVideoRemoved={() => {
                      setFormData(prev => ({ ...prev, videoFile: '' }))
                    }}
                  />
                </TabsContent>

                <TabsContent value="url" className="mt-4">
                  <Input
                    value={formData.videoUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, videoUrl: e.target.value, videoFile: '' }))}
                    placeholder={getTranslation('admin.videos.videoUrlPlaceholder', '输入视频链接（YouTube、Vimeo等）', 'Enter video URL (YouTube, Vimeo, etc.)')}
                    className="h-12"
                  />
                </TabsContent>
              </Tabs>
            </div>

            {/* 其他设置 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="order">{getTranslation('admin.videos.order', '排序', 'Order')}</Label>
                <Input
                  id="order"
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                  className="h-12"
                />
              </div>

              <div className="flex items-center space-x-2 pt-6">
                <Switch
                  id="isPublished"
                  checked={formData.isPublished}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPublished: checked }))}
                />
                <Label htmlFor="isPublished">{getTranslation('admin.videos.publish', '发布视频', 'Publish Video')}</Label>
              </div>
            </div>

            {/* 提交按钮 */}
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={submitting}
              >
                {getTranslation('common.cancel', '取消', 'Cancel')}
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting
                  ? getTranslation('common.saving', '保存中...', 'Saving...')
                  : getTranslation('common.save', '保存', 'Save')
                }
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
