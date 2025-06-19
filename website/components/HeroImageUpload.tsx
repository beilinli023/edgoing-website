"use client"

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import NextImage from 'next/image'

interface HeroImageUploadProps {
  label: string
  currentImageUrl?: string
  onImageUploaded: (imageUrl: string) => void
  onImageRemoved?: () => void
  className?: string
  aspectRatio?: 'banner' | 'hero' // banner for carousel, hero for page hero
}

export default function HeroImageUpload({
  label,
  currentImageUrl,
  onImageUploaded,
  onImageRemoved,
  className = '',
  aspectRatio = 'hero'
}: HeroImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (file: File) => {
    // 验证文件类型
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setError('仅支持 JPEG、PNG、GIF、WebP 格式的图片')
      return
    }

    // 验证文件大小 (5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      setError('图片大小不能超过 5MB')
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
        onImageUploaded(data.media.url)
      } else {
        const errorData = await response.json()
        setError(errorData.error || '上传失败，请重试')
      }
    } catch (error) {
      setError('上传失败，请重试')
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

  const handleRemoveImage = () => {
    if (onImageRemoved) {
      onImageRemoved()
    }
  }

  const getImageDimensions = () => {
    if (aspectRatio === 'banner') {
      return { width: 400, height: 200 } // 2:1 ratio for carousel banners
    }
    return { width: 300, height: 180 } // 5:3 ratio for page heroes
  }

  const { width, height } = getImageDimensions()

  // 如果有当前图片，显示图片和替换按钮
  if (currentImageUrl) {
    return (
      <div className={`space-y-4 ${className}`}>
        <Label>{label}</Label>
        <div className="space-y-3">
          {/* 图片预览 */}
          <div className="relative inline-block">
            <div 
              className="relative rounded-lg overflow-hidden border-2 border-gray-200 hover:border-gray-300 transition-colors"
              style={{ width: `${width}px`, height: `${height}px` }}
            >
              <NextImage
                src={currentImageUrl}
                alt={label}
                fill
                className="object-cover"
                sizes={`${width}px`}
              />
              {/* 删除按钮 */}
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2 rounded-full w-8 h-8 p-0 opacity-80 hover:opacity-100"
                onClick={handleRemoveImage}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* 替换图片按钮 */}
          <div className="flex space-x-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center space-x-2"
            >
              <Upload className="w-4 h-4" />
              <span>{uploading ? '上传中...' : '替换图片'}</span>
            </Button>
          </div>

          {/* 错误信息 */}
          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
        </div>

        {/* 隐藏的文件输入 */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) {
              handleFileSelect(file)
            }
          }}
          className="hidden"
        />
      </div>
    )
  }

  // 如果没有图片，显示上传区域
  return (
    <div className={`space-y-4 ${className}`}>
      <Label>{label}</Label>
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
          dragOver
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        style={{ width: `${width}px`, height: `${height}px` }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="flex flex-col items-center justify-center h-full space-y-3">
          <ImageIcon className="w-12 h-12 text-gray-400" />
          <div className="space-y-1">
            <p className="text-sm text-gray-600">
              {uploading ? '上传中...' : '点击或拖拽图片到此处'}
            </p>
            <p className="text-xs text-gray-500">
              支持 JPEG、PNG、GIF、WebP 格式，最大 5MB
            </p>
          </div>
        </div>
      </div>

      {/* 错误信息 */}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {/* 隐藏的文件输入 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) {
            handleFileSelect(file)
          }
        }}
        className="hidden"
      />
    </div>
  )
}
