"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Plus, Save, Trash2, Image, Settings } from 'lucide-react'
import HeroImageUpload from '@/components/HeroImageUpload'

interface HeroSlide {
  id: string
  titleZh: string
  titleEn: string
  subtitleZh: string
  subtitleEn: string
  imageUrl: string
  ctaTextZh: string
  ctaTextEn: string
  ctaLink: string
}

interface HeroPage {
  id: string
  pageName: string
  pageType: 'PRIMARY' | 'SECONDARY'
  slides?: HeroSlide[]
  titleZh?: string
  titleEn?: string
  subtitleZh?: string
  subtitleEn?: string
  imageUrl?: string
  isActive: boolean
  order: number
  createdAt: string
  updatedAt: string
  author: {
    id: string
    username: string
    name?: string
  }
}

export default function HeroPagesManagement() {
  const router = useRouter()
  const [heroPages, setHeroPages] = useState<HeroPage[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('primary')

  useEffect(() => {
    fetchHeroPages()
  }, [])

  const fetchHeroPages = async () => {
    try {
      const response = await fetch('/api/admin/hero-pages')
      if (response.ok) {
        const data = await response.json()
        // 解析slides JSON字符串
        const parsedData = data.map((page: any) => ({
          ...page,
          slides: page.slides ? JSON.parse(page.slides) : null
        }))
        setHeroPages(parsedData)
      }
    } catch (error) {
      console.error('Error fetching hero pages:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveHeroPages = async () => {
    setSaving(true)
    try {
      // 准备数据，将slides对象转换为JSON字符串
      const dataToSave = heroPages.map(page => ({
        ...page,
        slides: page.slides ? page.slides : null
      }))

      const response = await fetch('/api/admin/hero-pages', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ heroPages: dataToSave }),
      })

      if (response.ok) {
        alert('保存成功！')
        fetchHeroPages()
      } else {
        alert('保存失败')
      }
    } catch (error) {
      console.error('Error saving hero pages:', error)
      alert('保存失败')
    } finally {
      setSaving(false)
    }
  }

  const updateHeroPage = (id: string, updates: Partial<HeroPage>) => {
    setHeroPages(prev => prev.map(page =>
      page.id === id ? { ...page, ...updates } : page
    ))
  }

  const addNewSlide = (pageId: string) => {
    const newSlide: HeroSlide = {
      id: Date.now().toString(),
      titleZh: '',
      titleEn: '',
      subtitleZh: '',
      subtitleEn: '',
      imageUrl: '',
      ctaTextZh: '',
      ctaTextEn: '',
      ctaLink: ''
    }

    setHeroPages(prev => prev.map(page => {
      if (page.id === pageId && page.pageType === 'PRIMARY') {
        const currentSlides = page.slides || []
        return { ...page, slides: [...currentSlides, newSlide] }
      }
      return page
    }))
  }

  const updateSlide = (pageId: string, slideId: string, updates: Partial<HeroSlide>) => {
    setHeroPages(prev => prev.map(page => {
      if (page.id === pageId && page.slides) {
        return {
          ...page,
          slides: page.slides.map(slide =>
            slide.id === slideId ? { ...slide, ...updates } : slide
          )
        }
      }
      return page
    }))
  }

  const removeSlide = (pageId: string, slideId: string) => {
    setHeroPages(prev => prev.map(page => {
      if (page.id === pageId && page.slides) {
        return {
          ...page,
          slides: page.slides.filter(slide => slide.id !== slideId)
        }
      }
      return page
    }))
  }

  const primaryPages = heroPages.filter(page => page.pageType === 'PRIMARY')
  const secondaryPages = heroPages.filter(page => page.pageType === 'SECONDARY')

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">加载中...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => router.push('/admin')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>返回管理后台</span>
          </Button>
          <h1 className="text-2xl font-bold">Hero页面管理</h1>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="primary" className="flex items-center space-x-2">
            <Image className="h-4 w-4" />
            <span>主页轮播图 ({primaryPages.length})</span>
          </TabsTrigger>
          <TabsTrigger value="secondary" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>二级页面Hero ({secondaryPages.length})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="primary" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>主页轮播图管理</CardTitle>
              <CardDescription>
                管理主页的Hero轮播图，支持多张图片和中英文标题
              </CardDescription>
            </CardHeader>
            <CardContent>
              {primaryPages.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">暂无主页轮播图配置</p>
                  <Button onClick={() => router.push('/admin/hero-pages/create')}>
                    <Plus className="h-4 w-4 mr-2" />
                    创建主页轮播图
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {primaryPages.map((page) => (
                    <Card key={page.id} className="border-2">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{page.pageName}</CardTitle>
                          <div className="flex items-center space-x-2">
                            <Badge variant={page.isActive ? "default" : "secondary"}>
                              {page.isActive ? '启用' : '禁用'}
                            </Badge>
                            <Switch
                              checked={page.isActive}
                              onCheckedChange={(checked) => updateHeroPage(page.id, { isActive: checked })}
                            />
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">轮播图片 ({page.slides?.length || 0})</h4>
                            <div className="flex items-center space-x-2">
                              <Button
                                size="sm"
                                onClick={saveHeroPages}
                                disabled={saving}
                                className="flex items-center space-x-1"
                              >
                                <Save className="h-3 w-3" />
                                <span>{saving ? '保存中...' : '保存所有更改'}</span>
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => addNewSlide(page.id)}
                                className="flex items-center space-x-1"
                              >
                                <Plus className="h-3 w-3" />
                                <span>添加图片</span>
                              </Button>
                            </div>
                          </div>

                          {page.slides && page.slides.length > 0 ? (
                            <div className="space-y-4">
                              {page.slides.map((slide, index) => (
                                <Card key={slide.id} className="border">
                                  <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                      <CardTitle className="text-sm">图片 {index + 1}</CardTitle>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => removeSlide(page.id, slide.id)}
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </CardHeader>
                                  <CardContent className="space-y-3">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <Label>中文标题</Label>
                                        <Input
                                          value={slide.titleZh}
                                          onChange={(e) => updateSlide(page.id, slide.id, { titleZh: e.target.value })}
                                          placeholder="输入中文标题"
                                        />
                                      </div>
                                      <div>
                                        <Label>英文标题</Label>
                                        <Input
                                          value={slide.titleEn}
                                          onChange={(e) => updateSlide(page.id, slide.id, { titleEn: e.target.value })}
                                          placeholder="Enter English title"
                                        />
                                      </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <Label>中文副标题</Label>
                                        <Input
                                          value={slide.subtitleZh}
                                          onChange={(e) => updateSlide(page.id, slide.id, { subtitleZh: e.target.value })}
                                          placeholder="输入中文副标题"
                                        />
                                      </div>
                                      <div>
                                        <Label>英文副标题</Label>
                                        <Input
                                          value={slide.subtitleEn}
                                          onChange={(e) => updateSlide(page.id, slide.id, { subtitleEn: e.target.value })}
                                          placeholder="Enter English subtitle"
                                        />
                                      </div>
                                    </div>
                                    <div>
                                      <HeroImageUpload
                                        label="轮播图片"
                                        currentImageUrl={slide.imageUrl}
                                        onImageUploaded={(imageUrl) => updateSlide(page.id, slide.id, { imageUrl })}
                                        onImageRemoved={() => updateSlide(page.id, slide.id, { imageUrl: '' })}
                                        aspectRatio="banner"
                                      />
                                    </div>
                                    <div className="grid grid-cols-3 gap-4">
                                      <div>
                                        <Label>中文按钮文字</Label>
                                        <Input
                                          value={slide.ctaTextZh}
                                          onChange={(e) => updateSlide(page.id, slide.id, { ctaTextZh: e.target.value })}
                                          placeholder="了解更多"
                                        />
                                      </div>
                                      <div>
                                        <Label>英文按钮文字</Label>
                                        <Input
                                          value={slide.ctaTextEn}
                                          onChange={(e) => updateSlide(page.id, slide.id, { ctaTextEn: e.target.value })}
                                          placeholder="Learn More"
                                        />
                                      </div>
                                      <div>
                                        <Label>按钮链接</Label>
                                        <Input
                                          value={slide.ctaLink}
                                          onChange={(e) => updateSlide(page.id, slide.id, { ctaLink: e.target.value })}
                                          placeholder="/programs"
                                        />
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-4 text-gray-500">
                              暂无轮播图片，点击上方按钮添加
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="secondary" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>二级页面Hero管理</CardTitle>
                  <CardDescription>
                    管理各个二级页面的Hero图片和标题
                  </CardDescription>
                </div>
                {secondaryPages.length > 0 && (
                  <Button
                    size="sm"
                    onClick={saveHeroPages}
                    disabled={saving}
                    className="flex items-center space-x-1"
                  >
                    <Save className="h-3 w-3" />
                    <span>{saving ? '保存中...' : '保存所有更改'}</span>
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {secondaryPages.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">暂无二级页面Hero配置</p>
                  <Button onClick={() => router.push('/admin/hero-pages/create')}>
                    <Plus className="h-4 w-4 mr-2" />
                    创建二级页面Hero
                  </Button>
                </div>
              ) : (
                <div className="grid gap-6">
                  {secondaryPages.map((page) => (
                    <Card key={page.id} className="border-2">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{page.pageName}</CardTitle>
                          <div className="flex items-center space-x-2">
                            <Badge variant={page.isActive ? "default" : "secondary"}>
                              {page.isActive ? '启用' : '禁用'}
                            </Badge>
                            <Switch
                              checked={page.isActive}
                              onCheckedChange={(checked) => updateHeroPage(page.id, { isActive: checked })}
                            />
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>中文标题</Label>
                            <Input
                              value={page.titleZh || ''}
                              onChange={(e) => updateHeroPage(page.id, { titleZh: e.target.value })}
                              placeholder="输入中文标题"
                            />
                          </div>
                          <div>
                            <Label>英文标题</Label>
                            <Input
                              value={page.titleEn || ''}
                              onChange={(e) => updateHeroPage(page.id, { titleEn: e.target.value })}
                              placeholder="Enter English title"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>中文副标题</Label>
                            <Textarea
                              value={page.subtitleZh || ''}
                              onChange={(e) => updateHeroPage(page.id, { subtitleZh: e.target.value })}
                              placeholder="输入中文副标题"
                              rows={3}
                            />
                          </div>
                          <div>
                            <Label>英文副标题</Label>
                            <Textarea
                              value={page.subtitleEn || ''}
                              onChange={(e) => updateHeroPage(page.id, { subtitleEn: e.target.value })}
                              placeholder="Enter English subtitle"
                              rows={3}
                            />
                          </div>
                        </div>
                        <div>
                          <HeroImageUpload
                            label="Hero背景图片"
                            currentImageUrl={page.imageUrl}
                            onImageUploaded={(imageUrl) => updateHeroPage(page.id, { imageUrl })}
                            onImageRemoved={() => updateHeroPage(page.id, { imageUrl: '' })}
                            aspectRatio="hero"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>显示顺序</Label>
                            <Input
                              type="number"
                              value={page.order}
                              onChange={(e) => updateHeroPage(page.id, { order: parseInt(e.target.value) || 0 })}
                              placeholder="0"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
