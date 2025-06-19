import { NextRequest, NextResponse } from 'next/server'
import { getLanguageParam } from '@/lib/api-utils'

// 🛡️ 强制此路由为动态，避免静态生成时的问题
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // 🛡️ 使用安全的参数获取方法，避免静态生成时的动态服务器使用
    const language = getLanguageParam(request)

    // 硬编码的内容，不再从数据库获取
    const content: Record<string, string> = {}

    // 由于内容已经硬编码到组件中，这里返回空对象
    // 组件会使用硬编码的fallback值
    return NextResponse.json({ content })
  } catch (error) {
    console.error('Content API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
