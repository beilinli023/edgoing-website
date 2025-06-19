"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Download, Trash2, CheckSquare, Square } from 'lucide-react'
import { DarkThemeWrapper, GlassCard, DarkButton } from '@/components/admin/DarkThemeWrapper'

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

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<ContactSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingApplication, setEditingApplication] = useState<string | null>(null)
  const [editStatus, setEditStatus] = useState('')
  const [editNotes, setEditNotes] = useState('')
  const [downloading, setDownloading] = useState(false)
  const [selectedApplications, setSelectedApplications] = useState<string[]>([])
  const [deleting, setDeleting] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/admin/contact-submissions')
      if (response.ok) {
        const data = await response.json()
        setApplications(data.contactSubmissions)
      } else if (response.status === 401) {
        router.push('/admin/login')
      } else {
        setError('获取申请数据失败')
      }
    } catch (error) {
      setError('网络错误')
    } finally {
      setLoading(false)
    }
  }

  const handleEditApplication = (application: ContactSubmission) => {
    setEditingApplication(application.id)
    setEditStatus(application.status)
    setEditNotes(application.notes || '')
  }

  const handleSaveApplication = async (id: string) => {
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
        const updatedApplication = await response.json()
        setApplications(prev =>
          prev.map(app => app.id === id ? updatedApplication : app)
        )
        setEditingApplication(null)
      } else {
        setError('更新申请状态失败')
      }
    } catch (error) {
      setError('网络错误')
    }
  }

  const handleCancel = () => {
    setEditingApplication(null)
    setEditStatus('')
    setEditNotes('')
  }

  // 选择功能
  const handleSelectApplication = (id: string) => {
    setSelectedApplications(prev =>
      prev.includes(id)
        ? prev.filter(appId => appId !== id)
        : [...prev, id]
    )
  }

  const handleSelectAll = () => {
    if (selectedApplications.length === applications.length) {
      setSelectedApplications([])
    } else {
      setSelectedApplications(applications.map(app => app.id))
    }
  }

  // 删除功能
  const handleDeleteSelected = async () => {
    if (selectedApplications.length === 0) return

    const confirmed = confirm(`确定要删除选中的 ${selectedApplications.length} 个申请吗？此操作不可撤销。`)
    if (!confirmed) return

    setDeleting(true)
    try {
      const response = await fetch('/api/admin/contact-submissions', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ids: selectedApplications,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setApplications(prev => prev.filter(app => !selectedApplications.includes(app.id)))
        setSelectedApplications([])
        alert(`成功删除 ${data.deletedCount} 个申请`)
      } else {
        const errorData = await response.json()
        setError(errorData.error || '删除失败')
      }
    } catch (error) {
      setError('删除时发生网络错误')
    } finally {
      setDeleting(false)
    }
  }

  const downloadCSV = async () => {
    setDownloading(true)
    try {
      const response = await fetch('/api/admin/contact-submissions/export')
      if (response.ok) {
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
      } else {
        setError('下载失败')
      }
    } catch (error) {
      setError('下载失败')
    } finally {
      setDownloading(false)
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
      <DarkThemeWrapper
        title="申请管理"
        description="管理项目申请和学生信息"
        loading={true}
      >
        <div />
      </DarkThemeWrapper>
    )
  }

  return (
    <DarkThemeWrapper
      title="申请管理"
      description="管理项目申请和学生信息"
      headerActions={
        <div className="flex items-center space-x-2">
          {selectedApplications.length > 0 && (
            <DarkButton
              onClick={handleDeleteSelected}
              disabled={deleting}
              className="flex items-center space-x-2"
              variant="destructive"
            >
              <Trash2 className="h-4 w-4" />
              <span>{deleting ? '删除中...' : `删除选中 (${selectedApplications.length})`}</span>
            </DarkButton>
          )}
          <DarkButton
            onClick={downloadCSV}
            disabled={downloading || applications.length === 0}
            className="flex items-center space-x-2"
            variant="secondary"
          >
            <Download className="h-4 w-4" />
            <span>{downloading ? '下载中...' : '导出CSV'}</span>
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

        <GlassCard className="p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-white">
              申请统计 ({applications.length})
            </h2>
            {applications.length > 0 && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={selectedApplications.length === applications.length}
                  onCheckedChange={handleSelectAll}
                  className="border-white/30"
                />
                <span className="text-sm text-slate-300">
                  {selectedApplications.length === applications.length ? '取消全选' : '全选'}
                </span>
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400">
                {applications.filter(s => s.status === 'NEW').length}
              </div>
              <div className="text-sm text-slate-300">新咨询</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400">
                {applications.filter(s => s.status === 'CONTACTED').length}
              </div>
              <div className="text-sm text-slate-300">已联系</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400">
                {applications.filter(s => s.status === 'RESOLVED').length}
              </div>
              <div className="text-sm text-slate-300">已解决</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-400">
                {applications.filter(s => s.status === 'CLOSED').length}
              </div>
              <div className="text-sm text-slate-300">已关闭</div>
            </div>
          </div>
        </GlassCard>

        <div className="grid gap-6">
          {applications.length === 0 ? (
            <GlassCard className="p-8">
              <div className="text-center">
                <p className="text-slate-300">暂无申请</p>
              </div>
            </GlassCard>
          ) : (
            applications.map((application) => (
              <GlassCard key={application.id} className="p-6">
                <div className="mb-6">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        checked={selectedApplications.includes(application.id)}
                        onCheckedChange={() => handleSelectApplication(application.id)}
                        className="border-white/30"
                      />
                      <div>
                        <h3 className="text-xl font-semibold text-white">{application.firstName} {application.lastName}</h3>
                        <p className="text-slate-300">
                          {application.email} • {application.role}
                        </p>
                        {application.schoolName && (
                          <p className="text-sm text-slate-400">
                            {application.schoolName}
                          </p>
                        )}
                      </div>
                    </div>
                    <Badge className={getStatusColor(application.status)}>
                      {getStatusText(application.status)}
                    </Badge>
                  </div>
                </div>
                <div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h4 className="font-semibold text-white mb-2">联系信息</h4>
                      <p className="text-sm text-slate-300">姓名: {application.firstName} {application.lastName}</p>
                      <p className="text-sm text-slate-300">邮箱: {application.email}</p>
                      <p className="text-sm text-slate-300">电话: {application.phone}</p>
                      <p className="text-sm text-slate-300">角色: {application.role}</p>
                      {application.schoolName && (
                        <p className="text-sm text-slate-300">学校: {application.schoolName}</p>
                      )}
                      {application.grade && (
                        <p className="text-sm text-slate-300">年级: {application.grade}</p>
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-2">地理信息</h4>
                      {application.province && (
                        <p className="text-sm text-slate-300">省份: {application.province}</p>
                      )}
                      {application.city && (
                        <p className="text-sm text-slate-300">城市: {application.city}</p>
                      )}
                      {!application.province && !application.city && (
                        <p className="text-sm text-slate-400">未提供地理信息</p>
                      )}
                    </div>
                  </div>

                  {(application.destinations.length > 0 || application.learningInterests.length > 0) && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-white mb-2">兴趣信息</h4>
                      <div className="bg-white/5 p-3 rounded-lg border border-white/10">
                        {application.destinations.length > 0 && (
                          <p className="text-sm text-slate-300 mb-2">
                            <strong>目标国家:</strong> {application.destinations.join(', ')}
                          </p>
                        )}
                        {application.learningInterests.length > 0 && (
                          <p className="text-sm text-slate-300">
                            <strong>学习兴趣:</strong> {application.learningInterests.join(', ')}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {application.message && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-white mb-2">留言</h4>
                      <p className="text-sm text-slate-300 bg-white/5 p-3 rounded-lg border border-white/10">
                        {application.message}
                      </p>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-sm text-slate-400 mb-4">
                    <span>申请时间: {new Date(application.submittedAt).toLocaleString()}</span>
                    <span>更新时间: {new Date(application.updatedAt).toLocaleString()}</span>
                  </div>

                  {editingApplication === application.id ? (
                    <div className="space-y-4 border-t border-white/20 pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-white mb-2">状态</label>
                          <Select value={editStatus} onValueChange={setEditStatus}>
                            <SelectTrigger className="bg-white/10 border-white/20 text-white">
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
                        <label className="block text-sm font-medium text-white mb-2">备注</label>
                        <Textarea
                          value={editNotes}
                          onChange={(e) => setEditNotes(e.target.value)}
                          placeholder="添加关于此申请的备注..."
                          rows={3}
                          className="bg-white/10 border-white/20 text-white placeholder:text-slate-400"
                        />
                      </div>
                      <div className="flex gap-2">
                        <DarkButton onClick={() => handleSaveApplication(application.id)} size="sm" variant="primary">
                          保存
                        </DarkButton>
                        <DarkButton onClick={handleCancel} variant="secondary" size="sm">
                          取消
                        </DarkButton>
                      </div>
                    </div>
                  ) : (
                    <div className="border-t border-white/20 pt-4">
                      {application.notes && (
                        <div className="mb-4">
                          <h4 className="font-semibold text-white mb-2">备注</h4>
                          <p className="text-sm text-slate-300">{application.notes}</p>
                        </div>
                      )}
                      <DarkButton onClick={() => handleEditApplication(application)} size="sm" variant="secondary">
                        编辑状态和备注
                      </DarkButton>
                    </div>
                  )}
                </div>
              </GlassCard>
            ))
          )}
        </div>
      </div>
    </DarkThemeWrapper>
  )
}
