"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Plus, Edit, Trash2, Search, ArrowLeft, Building2, ExternalLink } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import ImageUpload from '@/components/ImageUpload'
import { DarkThemeWrapper, NotificationMessage, GlassCard, DarkButton } from '@/components/admin/DarkThemeWrapper'

interface PartnerLogo {
  id: string
  companyName: string
  logoUrl: string
  websiteUrl?: string
  order: number
  isActive: boolean
  createdAt: string
  uploader: {
    id: string
    name: string
    username: string
  }
}

interface FormData {
  companyName: string
  logoUrl: string
  websiteUrl: string
  order: number
  isActive: boolean
}

const initialFormData: FormData = {
  companyName: '',
  logoUrl: '',
  websiteUrl: '',
  order: 0,
  isActive: true
}

export default function PartnerLogosPage() {
  const router = useRouter()
  const { t, i18n } = useTranslation()
  const [partnerLogos, setPartnerLogos] = useState<PartnerLogo[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingLogo, setEditingLogo] = useState<PartnerLogo | null>(null)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [selectedLogo, setSelectedLogo] = useState<any>(null)
  const [submitting, setSubmitting] = useState(false)

  const getTranslation = (key: string, zhText: string, enText?: string) => {
    if (i18n.language === 'en' && enText) {
      return enText
    }
    return zhText
  }

  useEffect(() => {
    fetchPartnerLogos()
  }, [searchTerm])

  const fetchPartnerLogos = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        ...(searchTerm && { search: searchTerm })
      })

      const response = await fetch(`/api/admin/partner-logos?${params}`)
      if (response.ok) {
        const data = await response.json()
        setPartnerLogos(data.partnerLogos)
      }
    } catch (error) {
      console.error('Failed to fetch partner logos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateLogo = () => {
    setEditingLogo(null)
    setFormData(initialFormData)
    setSelectedLogo(null)
    setIsDialogOpen(true)
  }

  const handleEditLogo = (logo: PartnerLogo) => {
    setEditingLogo(logo)
    setFormData({
      companyName: logo.companyName,
      logoUrl: logo.logoUrl,
      websiteUrl: logo.websiteUrl || '',
      order: logo.order,
      isActive: logo.isActive
    })
    setSelectedLogo({ id: 'existing', url: logo.logoUrl, alt: logo.companyName })
    setIsDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // 验证必填字段
    if (!formData.companyName || !formData.logoUrl) {
      alert('请填写公司名称并上传Logo图片')
      return
    }

    setSubmitting(true)

    try {
      const url = editingLogo
        ? `/api/admin/partner-logos/${editingLogo.id}`
        : '/api/admin/partner-logos'

      const method = editingLogo ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setIsDialogOpen(false)
        fetchPartnerLogos()
        setFormData(initialFormData)
        setSelectedLogo(null)
      } else {
        const error = await response.json()
        alert(error.error || '保存失败')
      }
    } catch (error) {
      console.error('Failed to save partner logo:', error)
      alert('保存失败')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteLogo = async (logo: PartnerLogo) => {
    if (!confirm(`确定要删除 ${logo.companyName} 的Logo吗？`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/partner-logos/${logo.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchPartnerLogos()
      } else {
        alert('删除失败')
      }
    } catch (error) {
      console.error('Failed to delete partner logo:', error)
      alert('删除失败')
    }
  }

  const handleLogoUpload = (image: any) => {
    setSelectedLogo(image)
    setFormData(prev => ({ ...prev, logoUrl: image.url }))
  }

  const handleLogoRemove = () => {
    setSelectedLogo(null)
    setFormData(prev => ({ ...prev, logoUrl: '' }))
  }

  const headerActions = (
    <>
      <DarkButton variant="primary" onClick={handleCreateLogo}>
        <Plus className="w-4 h-4 mr-2" />
        添加Logo
      </DarkButton>
    </>
  )

  return (
    <DarkThemeWrapper
      title="🤝 合作伙伴Logo管理"
      description="管理合作伙伴公司Logo，支持排序和状态控制"
      loading={loading}
      headerActions={headerActions}
    >
      {/* 搜索框 */}
      <div className="mb-8">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="搜索公司名称..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white/10 border-white/20 text-white placeholder-slate-400 backdrop-blur-sm"
          />
        </div>
      </div>

      {/* Logo列表 */}
      <GlassCard className="p-8">
          <div className="space-y-1">
            {/* 表头 */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent mb-2">
                🤝 合作伙伴Logo库
              </h2>
              <div className="grid grid-cols-12 gap-4 items-center text-sm font-medium text-slate-300 border-b border-white/20 pb-4">
                <div className="col-span-2">Logo预览</div>
                <div className="col-span-3">公司名称</div>
                <div className="col-span-3">网站链接</div>
                <div className="col-span-1">排序</div>
                <div className="col-span-1">状态</div>
                <div className="col-span-2">操作</div>
              </div>
            </div>

            {/* Logo列表 */}
            <div className="space-y-4">
              {partnerLogos.map((logo) => (
                <div key={logo.id} className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 hover:-translate-y-1">
                  <div className="grid grid-cols-12 gap-4 items-center">
                    {/* Logo图片 */}
                    <div className="col-span-2">
                      <div className="relative w-20 h-12 rounded-xl overflow-hidden bg-white/10 border border-white/20 flex items-center justify-center">
                        <img
                          src={logo.logoUrl}
                          alt={logo.companyName}
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                    </div>

                    {/* 公司名称 */}
                    <div className="col-span-3">
                      <h3 className="font-semibold text-white text-lg">{logo.companyName}</h3>
                    </div>

                    {/* 网站链接 */}
                    <div className="col-span-3">
                      {logo.websiteUrl ? (
                        <a
                          href={logo.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-300 hover:text-blue-200 flex items-center space-x-2 text-sm transition-colors"
                        >
                          <span className="truncate">{logo.websiteUrl}</span>
                          <ExternalLink className="w-3 h-3 flex-shrink-0" />
                        </a>
                      ) : (
                        <span className="text-slate-400 text-sm">暂无链接</span>
                      )}
                    </div>

                    {/* 排序 */}
                    <div className="col-span-1">
                      <div className="px-2 py-1 bg-purple-500/20 border border-purple-400/30 text-purple-200 rounded-full text-sm font-medium text-center">
                        #{logo.order}
                      </div>
                    </div>

                    {/* 状态 */}
                    <div className="col-span-1">
                      <div className={`px-3 py-1 rounded-full text-sm font-medium border ${
                        logo.isActive 
                          ? 'bg-green-500/20 border-green-400/30 text-green-200' 
                          : 'bg-gray-500/20 border-gray-400/30 text-gray-300'
                      }`}>
                        {logo.isActive ? '✅ 启用' : '❌ 禁用'}
                      </div>
                    </div>

                    {/* 操作 */}
                    <div className="col-span-2">
                      <div className="flex items-center space-x-2">
                        <DarkButton
                          variant="secondary"
                          size="sm"
                          onClick={() => handleEditLogo(logo)}
                        >
                          <Edit className="w-3 h-3" />
                        </DarkButton>
                        <DarkButton
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteLogo(logo)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </DarkButton>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 空状态 */}
            {partnerLogos.length === 0 && (
              <div className="text-center py-16">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center border border-white/20">
                  <Building2 className="h-10 w-10 text-white/60" />
                </div>
                <p className="text-slate-300 mb-6 text-lg">暂无合作伙伴Logo</p>
                <DarkButton variant="primary" onClick={handleCreateLogo}>
                  <Plus className="w-4 h-4 mr-2" />
                  添加首个Logo
                </DarkButton>
              </div>
            )}
          </div>
        </GlassCard>

      {/* 添加/编辑Logo对话框 */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingLogo ? '编辑合作伙伴Logo' : '添加合作伙伴Logo'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 公司名称 */}
            <div>
              <Label htmlFor="companyName">合作伙伴公司名 *</Label>
              <Input
                id="companyName"
                value={formData.companyName}
                onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                placeholder="输入公司名称"
                className="h-12"
              />
            </div>

            {/* Logo上传 */}
            <div>
              <ImageUpload
                label="Logo图片 *"
                onImageUploaded={handleLogoUpload}
                currentImage={selectedLogo}
                onImageRemoved={handleLogoRemove}
              />
            </div>

            {/* 网站链接 */}
            <div>
              <Label htmlFor="websiteUrl">合作伙伴公司链接</Label>
              <Input
                id="websiteUrl"
                type="url"
                value={formData.websiteUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, websiteUrl: e.target.value }))}
                placeholder="https://example.com"
                className="h-12"
              />
            </div>

            {/* 其他设置 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="order">排序</Label>
                <Input
                  id="order"
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                  className="h-12"
                />
              </div>

              <div className="flex items-center space-x-2 pt-6">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                />
                <Label htmlFor="isActive">启用显示</Label>
              </div>
            </div>

            {/* 提交按钮 */}
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={submitting}
              >
                取消
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? '保存中...' : '保存'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </DarkThemeWrapper>
  )
}
