import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getQueryParam, buildErrorResponse } from '@/lib/api-utils'

// 🛡️ 强制此路由为动态，避免静态生成时的问题
export const dynamic = 'force-dynamic'

const prisma = new PrismaClient()

// GET - 获取Hero页面数据（公开API）
export async function GET(request: NextRequest) {
  try {
    // 🛡️ 使用安全的参数获取方法，避免静态生成时的动态服务器使用
    const pageName = getQueryParam(request, 'page')
    const pageType = getQueryParam(request, 'type')

    if (pageName) {
      // 获取特定页面的Hero数据
      const heroPage = await prisma.hero_pages.findUnique({
        where: {
          pageName,
          isActive: true
        }
      })

      if (!heroPage) {
        return NextResponse.json({ error: 'Hero page not found' }, { status: 404 })
      }

      // 解析slides JSON
      const result = {
        ...heroPage,
        slides: heroPage.slides ? JSON.parse(heroPage.slides) : null
      }

      return NextResponse.json(result)
    }

    if (pageType) {
      // 获取特定类型的Hero页面
      const heroPages = await prisma.hero_pages.findMany({
        where: {
          pageType: pageType as 'PRIMARY' | 'SECONDARY',
          isActive: true
        },
        orderBy: [
          { order: 'asc' },
          { pageName: 'asc' }
        ]
      })

      // 解析slides JSON
      const results = heroPages.map(page => ({
        ...page,
        slides: page.slides ? JSON.parse(page.slides) : null
      }))

      return NextResponse.json(results)
    }

    // 获取所有Hero页面 (临时移除isActive条件进行调试)
    const heroPages = await prisma.hero_pages.findMany({
      orderBy: [
        { pageType: 'asc' }, // PRIMARY first, then SECONDARY
        { order: 'asc' },
        { pageName: 'asc' }
      ]
    })

    // 解析slides JSON
    const results = heroPages.map(page => ({
      ...page,
      slides: page.slides ? JSON.parse(page.slides) : null
    }))

    return NextResponse.json(results)
  } catch (error) {
    const errorResponse = buildErrorResponse(error, 'Hero Pages API')
    return NextResponse.json(errorResponse, { status: 500 })
  }
}
