import { NextRequest, NextResponse } from 'next/server'
import { queryOptimizer } from '@/lib/optimization/query-optimizer'

/**
 * 🧹 清除所有缓存的API端点
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🧹 收到清除缓存请求')
    
    // 清除查询优化器缓存
    const cacheStats = queryOptimizer.getCacheStats()
    console.log('📊 清除前缓存状态:', cacheStats)
    
    // 清除所有缓存
    queryOptimizer.clearCache()
    
    const newCacheStats = queryOptimizer.getCacheStats()
    console.log('📊 清除后缓存状态:', newCacheStats)
    
    return NextResponse.json({
      success: true,
      message: '所有缓存已清除',
      before: cacheStats,
      after: newCacheStats,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ 清除缓存失败:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

/**
 * 获取缓存状态
 */
export async function GET(request: NextRequest) {
  try {
    const cacheStats = queryOptimizer.getCacheStats()
    
    return NextResponse.json({
      success: true,
      cacheStats,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ 获取缓存状态失败:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
