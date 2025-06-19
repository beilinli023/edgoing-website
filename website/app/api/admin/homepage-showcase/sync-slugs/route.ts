import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireEditor } from '@/lib/middleware'

/**
 * 手动同步主页精选项目的slug
 * 
 * POST /api/admin/homepage-showcase/sync-slugs
 * 
 * 这个API端点允许管理员手动触发主页精选项目slug的同步，
 * 修复由于项目slug更新导致的不一致问题。
 */

export async function POST(request: NextRequest) {
  try {
    // 验证管理员权限
    const authResult = await requireEditor(request)
    if (authResult instanceof NextResponse) {
      return authResult
    }

    console.log('🔧 开始手动同步主页精选项目slug...')

    // 获取所有主页精选项目
    const showcases = await prisma.homepage_showcases.findMany({
      orderBy: [
        { position: 'asc' },
        { order: 'asc' }
      ]
    })

    const results = {
      total: showcases.length,
      fixed: 0,
      errors: 0,
      details: [] as any[]
    }

    for (const showcase of showcases) {
      const detail = {
        showcaseId: showcase.id,
        position: showcase.position,
        programType: showcase.programType,
        oldSlug: showcase.programSlug,
        newSlug: null as string | null,
        status: 'unchanged',
        message: ''
      }

      try {
        let actualProgram = null

        if (showcase.programType === 'china') {
          // 检查中国项目
          actualProgram = await prisma.china_programs.findFirst({
            where: {
              slug: showcase.programSlug,
              status: 'PUBLISHED'
            }
          })

          if (!actualProgram && (showcase.titleZh || showcase.titleEn)) {
            // 尝试通过标题查找
            const titleToSearch = showcase.titleZh || showcase.titleEn
            actualProgram = await prisma.china_programs.findFirst({
              where: {
                OR: [
                  { title: { contains: titleToSearch } },
                  { china_program_translations: {
                    some: {
                      title: { contains: titleToSearch }
                    }
                  }}
                ],
                status: 'PUBLISHED'
              }
            })
          }

        } else if (showcase.programType === 'international') {
          // 检查国际项目
          actualProgram = await prisma.international_programs.findFirst({
            where: {
              slug: showcase.programSlug,
              status: 'PUBLISHED'
            }
          })

          if (!actualProgram && (showcase.titleZh || showcase.titleEn)) {
            // 尝试通过标题查找
            const titleToSearch = showcase.titleZh || showcase.titleEn
            actualProgram = await prisma.international_programs.findFirst({
              where: {
                OR: [
                  { title: { contains: titleToSearch } },
                  { international_program_translations: {
                    some: {
                      title: { contains: titleToSearch }
                    }
                  }}
                ],
                status: 'PUBLISHED'
              }
            })
          }
        }

        if (!actualProgram) {
          detail.status = 'error'
          detail.message = '未找到匹配的项目'
          results.errors++
        } else if (showcase.programSlug !== actualProgram.slug) {
          // 需要更新slug
          await prisma.homepage_showcases.update({
            where: { id: showcase.id },
            data: {
              programSlug: actualProgram.slug,
              updatedAt: new Date()
            }
          })

          detail.newSlug = actualProgram.slug
          detail.status = 'fixed'
          detail.message = `已更新slug: ${showcase.programSlug} -> ${actualProgram.slug}`
          results.fixed++
        } else {
          detail.status = 'valid'
          detail.message = 'slug正确，无需更新'
        }

      } catch (error) {
        detail.status = 'error'
        detail.message = `处理失败: ${error instanceof Error ? error.message : '未知错误'}`
        results.errors++
        console.error(`处理精选项目 ${showcase.id} 时出错:`, error)
      }

      results.details.push(detail)
    }

    console.log(`✅ 同步完成: 修复 ${results.fixed} 个，错误 ${results.errors} 个`)

    return NextResponse.json({
      success: true,
      message: `同步完成: 检查了 ${results.total} 个精选项目，修复了 ${results.fixed} 个，${results.errors} 个错误`,
      results
    })

  } catch (error) {
    console.error('同步主页精选项目slug时出错:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    )
  }
}

/**
 * 获取同步状态和验证报告
 * 
 * GET /api/admin/homepage-showcase/sync-slugs
 */
export async function GET(request: NextRequest) {
  try {
    // 验证管理员权限
    const authResult = await requireEditor(request)
    if (authResult instanceof NextResponse) {
      return authResult
    }

    // 获取所有主页精选项目并验证
    const showcases = await prisma.homepage_showcases.findMany({
      orderBy: [
        { position: 'asc' },
        { order: 'asc' }
      ]
    })

    const validation = {
      total: showcases.length,
      valid: 0,
      invalid: 0,
      issues: [] as any[]
    }

    for (const showcase of showcases) {
      let isValid = true
      const issues = []

      if (showcase.programType === 'china') {
        const program = await prisma.china_programs.findFirst({
          where: {
            slug: showcase.programSlug,
            status: 'PUBLISHED'
          }
        })

        if (!program) {
          isValid = false
          issues.push('未找到匹配的已发布中国项目')
        }

      } else if (showcase.programType === 'international') {
        const program = await prisma.international_programs.findFirst({
          where: {
            slug: showcase.programSlug,
            status: 'PUBLISHED'
          }
        })

        if (!program) {
          isValid = false
          issues.push('未找到匹配的已发布国际项目')
        }

      } else {
        isValid = false
        issues.push(`未知的项目类型: ${showcase.programType}`)
      }

      if (isValid) {
        validation.valid++
      } else {
        validation.invalid++
        validation.issues.push({
          showcaseId: showcase.id,
          position: showcase.position,
          programType: showcase.programType,
          programSlug: showcase.programSlug,
          titleZh: showcase.titleZh,
          titleEn: showcase.titleEn,
          issues
        })
      }
    }

    return NextResponse.json({
      success: true,
      validation,
      needsSync: validation.invalid > 0
    })

  } catch (error) {
    console.error('获取同步状态时出错:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    )
  }
}
