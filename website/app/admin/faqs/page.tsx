"use client"

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, Plus, Edit, Trash2, Search, Eye, EyeOff, Languages } from 'lucide-react'

interface FAQ {
  id: string
  question: string
  answer: string
  category?: string
  isActive: boolean
  order: number
  createdAt: string
  updatedAt: string
  author: {
    id: string
    name: string
    email: string
  }
  translations?: Array<{
    id: string
    language: string
    question: string
    answer: string
  }>
  faq_translations?: Array<{
    id: string
    language: string
    question: string
    answer: string
  }>
}

interface FormData {
  question: string
  answer: string
  isActive: boolean
  order: number
  questionEn: string
  answerEn: string
}

export default function FAQManagementPage() {
  const router = useRouter()
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null)
  const [currentLanguage, setCurrentLanguage] = useState<'zh' | 'en'>('zh')
  const [formData, setFormData] = useState<FormData>({
    question: '',
    answer: '',
    isActive: true,
    order: 0,
    questionEn: '',
    answerEn: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const editFormRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchFAQs()
  }, [])

  const fetchFAQs = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)

      const response = await fetch(`/api/admin/faqs?${params}`)
      if (response.ok) {
        const data = await response.json()
        setFaqs(data.faqs)
      } else {
        console.error('Failed to fetch FAQs')
      }
    } catch (error) {
      console.error('Error fetching FAQs:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchFAQs()
    }, 300)
    return () => clearTimeout(timeoutId)
  }, [searchTerm])

  const handleCreateFaq = () => {
    setEditingFaq(null)
    setFormData({
      question: '',
      answer: '',
      isActive: true,
      order: 0,
      questionEn: '',
      answerEn: '',
    })
    setIsDialogOpen(true)
  }

  const handleEditFaq = (faq: FAQ) => {
    setEditingFaq(faq)
    const translations = faq.translations || faq.faq_translations || []
    const enTranslation = translations.find(t => t.language === 'en')
    setFormData({
      question: faq.question,
      answer: faq.answer,
      isActive: faq.isActive,
      order: faq.order,
      questionEn: enTranslation?.question || '',
      answerEn: enTranslation?.answer || '',
    })
    setIsDialogOpen(true)

    // 滚动到编辑表单
    setTimeout(() => {
      editFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 100)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.question || !formData.answer) {
      alert('请填写问题和答案')
      return
    }

    setSubmitting(true)
    try {
      const url = editingFaq ? `/api/admin/faqs/${editingFaq.id}` : '/api/admin/faqs'
      const method = editingFaq ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await fetchFAQs()
        setIsDialogOpen(false)
        setEditingFaq(null)
      } else {
        const error = await response.json()
        alert(error.error || '操作失败')
      }
    } catch (error) {
      console.error('Error submitting FAQ:', error)
      alert('操作失败')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteFaq = async (faq: FAQ) => {
    if (!confirm(`确定要删除FAQ "${faq.question}" 吗？`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/faqs/${faq.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchFAQs()
      } else {
        const error = await response.json()
        alert(error.error || '删除失败')
      }
    } catch (error) {
      console.error('Error deleting FAQ:', error)
      alert('删除失败')
    }
  }

  // 获取当前语言下的FAQ内容
  const getCurrentLanguageContent = (faq: FAQ) => {
    if (currentLanguage === 'en') {
      const translations = faq.translations || faq.faq_translations || []
      const enTranslation = translations.find(t => t.language === 'en')
      if (enTranslation) {
        return {
          question: enTranslation.question,
          answer: enTranslation.answer
        }
      }
    }
    return {
      question: faq.question,
      answer: faq.answer
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 页面标题和操作 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => router.push('/admin')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>返回</span>
          </Button>
          <h1 className="text-2xl font-bold">FAQ编辑</h1>
        </div>
        <div className="flex items-center space-x-2">
          {/* 语言切换按钮 */}
          <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
            <Button
              variant={currentLanguage === 'zh' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setCurrentLanguage('zh')}
              className="h-8 px-3"
            >
              中文
            </Button>
            <Button
              variant={currentLanguage === 'en' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setCurrentLanguage('en')}
              className="h-8 px-3"
            >
              English
            </Button>
          </div>
          <Button onClick={handleCreateFaq} className="flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>添加FAQ</span>
          </Button>
        </div>
      </div>

      {/* 当前语言指示 */}
      <div className="mb-4">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Languages className="w-4 h-4" />
          <span>当前查看: {currentLanguage === 'zh' ? '中文内容' : '英文内容'}</span>
          {currentLanguage === 'en' && (
            <span className="text-amber-600">（如无英文翻译将显示中文内容）</span>
          )}
        </div>
      </div>

      {/* 搜索 */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="搜索FAQ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* FAQ列表 */}
      <div className="grid gap-4">
        {loading ? (
          <div className="text-center py-8">加载中...</div>
        ) : faqs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">暂无FAQ</div>
        ) : (
          faqs.map((faq) => {
            const content = getCurrentLanguageContent(faq)
            const translations = faq.translations || faq.faq_translations || []
            const hasEnTranslation = translations.some(t => t.language === 'en')

            return (
              <Card key={faq.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">
                        {content.question}
                        {currentLanguage === 'en' && !hasEnTranslation && (
                          <span className="ml-2 text-sm text-amber-600 font-normal">
                            (显示中文内容)
                          </span>
                        )}
                      </CardTitle>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={faq.isActive ? "default" : "secondary"}>
                          {faq.isActive ? (
                            <>
                              <Eye className="w-3 h-3 mr-1" />
                              已发布
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3 h-3 mr-1" />
                              已隐藏
                            </>
                          )}
                        </Badge>
                        <span className="text-sm text-gray-500">排序: {faq.order}</span>
                        {hasEnTranslation && (
                          <Badge variant="outline" className="text-xs">
                            <Languages className="w-3 h-3 mr-1" />
                            双语
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditFaq(faq)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteFaq(faq)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-2">{content.answer}</p>
                  <div className="text-sm text-gray-400">
                    创建时间: {new Date(faq.createdAt).toLocaleString('zh-CN')}
                    {translations && translations.length > 0 && (
                      <span className="ml-4">
                        翻译: {translations.map(t => t.language).join(', ')}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {/* 编辑对话框 */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" ref={editFormRef}>
          <DialogHeader>
            <DialogTitle>
              {editingFaq ? '编辑FAQ' : '添加FAQ'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Tabs defaultValue="zh" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="zh">中文</TabsTrigger>
                <TabsTrigger value="en">English</TabsTrigger>
              </TabsList>

              <TabsContent value="zh" className="space-y-4">
                <div>
                  <Label htmlFor="question">问题 *</Label>
                  <Input
                    id="question"
                    value={formData.question}
                    onChange={(e) => setFormData(prev => ({ ...prev, question: e.target.value }))}
                    placeholder="输入问题"
                    className="h-12"
                  />
                </div>

                <div>
                  <Label htmlFor="answer">答案 *</Label>
                  <Textarea
                    id="answer"
                    value={formData.answer}
                    onChange={(e) => setFormData(prev => ({ ...prev, answer: e.target.value }))}
                    placeholder="输入答案"
                    className="min-h-[120px]"
                  />
                </div>
              </TabsContent>

              <TabsContent value="en" className="space-y-4">
                <div>
                  <Label htmlFor="questionEn">Question</Label>
                  <Input
                    id="questionEn"
                    value={formData.questionEn}
                    onChange={(e) => setFormData(prev => ({ ...prev, questionEn: e.target.value }))}
                    placeholder="Enter question in English"
                    className="h-12"
                  />
                </div>

                <div>
                  <Label htmlFor="answerEn">Answer</Label>
                  <Textarea
                    id="answerEn"
                    value={formData.answerEn}
                    onChange={(e) => setFormData(prev => ({ ...prev, answerEn: e.target.value }))}
                    placeholder="Enter answer in English"
                    className="min-h-[120px]"
                  />
                </div>
              </TabsContent>
            </Tabs>

            {/* 其他设置 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="order">排序</Label>
                <Input
                  id="order"
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                  placeholder="排序数字"
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
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={submitting}
              >
                取消
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? '保存中...' : (editingFaq ? '更新' : '创建')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
