import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireEditor } from '@/lib/middleware'

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireEditor(request)
    if (authResult instanceof NextResponse) {
      return authResult
    }

    // 获取所有申请数据
    const applications = await prisma.applications.findMany({
      include: {
        programs: {
          select: {
            title: true,
            country: true,
            city: true,
          }
        }
      },
      orderBy: { submittedAt: 'desc' },
    })

    // 生成CSV内容
    const csvHeaders = [
      'ID',
      '学生姓名',
      '学生邮箱',
      '学生电话',
      '学生年龄',
      '家长姓名',
      '家长邮箱',
      '家长电话',
      '申请项目',
      '项目地点',
      '申请状态',
      '备注',
      '申请时间',
      '更新时间'
    ]

    const csvRows = applications.map(app => [
      app.id,
      app.studentName,
      app.studentEmail,
      app.studentPhone || '',
      app.studentAge || '',
      app.parentName || '',
      app.parentEmail || '',
      app.parentPhone || '',
      app.programs.title,
      `${app.programs.country}, ${app.programs.city}`,
      getStatusText(app.status),
      app.notes || '',
      new Date(app.submittedAt).toLocaleString('zh-CN'),
      new Date(app.updatedAt).toLocaleString('zh-CN')
    ])

    // 转换为CSV格式
    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => 
        row.map(field => 
          typeof field === 'string' && field.includes(',') 
            ? `"${field.replace(/"/g, '""')}"` 
            : field
        ).join(',')
      )
    ].join('\n')

    // 添加BOM以支持中文
    const bom = '\uFEFF'
    const csvWithBom = bom + csvContent

    return new NextResponse(csvWithBom, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="applications-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    })
  } catch (error) {
    console.error('Export applications error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function getStatusText(status: string) {
  switch (status) {
    case 'PENDING':
      return '待审核'
    case 'APPROVED':
      return '已批准'
    case 'REJECTED':
      return '已拒绝'
    case 'COMPLETED':
      return '已完成'
    default:
      return status
  }
}
