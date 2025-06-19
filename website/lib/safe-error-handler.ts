/**
 * 🛡️ 安全的错误处理工具
 * 
 * 功能:
 * - 统一错误处理格式
 * - 安全的错误信息过滤
 * - 开发环境详细日志
 * - 生产环境安全响应
 */

import { NextResponse } from 'next/server'

export interface SafeErrorOptions {
  logError?: boolean
  includeStack?: boolean
  customMessage?: string
  statusCode?: number
}

export class SafeErrorHandler {
  /**
   * 安全地处理API错误
   */
  static handleApiError(
    error: any, 
    context: string = 'API',
    options: SafeErrorOptions = {}
  ): NextResponse {
    const {
      logError = true,
      includeStack = process.env.NODE_ENV === 'development',
      customMessage,
      statusCode = 500
    } = options

    // 安全的错误信息提取
    const errorInfo = this.extractErrorInfo(error)
    
    // 记录错误日志
    if (logError) {
      console.error(`🚨 ${context} Error:`, {
        message: errorInfo.message,
        type: errorInfo.type,
        timestamp: new Date().toISOString(),
        stack: includeStack ? errorInfo.stack : undefined
      })
    }

    // 构建响应
    const response: any = {
      error: customMessage || this.getSafeErrorMessage(error),
      timestamp: new Date().toISOString(),
      context
    }

    // 开发环境包含详细信息
    if (process.env.NODE_ENV === 'development') {
      response.details = {
        message: errorInfo.message,
        type: errorInfo.type,
        stack: errorInfo.stack?.split('\n').slice(0, 10) // 限制堆栈深度
      }
    }

    return NextResponse.json(response, { status: statusCode })
  }

  /**
   * 提取错误信息
   */
  private static extractErrorInfo(error: any): {
    message: string
    type: string
    stack?: string
  } {
    if (error instanceof Error) {
      return {
        message: error.message,
        type: error.constructor.name,
        stack: error.stack
      }
    }

    if (typeof error === 'string') {
      return {
        message: error,
        type: 'StringError'
      }
    }

    if (error && typeof error === 'object') {
      return {
        message: error.message || JSON.stringify(error),
        type: error.constructor?.name || 'ObjectError'
      }
    }

    return {
      message: 'Unknown error occurred',
      type: 'UnknownError'
    }
  }

  /**
   * 获取安全的错误消息
   */
  private static getSafeErrorMessage(error: any): string {
    // 数据库相关错误
    if (error?.code === 'P2002') {
      return 'Duplicate entry detected'
    }
    
    if (error?.code?.startsWith('P')) {
      return 'Database operation failed'
    }

    // 认证相关错误
    if (error?.message?.includes('authentication') || error?.message?.includes('unauthorized')) {
      return 'Authentication failed'
    }

    // 文件相关错误
    if (error?.code === 'ENOENT') {
      return 'File not found'
    }

    if (error?.code === 'EACCES') {
      return 'Permission denied'
    }

    // 网络相关错误
    if (error?.code === 'ECONNREFUSED') {
      return 'Connection refused'
    }

    // 默认安全消息
    return 'Internal server error'
  }

  /**
   * 处理文件上传错误
   */
  static handleFileError(error: any, filename?: string): NextResponse {
    const context = `File Upload${filename ? ` (${filename})` : ''}`
    
    if (error?.code === 'ENOENT') {
      return this.handleApiError(error, context, {
        customMessage: 'File not found',
        statusCode: 404
      })
    }

    if (error?.code === 'EACCES') {
      return this.handleApiError(error, context, {
        customMessage: 'File access denied',
        statusCode: 403
      })
    }

    return this.handleApiError(error, context)
  }

  /**
   * 处理数据库错误
   */
  static handleDatabaseError(error: any, operation: string = 'Database'): NextResponse {
    // Prisma错误处理
    if (error?.code?.startsWith('P')) {
      const prismaErrors: Record<string, { message: string; status: number }> = {
        'P2002': { message: 'Duplicate entry detected', status: 409 },
        'P2025': { message: 'Record not found', status: 404 },
        'P2003': { message: 'Foreign key constraint failed', status: 400 },
        'P2014': { message: 'Invalid relation', status: 400 },
      }

      const errorInfo = prismaErrors[error.code]
      if (errorInfo) {
        return this.handleApiError(error, operation, {
          customMessage: errorInfo.message,
          statusCode: errorInfo.status
        })
      }
    }

    return this.handleApiError(error, operation, {
      customMessage: 'Database operation failed'
    })
  }

  /**
   * 处理认证错误
   */
  static handleAuthError(error: any, context: string = 'Authentication'): NextResponse {
    return this.handleApiError(error, context, {
      customMessage: 'Authentication failed',
      statusCode: 401
    })
  }
}

/**
 * 错误处理装饰器
 */
export function withSafeErrorHandling(
  handler: Function,
  context: string = 'API',
  options: SafeErrorOptions = {}
) {
  return async (...args: any[]) => {
    try {
      return await handler(...args)
    } catch (error) {
      return SafeErrorHandler.handleApiError(error, context, options)
    }
  }
}

/**
 * 异步错误包装器
 */
export async function safeAsync<T>(
  operation: () => Promise<T>,
  context: string = 'Operation'
): Promise<{ success: true; data: T } | { success: false; error: any }> {
  try {
    const data = await operation()
    return { success: true, data }
  } catch (error) {
    console.error(`🚨 ${context} failed:`, error)
    return { success: false, error }
  }
}
