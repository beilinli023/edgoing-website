'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { DarkThemeWrapper, GlassCard, DarkButton } from '@/components/admin/DarkThemeWrapper'

interface EmailConfig {
  id: string
  smtpHost: string
  smtpPort: number
  smtpUser: string
  smtpPassword: string
  smtpSecure: boolean
  fromEmail: string
  fromName: string
  notificationEmails: string
  contactSubmissionEnabled: boolean
  newsletterEnabled: boolean
  isActive: boolean
}

export default function EmailNotificationsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [config, setConfig] = useState<EmailConfig | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [notificationEmailsList, setNotificationEmailsList] = useState<string[]>([])

  useEffect(() => {
    fetchConfig()
  }, [])

  const fetchConfig = async () => {
    try {
      const response = await fetch('/api/admin/email-notifications')
      if (response.ok) {
        const data = await response.json()
        setConfig(data)
        if (data.notificationEmails) {
          try {
            const emails = JSON.parse(data.notificationEmails)
            setNotificationEmailsList(Array.isArray(emails) ? emails : [])
          } catch {
            setNotificationEmailsList([])
          }
        }
      } else {
        setError('Failed to fetch email configuration')
      }
    } catch (error) {
      console.error('Error fetching config:', error)
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!config) return

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/admin/email-notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...config,
          notificationEmails: notificationEmailsList,
        }),
      })

      if (response.ok) {
        setSuccess('邮件配置保存成功！')
        fetchConfig()
      } else {
        const data = await response.json()
        setError(data.error || '保存失败')
      }
    } catch (error) {
      console.error('Error saving config:', error)
      setError('网络错误')
    } finally {
      setSaving(false)
    }
  }

  const handleTest = async () => {
    setTesting(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/admin/email-notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'test' }),
      })

      const data = await response.json()
      if (response.ok) {
        setSuccess(data.message)
      } else {
        setError(data.error || '测试失败')
      }
    } catch (error) {
      console.error('Error testing email:', error)
      setError('网络错误')
    } finally {
      setTesting(false)
    }
  }

  const addNotificationEmail = () => {
    setNotificationEmailsList([...notificationEmailsList, ''])
  }

  const removeNotificationEmail = (index: number) => {
    setNotificationEmailsList(notificationEmailsList.filter((_, i) => i !== index))
  }

  const updateNotificationEmail = (index: number, email: string) => {
    const newList = [...notificationEmailsList]
    newList[index] = email
    setNotificationEmailsList(newList)
  }

  if (loading) {
    return (
      <DarkThemeWrapper
        title="通知邮箱维护"
        description="配置邮件通知服务和SMTP设置"
        loading={true}
      >
        <div />
      </DarkThemeWrapper>
    )
  }

  if (!config) {
    return (
      <DarkThemeWrapper
        title="通知邮箱维护"
        description="配置邮件通知服务和SMTP设置"
      >
        <div className="text-center py-12">
          <p className="text-red-300">配置加载失败</p>
        </div>
      </DarkThemeWrapper>
    )
  }

  return (
    <DarkThemeWrapper
      title="通知邮箱维护"
      description="配置邮件通知服务和SMTP设置"
      headerActions={
        <div className="flex space-x-4">
          <DarkButton onClick={handleTest} variant="secondary" disabled={testing || !config.isActive}>
            {testing ? '测试中...' : '测试邮件'}
          </DarkButton>
          <DarkButton onClick={handleSave} disabled={saving} variant="primary">
            {saving ? '保存中...' : '保存配置'}
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

        {success && (
          <div className="bg-green-500/20 border border-green-500/30 text-green-200 px-4 py-3 rounded-lg mb-6 backdrop-blur-sm">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* SMTP Configuration */}
          <GlassCard className="p-6">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-white">SMTP服务配置</h3>
              <p className="text-slate-300">配置邮件发送服务器设置</p>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="smtpHost" className="text-white">SMTP主机</Label>
                <Input
                  id="smtpHost"
                  value={config.smtpHost || ''}
                  onChange={(e) => setConfig({ ...config, smtpHost: e.target.value })}
                  placeholder="smtp.gmail.com"
                  className="bg-white/10 border-white/20 text-white placeholder:text-slate-400"
                />
              </div>

              <div>
                <Label htmlFor="smtpPort" className="text-white">SMTP端口</Label>
                <Input
                  id="smtpPort"
                  type="number"
                  value={config.smtpPort || 587}
                  onChange={(e) => setConfig({ ...config, smtpPort: parseInt(e.target.value) })}
                  placeholder="587"
                  className="bg-white/10 border-white/20 text-white placeholder:text-slate-400"
                />
              </div>

              <div>
                <Label htmlFor="smtpUser" className="text-white">SMTP用户名</Label>
                <Input
                  id="smtpUser"
                  value={config.smtpUser || ''}
                  onChange={(e) => setConfig({ ...config, smtpUser: e.target.value })}
                  placeholder="your-email@gmail.com"
                  className="bg-white/10 border-white/20 text-white placeholder:text-slate-400"
                />
              </div>

              <div>
                <Label htmlFor="smtpPassword" className="text-white">SMTP密码</Label>
                <Input
                  id="smtpPassword"
                  type="password"
                  value={config.smtpPassword || ''}
                  onChange={(e) => setConfig({ ...config, smtpPassword: e.target.value })}
                  placeholder="应用专用密码"
                  className="bg-white/10 border-white/20 text-white placeholder:text-slate-400"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="smtpSecure"
                  checked={config.smtpSecure}
                  onCheckedChange={(checked) => setConfig({ ...config, smtpSecure: checked })}
                />
                <Label htmlFor="smtpSecure" className="text-white">使用SSL/TLS加密</Label>
              </div>
            </div>
          </GlassCard>

          {/* Sender Configuration */}
          <GlassCard className="p-6">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-white">发件人配置</h3>
              <p className="text-slate-300">设置邮件发送者信息</p>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="fromEmail" className="text-white">发件人邮箱</Label>
                <Input
                  id="fromEmail"
                  value={config.fromEmail || ''}
                  onChange={(e) => setConfig({ ...config, fromEmail: e.target.value })}
                  placeholder="noreply@edgoing.com"
                  className="bg-white/10 border-white/20 text-white placeholder:text-slate-400"
                />
              </div>

              <div>
                <Label htmlFor="fromName" className="text-white">发件人名称</Label>
                <Input
                  id="fromName"
                  value={config.fromName || ''}
                  onChange={(e) => setConfig({ ...config, fromName: e.target.value })}
                  placeholder="EdGoing 通知系统"
                  className="bg-white/10 border-white/20 text-white placeholder:text-slate-400"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={config.isActive}
                  onCheckedChange={(checked) => setConfig({ ...config, isActive: checked })}
                />
                <Label htmlFor="isActive" className="text-white">启用邮件通知</Label>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Notification Settings */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Notification Emails */}
          <GlassCard className="p-6">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-white">通知邮箱列表</h3>
              <p className="text-slate-300">设置接收通知的邮箱地址</p>
            </div>
            <div className="space-y-4">
              {notificationEmailsList.map((email, index) => (
                <div key={index} className="flex space-x-2">
                  <Input
                    value={email}
                    onChange={(e) => updateNotificationEmail(index, e.target.value)}
                    placeholder="admin@edgoing.com"
                    className="bg-white/10 border-white/20 text-white placeholder:text-slate-400"
                  />
                  <DarkButton
                    variant="danger"
                    size="sm"
                    onClick={() => removeNotificationEmail(index)}
                  >
                    删除
                  </DarkButton>
                </div>
              ))}
              <DarkButton onClick={addNotificationEmail} variant="secondary">
                添加邮箱
              </DarkButton>
            </div>
          </GlassCard>

          {/* Notification Types */}
          <GlassCard className="p-6">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-white">通知类型</h3>
              <p className="text-slate-300">选择需要发送邮件通知的事件</p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="contactSubmissionEnabled"
                  checked={config.contactSubmissionEnabled}
                  onCheckedChange={(checked) => setConfig({ ...config, contactSubmissionEnabled: checked })}
                />
                <Label htmlFor="contactSubmissionEnabled" className="text-white">联系表单通知</Label>
              </div>
              <p className="text-sm text-slate-300">当有新的联系表单提交时发送邮件通知</p>

              <div className="flex items-center space-x-2">
                <Switch
                  id="newsletterEnabled"
                  checked={config.newsletterEnabled}
                  onCheckedChange={(checked) => setConfig({ ...config, newsletterEnabled: checked })}
                />
                <Label htmlFor="newsletterEnabled" className="text-white">邮件订阅通知</Label>
              </div>
              <p className="text-sm text-slate-300">当有新的邮件订阅时发送邮件通知</p>
            </div>
          </GlassCard>
        </div>
      </div>
    </DarkThemeWrapper>
  )
}
