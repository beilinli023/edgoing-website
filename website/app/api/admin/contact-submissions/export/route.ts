import { NextRequest, NextResponse } from 'next/server'
import { requireEditor } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireEditor(request)
    if (authResult instanceof NextResponse) {
      return authResult
    }

    // 获取所有联系表单数据
    const [contactSubmissions, gradeLevels, countries, programTypes, provinces] = await Promise.all([
      prisma.contact_submissions.findMany({
        orderBy: { submittedAt: 'desc' },
      }),
      prisma.grade_levels.findMany({
        select: { id: true, name: true, nameEn: true }
      }),
      prisma.countries.findMany({
        select: { id: true, name: true, nameEn: true }
      }),
      prisma.program_types.findMany({
        select: { id: true, name: true, nameEn: true }
      }),
      prisma.china_provinces.findMany({
        include: {
          china_cities: {
            select: { id: true, nameZh: true, nameEn: true }
          }
        }
      })
    ])

    // 创建查找映射
    const gradeLevelMap = new Map(gradeLevels.map(g => [g.id, g]))
    const countryMap = new Map(countries.map(c => [c.id, c]))
    const programTypeMap = new Map(programTypes.map(p => [p.id, p]))
    const provinceMap = new Map(provinces.map(p => [p.id, p]))
    const cityMap = new Map()
    provinces.forEach(province => {
      province.china_cities.forEach(city => {
        cityMap.set(city.id, { ...city, province: province.nameZh })
      })
    })

    // 处理数据并转换为CSV格式
    const csvData = contactSubmissions.map(submission => {
      const destinations = submission.destinations ? JSON.parse(submission.destinations) : []
      const learningInterests = submission.learningInterests ? JSON.parse(submission.learningInterests) : []
      
      return {
        ID: submission.id,
        姓名: `${submission.firstName} ${submission.lastName}`,
        角色: submission.role,
        邮箱: submission.email,
        电话: submission.phone,
        学校: submission.schoolName || '',
        年级: submission.grade ? gradeLevelMap.get(submission.grade)?.name || submission.grade : '',
        省份: submission.province ? provinceMap.get(submission.province)?.nameZh || submission.province : '',
        城市: submission.city ? cityMap.get(submission.city)?.nameZh || submission.city : '',
        目的地: destinations.map((id: string) => countryMap.get(id)?.name || id).join(', '),
        学习兴趣: learningInterests.map((id: string) => programTypeMap.get(id)?.name || id).join(', '),
        留言: submission.message || '',
        状态: getStatusText(submission.status),
        备注: submission.notes || '',
        提交时间: new Date(submission.submittedAt).toLocaleString('zh-CN'),
        更新时间: new Date(submission.updatedAt).toLocaleString('zh-CN'),
      }
    })

    // 转换为CSV格式
    if (csvData.length === 0) {
      // 如果没有数据，返回空的CSV文件
      const emptyHeaders = ['ID', '姓名', '角色', '邮箱', '电话', '学校', '年级', '省份', '城市', '目的地', '学习兴趣', '留言', '状态', '备注', '提交时间', '更新时间']
      const csvContent = emptyHeaders.join(',')
      const bom = '\uFEFF'
      const csvWithBom = bom + csvContent

      return new NextResponse(csvWithBom, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="contact-submissions-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      })
    }

    const headers = Object.keys(csvData[0])
    const csvContent = [
      headers.join(','),
      ...csvData.map(row =>
        headers.map(header => {
          const value = row[header as keyof typeof row]
          // 处理包含逗号或引号的值
          if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
            return `"${value.replace(/"/g, '""')}"`
          }
          return value
        }).join(',')
      )
    ].join('\n')

    // 添加BOM以支持中文显示
    const bom = '\uFEFF'
    const csvWithBom = bom + csvContent

    return new NextResponse(csvWithBom, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="contact-submissions-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    })
  } catch (error) {
    console.error('Export contact submissions error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function getStatusText(status: string) {
  switch (status) {
    case 'NEW':
      return '新提交'
    case 'CONTACTED':
      return '已联系'
    case 'RESOLVED':
      return '已解决'
    case 'CLOSED':
      return '已关闭'
    default:
      return status
  }
}
