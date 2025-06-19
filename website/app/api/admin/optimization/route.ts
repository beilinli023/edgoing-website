/**
 * 🚀 查询优化监控API
 * 提供优化统计和缓存管理功能
 */

import { NextRequest, NextResponse } from 'next/server'
import { SafeApiOptimizer } from '@/lib/optimization/api-optimizer'

// 简单的认证检查
async function requireAdminAuth(request: NextRequest): Promise<boolean> {
  try {
    if (process.env.NODE_ENV === 'development' && process.env.DISABLE_AUTH === 'true') {
      return true
    }

    const authToken = request.cookies.get('auth-token')?.value
    return authToken ? authToken.length > 10 : false
  } catch (error) {
    return false
  }
}

export async function GET(request: NextRequest) {
  try {
    // 权限检查
    const isAuthorized = await requireAdminAuth(request)
    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'Unauthorized access to optimization data' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || 'stats'

    switch (action) {
      case 'stats':
        const stats = SafeApiOptimizer.getOptimizationStats()
        return NextResponse.json({
          ...stats,
          message: 'Query optimization statistics'
        })

      case 'health':
        const health = await SafeApiOptimizer.healthCheck()
        return NextResponse.json(health)

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: stats, health' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('Optimization API error:', error)
    return NextResponse.json(
      { 
        error: 'Internal optimization error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // 权限检查
    const isAuthorized = await requireAdminAuth(request)
    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'Unauthorized access to optimization controls' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { action, entityType, entityId } = body

    switch (action) {
      case 'invalidate_cache':
        if (!entityType) {
          return NextResponse.json(
            { error: 'entityType is required for cache invalidation' },
            { status: 400 }
          )
        }

        SafeApiOptimizer.invalidateRelatedCache(entityType, entityId)
        
        return NextResponse.json({
          message: `Cache invalidated for entity type: ${entityType}`,
          entityType,
          entityId: entityId || 'all',
          timestamp: new Date().toISOString()
        })

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: invalidate_cache' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('Optimization control error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to execute optimization control',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
