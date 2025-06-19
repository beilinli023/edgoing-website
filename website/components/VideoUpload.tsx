"use client"

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Upload, X, Video as VideoIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface VideoUploadProps {
  onVideoUploaded: (videoPath: string) => void
  currentVideo?: string | null
  onVideoRemoved?: () => void
  label?: string
}

export default function VideoUpload({
  onVideoUploaded,
  currentVideo,
  onVideoRemoved,
  label
}: VideoUploadProps) {
  const { i18n } = useTranslation()
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const getTranslation = (key: string, zhText: string, enText?: string) => {
    if (i18n.language === 'en' && enText) {
      return enText
    }
    return zhText
  }

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    const file = files[0]

    // 验证文件类型
    const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov']
    if (!allowedTypes.includes(file.type)) {
      alert(getTranslation('videoUpload.invalidType', '不支持的视频格式。仅支持 MP4、WebM、OGG、AVI、MOV 格式。', 'Unsupported video format. Only MP4, WebM, OGG, AVI, MOV are supported.'))
      return
    }

    // 验证文件大小 (100MB)
    const maxSize = 100 * 1024 * 1024
    if (file.size > maxSize) {
      alert(getTranslation('videoUpload.tooLarge', '视频文件太大。最大支持 100MB。', 'Video file is too large. Maximum size is 100MB.'))
      return
    }

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'video')

      const response = await fetch('/api/admin/media/upload', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        onVideoUploaded(data.media.url)
      } else {
        const errorText = await response.text()

        let errorMessage
        try {
          const errorData = JSON.parse(errorText)
          errorMessage = errorData.error || errorData.message
        } catch {
          errorMessage = errorText || `HTTP ${response.status}`
        }

        alert(errorMessage || getTranslation('videoUpload.uploadFailed', '视频上传失败', 'Video upload failed'))
      }
    } catch (error) {
      console.error('Video upload error:', error)
      alert(getTranslation('videoUpload.uploadError', '视频上传出错', 'Video upload error'))
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    handleFileSelect(e.dataTransfer.files)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const handleRemoveVideo = () => {
    if (onVideoRemoved) {
      onVideoRemoved()
    }
  }

  if (currentVideo) {
    return (
      <div className="space-y-4">
        <Label>{label || getTranslation('videoUpload.video', '视频文件', 'Video File')}</Label>
        <div className="relative inline-block">
          <div className="relative w-64 h-36 rounded-lg overflow-hidden border bg-gray-100">
            <video
              src={currentVideo}
              className="w-full h-full object-cover"
              controls
              preload="metadata"
            />
          </div>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute -top-2 -right-2 rounded-full w-6 h-6 p-0"
            onClick={handleRemoveVideo}
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          <Upload className="w-4 h-4 mr-2" />
          {uploading
            ? getTranslation('videoUpload.uploading', '上传中...', 'Uploading...')
            : getTranslation('videoUpload.replace', '替换视频', 'Replace Video')
          }
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Label>{label || getTranslation('videoUpload.video', '视频文件', 'Video File')}</Label>
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragOver
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <VideoIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <div className="space-y-2">
          <p className="text-sm text-gray-600">
            {getTranslation('videoUpload.dragDropText', '拖拽视频到此处，或点击选择文件', 'Drag and drop video here, or click to select file')}
          </p>
          <p className="text-xs text-gray-500">
            {getTranslation('videoUpload.supportedFormats', '支持 MP4、WebM、OGG、AVI、MOV 格式，最大 100MB', 'Supports MP4, WebM, OGG, AVI, MOV formats, max 100MB')}
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            <Upload className="w-4 h-4 mr-2" />
            {uploading
              ? getTranslation('videoUpload.uploading', '上传中...', 'Uploading...')
              : getTranslation('videoUpload.selectFile', '选择视频文件', 'Select Video File')
            }
          </Button>
        </div>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
      />
    </div>
  )
}
