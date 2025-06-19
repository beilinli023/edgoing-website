/**
 * 🛡️ 安全的API工具函数
 * 
 * 解决静态生成时的动态服务器使用问题
 */

import { NextRequest } from 'next/server'

/**
 * 安全地获取搜索参数，避免在静态生成时使用request.url
 *
 * 在静态生成期间，我们不应该尝试解析URL参数，
 * 因为这会导致动态服务器使用错误。
 */
export function getSearchParams(request: NextRequest): URLSearchParams {
  // 检查是否在静态生成期间
  if (process.env.NODE_ENV === 'production' && !request.url.startsWith('http')) {
    // 在静态生成期间，返回空的搜索参数
    return new URLSearchParams()
  }

  try {
    // 只在运行时解析URL
    const url = new URL(request.url)
    return url.searchParams
  } catch (error) {
    // 如果URL解析失败，返回空的URLSearchParams
    console.warn('Failed to parse request URL, returning empty search params:', error)
    return new URLSearchParams()
  }
}

/**
 * 安全地获取单个查询参数
 */
export function getQueryParam(request: NextRequest, key: string, defaultValue?: string): string | null {
  try {
    const searchParams = getSearchParams(request)
    return searchParams.get(key) || defaultValue || null
  } catch (error) {
    console.warn(`Failed to get query param ${key}:`, error)
    return defaultValue || null
  }
}

/**
 * 安全地获取分页参数
 */
export function getPaginationParams(request: NextRequest) {
  const page = parseInt(getQueryParam(request, 'page', '1') || '1')
  const limit = parseInt(getQueryParam(request, 'limit', '10') || '10')
  
  return {
    page: Math.max(1, page),
    limit: Math.min(100, Math.max(1, limit)), // 限制最大100条
    skip: (Math.max(1, page) - 1) * Math.min(100, Math.max(1, limit))
  }
}

/**
 * 安全地获取语言参数
 */
export function getLanguageParam(request: NextRequest): string {
  return getQueryParam(request, 'language', 'zh') || 'zh'
}

/**
 * 安全地获取状态参数
 */
export function getStatusParam(request: NextRequest): string {
  return getQueryParam(request, 'status', 'PUBLISHED') || 'PUBLISHED'
}

/**
 * 构建安全的查询条件
 */
export function buildSafeWhereCondition(request: NextRequest, baseConditions: any = {}) {
  const language = getLanguageParam(request)
  const status = getStatusParam(request)
  
  return {
    ...baseConditions,
    language,
    status
  }
}

/**
 * 安全的错误响应构建器
 */
export function buildErrorResponse(error: any, context: string = 'API') {
  console.error(`${context} Error:`, error)
  
  // 在生产环境中隐藏敏感错误信息
  const message = process.env.NODE_ENV === 'development' 
    ? error.message || 'Internal server error'
    : 'Internal server error'
    
  return {
    error: message,
    timestamp: new Date().toISOString(),
    context
  }
}

/**
 * 验证请求参数
 */
export function validateRequestParams(params: Record<string, any>, required: string[] = []) {
  const missing = required.filter(key => !params[key])
  
  if (missing.length > 0) {
    throw new Error(`Missing required parameters: ${missing.join(', ')}`)
  }
  
  return true
}

/**
 * 安全的JSON解析
 */
export async function safeJsonParse(request: NextRequest) {
  try {
    return await request.json()
  } catch (error) {
    throw new Error('Invalid JSON in request body')
  }
}

/**
 * 构建标准化的API响应
 */
export function buildApiResponse(data: any, meta?: any) {
  const response: any = {
    data,
    timestamp: new Date().toISOString()
  }
  
  if (meta) {
    response.meta = meta
  }
  
  return response
}

/**
 * 构建分页响应元数据
 */
export function buildPaginationMeta(total: number, page: number, limit: number) {
  const totalPages = Math.ceil(total / limit)
  
  return {
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  }
}
