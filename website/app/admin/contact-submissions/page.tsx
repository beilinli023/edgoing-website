"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'

interface ContactSubmission {
  id: string
  role: string
  schoolName?: string
  firstName: string
  lastName: string
  email: string
  phone: string
  grade?: string
  province?: string
  city?: string
  destinations: string[]
  learningInterests: string[]
  message?: string
  consent: boolean
  status: string
  notes?: string
  submittedAt: string
  updatedAt: string
}

export default function ContactSubmissionsPage() {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingSubmission, setEditingSubmission] = useState<string | null>(null)
  const [editStatus, setEditStatus] = useState('')
  const [editNotes, setEditNotes] = useState('')
  const [isExporting, setIsExporting] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchSubmissions()
  }, [])

  const fetchSubmissions = async () => {
    try {
      const response = await fetch('/api/admin/contact-submissions')
      if (response.ok) {
        const data = await response.json()
        setSubmissions(data.contactSubmissions)
      } else if (response.status === 401) {
        router.push('/admin/login')
      } else {
        setError('获取联系咨询数据失败')
      }
    } catch (error) {
      setError('网络连接错误')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (submission: ContactSubmission) => {
    setEditingSubmission(submission.id)
    setEditStatus(submission.status)
    setEditNotes(submission.notes || '')
  }

  const handleSave = async (id: string) => {
    try {
      const response = await fetch('/api/admin/contact-submissions', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          status: editStatus,
          notes: editNotes,
        }),
      })

      if (response.ok) {
        const updatedSubmission = await response.json()
        setSubmissions(prev => 
          prev.map(sub => sub.id === id ? updatedSubmission : sub)
        )
        setEditingSubmission(null)
      } else {
        setError('更新咨询状态失败')
      }
    } catch (error) {
      setError('网络连接错误')
    }
  }

  const handleCancel = () => {
    setEditingSubmission(null)
    setEditStatus('')
    setEditNotes('')
  }

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const response = await fetch('/api/admin/contact-submissions/export')
      if (!response.ok) {
        throw new Error('Export failed')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = `contact-submissions-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Export error:', error)
      setError('导出数据失败')
    } finally {
      setIsExporting(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NEW':
        return 'bg-blue-100 text-blue-800'
      case 'CONTACTED':
        return 'bg-yellow-100 text-yellow-800'
      case 'RESOLVED':
        return 'bg-green-100 text-green-800'
      case 'CLOSED':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'NEW':
        return '新咨询'
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">正在加载联系咨询...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">联系咨询管理</h1>
              <p className="text-gray-600">管理联系表单提交的咨询信息</p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleExport}
                variant="outline"
                disabled={isExporting || submissions.length === 0}
              >
                {isExporting ? '导出中...' : '导出CSV'}
              </Button>
              <Button onClick={() => router.push('/admin')}>
                返回管理面板
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <div className="grid gap-6">
            {submissions.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <p className="text-gray-500">暂无联系咨询记录</p>
                </CardContent>
              </Card>
            ) : (
              submissions.map((submission) => (
                <Card key={submission.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{submission.firstName} {submission.lastName}</CardTitle>
                        <CardDescription>
                          {submission.role} • {submission.email}
                        </CardDescription>
                      </div>
                      <Badge className={getStatusColor(submission.status)}>
                        {getStatusText(submission.status)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <h4 className="font-semibold text-gray-900">联系信息</h4>
                                                  <p className="text-sm text-gray-600">邮箱: {submission.email}</p>
                          <p className="text-sm text-gray-600">电话: {submission.phone}</p>
                        {submission.schoolName && (
                            <p className="text-sm text-gray-600">学校: {submission.schoolName}</p>
                        )}
                        {submission.grade && (
                            <p className="text-sm text-gray-600">年级: {submission.grade}</p>
                        )}
                        {submission.province && submission.city && (
                            <p className="text-sm text-gray-600">所在地: {submission.city}, {submission.province}</p>
                        )}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">兴趣偏好</h4>
                        {submission.destinations.length > 0 && (
                          <div className="mb-2">
                            <p className="text-sm text-gray-600">目的地:</p>
                            <div className="flex flex-wrap gap-1">
                              {submission.destinations.map((dest, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {dest}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        {submission.learningInterests.length > 0 && (
                          <div>
                            <p className="text-sm text-gray-600">学习兴趣:</p>
                            <div className="flex flex-wrap gap-1">
                              {submission.learningInterests.map((interest, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {interest}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {submission.message && (
                      <div className="mb-4">
                        <h4 className="font-semibold text-gray-900">留言内容</h4>
                        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                          {submission.message}
                        </p>
                      </div>
                    )}

                    <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                      <span>提交时间: {new Date(submission.submittedAt).toLocaleString()}</span>
                      <span>更新时间: {new Date(submission.updatedAt).toLocaleString()}</span>
                    </div>

                    {editingSubmission === submission.id ? (
                      <div className="space-y-4 border-t pt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">状态</label>
                            <Select value={editStatus} onValueChange={setEditStatus}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="NEW">新咨询</SelectItem>
                                <SelectItem value="CONTACTED">已联系</SelectItem>
                                <SelectItem value="RESOLVED">已解决</SelectItem>
                                <SelectItem value="CLOSED">已关闭</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">备注</label>
                          <Textarea
                            value={editNotes}
                            onChange={(e) => setEditNotes(e.target.value)}
                            placeholder="添加关于此咨询的备注..."
                            rows={3}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={() => handleSave(submission.id)} size="sm">
                            保存
                          </Button>
                          <Button onClick={handleCancel} variant="outline" size="sm">
                            取消
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="border-t pt-4">
                        {submission.notes && (
                          <div className="mb-4">
                            <h4 className="font-semibold text-gray-900">备注</h4>
                            <p className="text-sm text-gray-600">{submission.notes}</p>
                          </div>
                        )}
                        <Button onClick={() => handleEdit(submission)} size="sm">
                          编辑状态和备注
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
