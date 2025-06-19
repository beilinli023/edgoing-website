"use client"

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Upload, X, Image as ImageIcon, Plus } from 'lucide-react'
import Image from 'next/image'
import { useTranslation } from 'react-i18next'

interface ImageUploadProps {
  onImageUploaded: (media: any) => void
  currentImage?: {
    id: string
    url: string
    alt?: string
  } | null
  onImageRemoved?: () => void
  label?: string
}

interface MultiImageUploadProps {
  onImagesUploaded: (media: any[]) => void
  currentImages?: {
    id: string
    url: string
    alt?: string
  }[]
  onImageRemoved?: (index: number) => void
  label?: string
  maxImages?: number
}

export default function ImageUpload({
  onImageUploaded,
  currentImage,
  onImageRemoved,
  label
}: ImageUploadProps) {
  const { t, ready } = useTranslation('common')
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Helper function to get translation with fallback
  const getTranslation = (key: string, fallback: string) => {
    if (!ready) return fallback
    const translation = t(key)
    return translation === key ? fallback : translation
  }

  const handleFileSelect = async (file: File) => {
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setError(getTranslation('admin.imageUpload.invalidFileType', '仅支持图片文件（JPEG、PNG、GIF、WebP）'))
      return
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      setError(getTranslation('admin.imageUpload.fileTooLarge', '文件大小不能超过 5MB'))
      return
    }

    setError('')
    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('alt', file.name)

      const response = await fetch('/api/admin/media/upload', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        onImageUploaded(data.media)
      } else {
        const errorData = await response.json()
        setError(errorData.error || getTranslation('admin.imageUpload.uploadFailed', '上传失败，请重试'))
      }
    } catch (error) {
      setError(getTranslation('admin.imageUpload.uploadFailed', '上传失败，请重试'))
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleRemoveImage = () => {
    if (onImageRemoved) {
      onImageRemoved()
    }
  }

  if (currentImage) {
    return (
      <div className="space-y-4">
        <Label>{label || getTranslation('admin.imageUpload.studentPhoto', '学员照片')}</Label>
        <div className="relative inline-block">
          <div className="relative w-32 h-32 rounded-lg overflow-hidden">
            <Image
              src={currentImage.url}
              alt={currentImage.alt || getTranslation('admin.imageUpload.studentPhoto', '学员照片')}
              fill
              className="object-cover"
            />
          </div>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute -top-2 -right-2 rounded-full w-6 h-6 p-0"
            onClick={handleRemoveImage}
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
          {getTranslation('admin.imageUpload.changePhoto', '更换照片')}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInputChange}
          className="hidden"
        />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Label>{label || getTranslation('admin.imageUpload.studentPhoto', '学员照片')}</Label>
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
        <ImageIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <div className="space-y-2">
          <p className="text-sm text-gray-600">
            {getTranslation('admin.imageUpload.dragDropText', '拖拽图片到此处，或点击选择文件')}
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            <Upload className="w-4 h-4 mr-2" />
            {uploading ? getTranslation('admin.imageUpload.uploading', '上传中...') : getTranslation('admin.imageUpload.selectPhoto', '选择照片')}
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {getTranslation('admin.imageUpload.supportedFormats', '支持 JPEG、PNG、GIF、WebP 格式，最大 5MB')}
        </p>
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
      />
    </div>
  )
}

export function MultiImageUpload({
  onImagesUploaded,
  currentImages = [],
  onImageRemoved,
  label,
  maxImages = 10
}: MultiImageUploadProps) {
  const { t, ready } = useTranslation('common')
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Helper function to get translation with fallback
  const getTranslation = (key: string, fallback: string) => {
    if (!ready) return fallback
    const translation = t(key)
    return translation === key ? fallback : translation
  }

  const handleFileSelect = async (files: FileList) => {
    if (!files || files.length === 0) return

    // Check if adding these files would exceed the limit
    if (currentImages.length + files.length > maxImages) {
      setError(`最多只能上传 ${maxImages} 张图片`)
      return
    }

    setError('')
    setUploading(true)

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
        if (!allowedTypes.includes(file.type)) {
          throw new Error(getTranslation('admin.imageUpload.invalidFileType', '仅支持图片文件（JPEG、PNG、GIF、WebP）'))
        }

        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024
        if (file.size > maxSize) {
          throw new Error(getTranslation('admin.imageUpload.fileTooLarge', '文件大小不能超过 5MB'))
        }

        const formData = new FormData()
        formData.append('file', file)
        formData.append('alt', file.name)

        const response = await fetch('/api/admin/media/upload', {
          method: 'POST',
          body: formData,
        })

        if (response.ok) {
          const data = await response.json()
          return data.media
        } else {
          const errorData = await response.json()
          throw new Error(errorData.error || getTranslation('admin.imageUpload.uploadFailed', '上传失败，请重试'))
        }
      })

      const uploadedMedia = await Promise.all(uploadPromises)
      onImagesUploaded(uploadedMedia)
    } catch (error: any) {
      setError(error.message || getTranslation('admin.imageUpload.uploadFailed', '上传失败，请重试'))
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileSelect(files)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files)
    }
  }

  const handleRemoveImage = (index: number) => {
    if (onImageRemoved) {
      onImageRemoved(index)
    }
  }

  return (
    <div className="space-y-4">
      <Label>{label || getTranslation('admin.imageUpload.gallery', '图片画廊')}</Label>

      {/* Display current images */}
      {currentImages.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {currentImages.map((image, index) => (
            <div key={image.id || index} className="relative group">
              <div className="relative w-full h-32 rounded-lg overflow-hidden">
                <Image
                  src={image.url}
                  alt={image.alt || `图片 ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute -top-2 -right-2 rounded-full w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleRemoveImage(index)}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Upload area */}
      {currentImages.length < maxImages && (
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
          <ImageIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              {getTranslation('admin.imageUpload.dragDropText', '拖拽图片到此处，或点击选择文件')}
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              <Plus className="w-4 h-4 mr-2" />
              {uploading ? getTranslation('admin.imageUpload.uploading', '上传中...') : '添加图片'}
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {getTranslation('admin.imageUpload.supportedFormats', '支持 JPEG、PNG、GIF、WebP 格式，最大 5MB')}
          </p>
          <p className="text-xs text-gray-500">
            已上传 {currentImages.length}/{maxImages} 张图片
          </p>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileInputChange}
        className="hidden"
      />
    </div>
  )
}
