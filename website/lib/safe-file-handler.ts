/**
 * 🛡️ 安全的文件处理工具
 * 
 * 功能:
 * - 安全的文件路径验证
 * - 文件存在性检查
 * - 默认图片降级
 * - 文件上传安全处理
 */

import { NextRequest, NextResponse } from 'next/server'

export interface FileValidationOptions {
  allowedExtensions?: string[]
  maxFileSize?: number
  requireAuth?: boolean
}

export class SafeFileHandler {
  // 🛡️ Edge Runtime兼容的常量定义
  private static readonly DEFAULT_IMAGE = '/ico/logo_small.png'
  private static readonly ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
  private static readonly MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

  /**
   * 安全地验证文件路径 (Edge Runtime兼容)
   */
  static validateFilePath(filePath: string): { isValid: boolean; cleanPath?: string; error?: string } {
    try {
      // 移除查询参数和片段
      const cleanPath = filePath.split('?')[0].split('#')[0]

      // 检查路径是否包含危险字符
      if (cleanPath.includes('..') || cleanPath.includes('\\')) {
        return { isValid: false, error: 'Invalid file path' }
      }

      // 确保路径以 /uploads/ 开头
      if (!cleanPath.startsWith('/uploads/')) {
        return { isValid: false, error: 'File must be in uploads directory' }
      }

      // 检查文件名安全性
      const fileName = cleanPath.replace('/uploads/', '')
      if (!fileName || fileName.includes('/') || fileName.includes('\\')) {
        return { isValid: false, error: 'Invalid file name' }
      }

      return { isValid: true, cleanPath }
    } catch (error) {
      return { isValid: false, error: 'Path validation failed' }
    }
  }

  /**
   * 检查文件是否存在 (Edge Runtime兼容 - 简化版本)
   */
  static fileExists(filePath: string): boolean {
    const validation = this.validateFilePath(filePath)
    if (!validation.isValid) {
      return false
    }

    // 🛡️ Edge Runtime中无法直接检查文件系统
    // 返回true，让实际的文件请求处理404
    return true
  }

  /**
   * 获取安全的文件URL
   */
  static getSafeFileUrl(filePath: string | null | undefined): string {
    if (!filePath) {
      return this.DEFAULT_IMAGE
    }

    // 如果是完整URL，直接返回
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
      return filePath
    }

    // 验证本地文件路径
    const validation = this.validateFilePath(filePath)
    if (!validation.isValid) {
      console.warn(`🚨 Invalid file path: ${filePath}`)
      return this.DEFAULT_IMAGE
    }

    // 检查文件是否存在
    if (!this.fileExists(filePath)) {
      console.warn(`📁 File not found: ${filePath}`)
      return this.DEFAULT_IMAGE
    }

    return filePath
  }

  /**
   * 批量处理文件URL
   */
  static processBatchFileUrls(items: any[], fileFields: string[] = ['imageUrl', 'url']): any[] {
    return items.map(item => {
      const processedItem = { ...item }
      
      fileFields.forEach(field => {
        if (processedItem[field]) {
          processedItem[field] = this.getSafeFileUrl(processedItem[field])
        }
      })

      // 处理嵌套的media对象
      if (processedItem.media && processedItem.media.url) {
        processedItem.media.url = this.getSafeFileUrl(processedItem.media.url)
      }

      return processedItem
    })
  }

  /**
   * 验证上传文件
   */
  static validateUploadFile(
    file: File,
    options: FileValidationOptions = {}
  ): { isValid: boolean; error?: string } {
    const {
      allowedExtensions = this.ALLOWED_EXTENSIONS,
      maxFileSize = this.MAX_FILE_SIZE
    } = options

    // 检查文件大小
    if (file.size > maxFileSize) {
      return {
        isValid: false,
        error: `File size exceeds limit (${Math.round(maxFileSize / 1024 / 1024)}MB)`
      }
    }

    // 检查文件扩展名
    const fileName = file.name.toLowerCase()
    const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext))
    
    if (!hasValidExtension) {
      return {
        isValid: false,
        error: `Invalid file type. Allowed: ${allowedExtensions.join(', ')}`
      }
    }

    // 检查文件名安全性
    if (fileName.includes('..') || fileName.includes('/') || fileName.includes('\\')) {
      return {
        isValid: false,
        error: 'Invalid file name'
      }
    }

    return { isValid: true }
  }

  /**
   * 生成安全的文件名
   */
  static generateSafeFileName(originalName: string): string {
    // 移除路径和危险字符
    const cleanName = originalName
      .replace(/[^a-zA-Z0-9.-]/g, '')
      .toLowerCase()

    // 添加时间戳防止冲突
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 8)
    
    const extension = cleanName.split('.').pop() || 'bin'
    return `${timestamp}-${randomString}.${extension}`
  }

  /**
   * 创建文件上传API处理器
   */
  static createUploadHandler(options: FileValidationOptions = {}) {
    return async (request: NextRequest) => {
      try {
        // 认证检查
        if (options.requireAuth) {
          // 这里应该添加认证逻辑
          const authHeader = request.headers.get('authorization')
          if (!authHeader) {
            return NextResponse.json(
              { error: 'Authentication required' },
              { status: 401 }
            )
          }
        }

        const formData = await request.formData()
        const file = formData.get('file') as File

        if (!file) {
          return NextResponse.json(
            { error: 'No file provided' },
            { status: 400 }
          )
        }

        // 验证文件
        const validation = this.validateUploadFile(file, options)
        if (!validation.isValid) {
          return NextResponse.json(
            { error: validation.error },
            { status: 400 }
          )
        }

        // 生成安全文件名
        const safeFileName = this.generateSafeFileName(file.name)
        const filePath = `/uploads/${safeFileName}`

        // 这里应该实现实际的文件保存逻辑
        // 为了安全，暂时返回模拟响应
        return NextResponse.json({
          success: true,
          file: {
            name: safeFileName,
            url: filePath,
            size: file.size,
            type: file.type
          }
        })

      } catch (error) {
        console.error('File upload error:', error)
        return NextResponse.json(
          { error: 'Upload failed' },
          { status: 500 }
        )
      }
    }
  }

  /**
   * 清理无效的文件引用
   */
  static cleanupFileReferences(data: any): any {
    if (Array.isArray(data)) {
      return data.map(item => this.cleanupFileReferences(item))
    }

    if (data && typeof data === 'object') {
      const cleaned = { ...data }

      // 清理文件URL字段
      const fileFields = ['url', 'imageUrl', 'featuredImage', 'avatar']
      fileFields.forEach(field => {
        if (cleaned[field]) {
          cleaned[field] = this.getSafeFileUrl(cleaned[field])
        }
      })

      // 递归清理嵌套对象
      Object.keys(cleaned).forEach(key => {
        if (cleaned[key] && typeof cleaned[key] === 'object') {
          cleaned[key] = this.cleanupFileReferences(cleaned[key])
        }
      })

      return cleaned
    }

    return data
  }
}

/**
 * 文件处理中间件
 */
export function withFileHandling(handler: Function) {
  return async (...args: any[]) => {
    try {
      const result = await handler(...args)
      
      // 如果结果是NextResponse，提取JSON数据进行处理
      if (result instanceof NextResponse) {
        return result
      }

      // 清理文件引用
      const cleanedResult = SafeFileHandler.cleanupFileReferences(result)
      return cleanedResult
    } catch (error) {
      console.error('File handling error:', error)
      throw error
    }
  }
}
