import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import fs from 'fs'
import path from 'path'

// 🛡️ 强制此路由为动态，避免静态生成时的问题
export const dynamic = 'force-dynamic'


/**
 * 🏥 图片健康检查API
 * 
 * 定期检查图片文件的健康状况
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const autoFix = searchParams.get('autofix') === 'true'

    // 获取所有媒体记录
    const mediaRecords = await prisma.media.findMany({
      select: {
        id: true,
        url: true,
        filename: true,
        mimeType: true,
        size: true,
        createdAt: true,
      }
    })

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
    const healthReport = {
      timestamp: new Date().toISOString(),
      totalRecords: mediaRecords.length,
      healthyFiles: 0,
      issues: [] as any[],
      autoFixApplied: false,
      fixedCount: 0
    }

    // 检查每个媒体文件
    for (const media of mediaRecords) {
      const issue = {
        id: media.id,
        filename: media.filename,
        url: media.url,
        mimeType: media.mimeType,
        size: media.size,
        createdAt: media.createdAt,
        issue: '',
        severity: 'info' as 'info' | 'warning' | 'error'
      }

      // 检查URL是否为空
      if (!media.url || media.url.trim() === '') {
        issue.issue = 'Empty URL'
        issue.severity = 'error'
        healthReport.issues.push(issue)
        continue
      }

      // 检查文件是否存在
      const urlPath = media.url.replace('/uploads/', '')
      const filePath = path.join(uploadsDir, urlPath)

      try {
        if (fs.existsSync(filePath)) {
          // 文件存在，检查文件大小
          const stats = fs.statSync(filePath)
          if (stats.size === 0) {
            issue.issue = 'File exists but is empty'
            issue.severity = 'warning'
            healthReport.issues.push(issue)
          } else if (Math.abs(stats.size - media.size) > 1024) {
            // 文件大小差异超过1KB
            issue.issue = `File size mismatch: DB=${media.size}, File=${stats.size}`
            issue.severity = 'warning'
            healthReport.issues.push(issue)
          } else {
            healthReport.healthyFiles++
          }
        } else {
          issue.issue = 'File not found'
          issue.severity = 'error'
          healthReport.issues.push(issue)
        }
      } catch (error) {
        issue.issue = `Error checking file: ${error.message}`
        issue.severity = 'error'
        healthReport.issues.push(issue)
      }
    }

    // 如果启用了自动修复
    if (autoFix && healthReport.issues.length > 0) {
      const errorIssues = healthReport.issues.filter(issue => issue.severity === 'error')
      
      if (errorIssues.length > 0) {
        const idsToDelete = errorIssues.map(issue => issue.id)

        try {
          // 删除相关的博客轮播图记录
          await prisma.blog_carousels.deleteMany({
            where: { mediaId: { in: idsToDelete } }
          })

          // 将使用这些媒体的博客的imageId设为null
          await prisma.blogs.updateMany({
            where: { imageId: { in: idsToDelete } },
            data: { imageId: null }
          })

          // 删除无效的媒体记录
          const deleteResult = await prisma.media.deleteMany({
            where: { id: { in: idsToDelete } }
          })

          healthReport.autoFixApplied = true
          healthReport.fixedCount = deleteResult.count
        } catch (error) {
          console.error('Auto-fix failed:', error)
        }
      }
    }

    // 计算健康分数
    const healthScore = healthReport.totalRecords > 0 
      ? Math.round((healthReport.healthyFiles / healthReport.totalRecords) * 100)
      : 100

    return NextResponse.json({
      ...healthReport,
      healthScore,
      status: healthScore >= 95 ? 'healthy' : healthScore >= 80 ? 'warning' : 'critical',
      recommendations: generateRecommendations(healthReport)
    })

  } catch (error) {
    console.error('Image health check error:', error)
    return NextResponse.json(
      { 
        error: 'Health check failed', 
        details: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

function generateRecommendations(report: any): string[] {
  const recommendations = []

  if (report.issues.length === 0) {
    recommendations.push('✅ 所有图片文件都是健康的')
    return recommendations
  }

  const errorCount = report.issues.filter((i: any) => i.severity === 'error').length
  const warningCount = report.issues.filter((i: any) => i.severity === 'warning').length

  if (errorCount > 0) {
    recommendations.push(`🚨 发现 ${errorCount} 个严重问题，建议立即清理`)
    recommendations.push('💡 运行清理脚本: node scripts/cleanup-media.js')
  }

  if (warningCount > 0) {
    recommendations.push(`⚠️ 发现 ${warningCount} 个警告，建议检查文件完整性`)
  }

  if (report.issues.length > report.totalRecords * 0.1) {
    recommendations.push('📊 问题文件比例较高，建议检查上传流程')
  }

  recommendations.push('🔄 建议定期运行健康检查以保持系统稳定')

  return recommendations
}
