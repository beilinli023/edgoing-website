"use client"

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import Image from 'next/image'

interface UploadedImage {
  id: string
  url: string
  alt?: string
  filename: string
}

interface MultiImageUploadProps {
  onImagesSelect: (images: UploadedImage[]) => void
  selectedImages: UploadedImage[]
  maxImages?: number
  label?: string
  description?: string
}

export default function MultiImageUpload({
  onImagesSelect,
  selectedImages,
  maxImages = 10,
  label = "轮播图",
  description = "拖拽图片到此处，或点击选择文件"
}: MultiImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    // 检查是否超过最大数量
    if (selectedImages.length + files.length > maxImages) {
      alert(`最多只能上传 ${maxImages} 张图片`)
      return
    }

    // 验证文件类型和大小
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    const maxSize = 5 * 1024 * 1024 // 5MB

    for (const file of Array.from(files)) {
      if (!allowedTypes.includes(file.type)) {
        alert(`文件 "${file.name}" 格式不支持。仅支持 JPEG、PNG、GIF、WebP 格式。`)
        return
      }
      if (file.size > maxSize) {
        alert(`文件 "${file.name}" 太大。最大支持 5MB。`)
        return
      }
    }

    setUploading(true)

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('alt', file.name)

        const response = await fetch('/api/admin/media/upload', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}: ${response.statusText}` }))
          throw new Error(errorData.error || `Upload failed with status ${response.status}`)
        }

        const data = await response.json()
        return data.media
      })

      const uploadedImages = await Promise.all(uploadPromises)
      const newImages = [...selectedImages, ...uploadedImages]
      onImagesSelect(newImages)
    } catch (error) {
      console.error('Upload error:', error)
      const errorMessage = error instanceof Error ? error.message : '图片上传失败，请重试'
      alert(`上传失败: ${errorMessage}`)
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

  const removeImage = (index: number) => {
    const newImages = selectedImages.filter((_, i) => i !== index)
    onImagesSelect(newImages)
  }

  const moveImage = (fromIndex: number, toIndex: number) => {
    const newImages = [...selectedImages]
    const [movedImage] = newImages.splice(fromIndex, 1)
    newImages.splice(toIndex, 0, movedImage)
    onImagesSelect(newImages)
  }

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>

      {/* 上传区域 */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragOver
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />

        <div className="space-y-2">
          <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
          <div className="text-sm text-gray-600">
            <p>{description}</p>
            <p className="text-xs text-gray-500 mt-1">
              支持 JPEG、PNG、GIF、WebP 格式，最大 5MB
            </p>
            <p className="text-xs text-gray-500">
              已选择 {selectedImages.length}/{maxImages} 张图片
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || selectedImages.length >= maxImages}
            className="mt-2"
          >
            <Upload className="w-4 h-4 mr-2" />
            {uploading ? '上传中...' : '选择图片'}
          </Button>
        </div>
      </div>

      {/* 已选择的图片 */}
      {selectedImages.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">已选择的图片：</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {selectedImages.map((image, index) => (
              <div
                key={image.id}
                className="relative group border rounded-lg overflow-hidden"
              >
                <div className="aspect-square">
                  <Image
                    src={image.url}
                    alt={image.alt || `轮播图 ${index + 1}`}
                    width={200}
                    height={200}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* 删除按钮 */}
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* 顺序标识 */}
                <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                  {index + 1}
                </div>

                {/* 移动按钮 */}
                <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity space-x-1">
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => moveImage(index, index - 1)}
                      className="bg-blue-500 text-white text-xs px-2 py-1 rounded"
                    >
                      ←
                    </button>
                  )}
                  {index < selectedImages.length - 1 && (
                    <button
                      type="button"
                      onClick={() => moveImage(index, index + 1)}
                      className="bg-blue-500 text-white text-xs px-2 py-1 rounded"
                    >
                      →
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500">
            提示：可以通过拖拽或点击箭头按钮调整图片顺序
          </p>
        </div>
      )}
    </div>
  )
}
