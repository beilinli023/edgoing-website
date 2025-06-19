"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DarkThemeWrapper, GlassCard, DarkButton } from '@/components/admin/DarkThemeWrapper'

interface Newsletter {
  id: string
  email: string
  name?: string
  language: string
  isActive: boolean
  subscribedAt: string
  unsubscribedAt?: string
}

export default function NewslettersPage() {
  const [newsletters, setNewsletters] = useState<Newsletter[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    fetchNewsletters()
  }, [])

  const fetchNewsletters = async () => {
    try {
      const response = await fetch('/api/admin/newsletters')
      if (response.ok) {
        const data = await response.json()
        setNewsletters(data.newsletters)
      } else if (response.status === 401) {
        router.push('/admin/login')
      } else {
        setError('Failed to fetch newsletters')
      }
    } catch (error) {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this subscription?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/newsletters?id=${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchNewsletters()
      } else {
        setError('Failed to delete subscription')
      }
    } catch (error) {
      setError('Network error')
    }
  }

  const exportEmails = () => {
    const activeEmails = newsletters
      .filter(n => n.isActive)
      .map(n => n.email)
      .join('\n')

    const blob = new Blob([activeEmails], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'newsletter-subscribers.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const exportCSV = () => {
    const csvHeaders = ['邮箱', '姓名', '语言', '状态', '订阅时间', '取消订阅时间']
    const csvData = newsletters.map(newsletter => [
      newsletter.email,
      newsletter.name || '',
      newsletter.language.toUpperCase(),
      newsletter.isActive ? '活跃' : '已取消订阅',
      new Date(newsletter.subscribedAt).toLocaleString('zh-CN'),
      newsletter.unsubscribedAt ? new Date(newsletter.unsubscribedAt).toLocaleString('zh-CN') : ''
    ])

    const csvContent = [
      csvHeaders.join(','),
      ...csvData.map(row =>
        row.map(field => {
          // 处理包含逗号或引号的值
          if (typeof field === 'string' && (field.includes(',') || field.includes('"') || field.includes('\n'))) {
            return `"${field.replace(/"/g, '""')}"`
          }
          return field
        }).join(',')
      )
    ].join('\n')

    // 添加BOM以支持中文显示
    const bom = '\uFEFF'
    const csvWithBom = bom + csvContent

    const blob = new Blob([csvWithBom], { type: 'text/csv; charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `newsletter-subscribers-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <DarkThemeWrapper
        title="邮件订阅管理"
        description="管理邮件订阅用户"
        loading={true}
      >
        <div />
      </DarkThemeWrapper>
    )
  }

  const activeCount = newsletters.filter(n => n.isActive).length
  const todayCount = newsletters.filter(n => {
    const today = new Date()
    const subscribedDate = new Date(n.subscribedAt)
    return subscribedDate.toDateString() === today.toDateString()
  }).length

  return (
    <DarkThemeWrapper
      title="邮件订阅管理"
      description="管理邮件订阅用户"
      headerActions={
        <div className="flex space-x-4">
          <DarkButton onClick={exportCSV} variant="secondary">
            导出CSV
          </DarkButton>
          <DarkButton onClick={exportEmails} variant="secondary">
            导出邮箱
          </DarkButton>
        </div>
      }
    >
      <div className="space-y-6">
        {error && (
          <div className="bg-red-500/20 border border-red-500/30 text-red-200 px-4 py-3 rounded-lg mb-6 backdrop-blur-sm">
            {error}
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-2">总订阅用户</h3>
            <div className="text-3xl font-bold text-blue-400">
              {newsletters.length}
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-2">今日订阅用户</h3>
            <div className="text-3xl font-bold text-green-400">
              {todayCount}
            </div>
          </GlassCard>
        </div>

        {/* Subscribers List */}
        <GlassCard className="p-6">
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-white">订阅用户列表</h3>
            <p className="text-slate-300">所有邮件订阅用户</p>
          </div>

          {newsletters.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-300">暂无订阅用户</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      邮箱
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      姓名
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      语言
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      状态
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      订阅时间
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {newsletters.map((newsletter) => (
                    <tr key={newsletter.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        {newsletter.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        {newsletter.name || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        {newsletter.language.toUpperCase()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          newsletter.isActive
                            ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                            : 'bg-red-500/20 text-red-300 border border-red-500/30'
                        }`}>
                          {newsletter.isActive ? '活跃' : '已取消订阅'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        {new Date(newsletter.subscribedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <DarkButton
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(newsletter.id)}
                        >
                          删除
                        </DarkButton>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </GlassCard>
      </div>
    </DarkThemeWrapper>
  )
}
