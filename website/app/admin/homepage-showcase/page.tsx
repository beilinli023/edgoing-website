"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Plus, Edit, Trash2, Eye, EyeOff, ArrowUp, ArrowDown, RefreshCw, AlertTriangle } from "lucide-react"
import { useTranslation } from "react-i18next"

interface HomepageShowcase {
  id: string
  position: number
  programType: string
  programSlug: string
  titleZh?: string
  titleEn?: string
  programTypeZh?: string
  programTypeEn?: string
  cityZh?: string
  cityEn?: string
  isActive: boolean
  order: number
  createdAt: string
  updatedAt: string
  users: {
    id: string
    username: string
    name?: string
  }
}

interface Program {
  id: string
  title: string
  slug: string
  description: string
  featuredImage?: string
  type: string
  typeLabel: string
  city: string
  cityDisplay: string
  link: string
}

const HomepageShowcasePage = () => {
  const router = useRouter()
  const { i18n } = useTranslation()
  const [showcases, setShowcases] = useState<HomepageShowcase[]>([])
  const [availablePrograms, setAvailablePrograms] = useState<Program[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [syncResult, setSyncResult] = useState<any>(null)

  useEffect(() => {
    fetchShowcases()
    fetchAvailablePrograms()
  }, [i18n.language])

  const fetchShowcases = async () => {
    try {
      const response = await fetch('/api/admin/homepage-showcase')
      if (response.ok) {
        const data = await response.json()
        setShowcases(data)
      } else {
        setError('获取首页展示项目失败')
      }
    } catch (error) {
      console.error('Error fetching showcases:', error)
      setError('获取首页展示项目失败')
    } finally {
      setLoading(false)
    }
  }

  const fetchAvailablePrograms = async () => {
    try {
      const response = await fetch(`/api/admin/homepage-showcase/available-programs?language=${i18n.language}`)
      if (response.ok) {
        const data = await response.json()
        setAvailablePrograms(data.programs)
      }
    } catch (error) {
      console.error('Error fetching available programs:', error)
    }
  }

  const toggleActive = async (id: string, currentActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/homepage-showcase/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isActive: !currentActive
        }),
      })

      if (response.ok) {
        await fetchShowcases()
      } else {
        setError('更新状态失败')
      }
    } catch (error) {
      console.error('Error toggling active status:', error)
      setError('更新状态失败')
    }
  }

  const deleteShowcase = async (id: string) => {
    if (!confirm('确定要删除这个首页展示项目吗？')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/homepage-showcase/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchShowcases()
      } else {
        setError('删除失败')
      }
    } catch (error) {
      console.error('Error deleting showcase:', error)
      setError('删除失败')
    }
  }

  const syncSlugs = async () => {
    setSyncing(true)
    setSyncResult(null)
    setError('')

    try {
      const response = await fetch('/api/admin/homepage-showcase/sync-slugs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const result = await response.json()
        setSyncResult(result)
        if (result.results.fixed > 0) {
          await fetchShowcases() // 重新加载数据
          await fetchAvailablePrograms()
        }
      } else {
        const errorData = await response.json()
        setError(errorData.message || '同步失败')
      }
    } catch (error) {
      console.error('Error syncing slugs:', error)
      setError('同步失败')
    } finally {
      setSyncing(false)
    }
  }

  const getProgramInfo = (showcase: HomepageShowcase) => {
    const program = availablePrograms.find(p =>
      p.slug === showcase.programSlug && p.type === showcase.programType
    )

    return {
      title: i18n.language === 'zh'
        ? (showcase.titleZh || program?.title || showcase.programSlug)
        : (showcase.titleEn || program?.title || showcase.programSlug),
      type: i18n.language === 'zh'
        ? (showcase.programTypeZh || program?.typeLabel || showcase.programType)
        : (showcase.programTypeEn || program?.typeLabel || showcase.programType),
      city: i18n.language === 'zh'
        ? (showcase.cityZh || program?.city || '')
        : (showcase.cityEn || program?.city || ''),
      image: program?.featuredImage || '/placeholder-program.jpg',
      link: program?.link || '#'
    }
  }

  const getAvailablePositions = () => {
    const usedPositions = showcases.map(s => s.position)
    const positions = []
    for (let i = 1; i <= 6; i++) {
      if (!usedPositions.includes(i)) {
        positions.push(i)
      }
    }
    return positions
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* 动态背景效果 */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute top-40 left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>
        
        <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-white/20 border-t-blue-500 rounded-full animate-spin"></div>
              <div className="mt-4 text-lg text-white">加载中...</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* 动态背景效果 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* 玻璃态顶部导航 */}
      <header className="relative z-10 backdrop-blur-md bg-white/10 border-b border-white/20 shadow-2xl">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
        <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                主页精选项目管理
              </h1>
              <p className="text-slate-300 mt-2">管理首页展示的精选项目（最多6个）</p>
        </div>
        <div className="flex items-center space-x-4">
          <Button
            onClick={syncSlugs}
            disabled={syncing}
                className="bg-white/10 hover:bg-white/20 text-white border border-white/30 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-lg"
          >
            {syncing ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            {syncing ? '同步中...' : '同步项目'}
          </Button>
          <Button
            onClick={() => setShowAddForm(true)}
            disabled={showcases.length >= 6}
                className="bg-blue-600 hover:bg-blue-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <Plus className="h-4 w-4 mr-2" />
            添加精选项目
          </Button>
          <Button
            onClick={() => router.push('/admin')}
                className="bg-white/10 hover:bg-white/20 text-white border border-white/30 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-lg"
          >
            返回管理后台
          </Button>
        </div>
      </div>
        </div>
      </header>

      <main className="relative z-10 container mx-auto px-4 py-8">

      {error && (
          <div className="backdrop-blur-lg bg-red-500/20 border border-red-400/30 text-red-200 px-6 py-4 rounded-2xl mb-6 shadow-2xl">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 flex-shrink-0" />
              <span className="font-medium">{error}</span>
            </div>
        </div>
      )}

      {syncResult && (
          <div className={`backdrop-blur-lg border px-6 py-4 rounded-2xl mb-6 shadow-2xl ${
          syncResult.results.fixed > 0
              ? 'bg-green-500/20 border-green-400/30 text-green-200'
            : syncResult.results.errors > 0
              ? 'bg-yellow-500/20 border-yellow-400/30 text-yellow-200'
              : 'bg-blue-500/20 border-blue-400/30 text-blue-200'
        }`}>
          <div className="flex items-start space-x-2">
            <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <div>
                <p className="font-medium text-white">{syncResult.message}</p>
              {syncResult.results.details && syncResult.results.details.length > 0 && (
                  <details className="mt-3">
                    <summary className="cursor-pointer text-sm text-slate-300 hover:text-white transition-colors">查看详细信息</summary>
                    <div className="mt-3 space-y-2 text-sm">
                    {syncResult.results.details.map((detail: any, index: number) => (
                        <div key={index} className={`p-3 rounded-xl backdrop-blur-sm ${
                          detail.status === 'fixed' ? 'bg-green-400/20 border border-green-400/30' :
                          detail.status === 'error' ? 'bg-red-400/20 border border-red-400/30' : 'bg-white/10 border border-white/20'
                      }`}>
                          <span className="font-medium text-white">位置 #{detail.position}:</span>
                          <span className="ml-2 text-slate-300">{detail.message}</span>
                      </div>
                    ))}
                  </div>
                </details>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 当前展示项目 */}
      <div className="grid gap-6">
        {showcases.length === 0 ? (
            <div className="backdrop-blur-lg bg-white/5 border border-white/20 rounded-2xl shadow-2xl">
              <div className="text-center py-16">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center border border-white/20">
                  <Plus className="h-10 w-10 text-white/60" />
                </div>
                <p className="text-slate-300 mb-6 text-lg">暂无首页精选项目</p>
              <Button
                onClick={() => setShowAddForm(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <Plus className="h-4 w-4 mr-2" />
                添加第一个精选项目
              </Button>
              </div>
            </div>
        ) : (
          showcases
            .sort((a, b) => a.position - b.position)
            .map((showcase) => {
              const programInfo = getProgramInfo(showcase)
              return (
                  <div key={showcase.id} className="backdrop-blur-lg bg-white/5 border border-white/20 rounded-2xl shadow-2xl hover:shadow-blue-500/25 transition-all duration-500 hover:-translate-y-1">
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                          <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-xl font-bold text-lg shadow-lg">
                          位置 {showcase.position}
                          </div>
                          <div className={`px-3 py-1 rounded-full text-sm font-medium border ${
                            showcase.isActive 
                              ? 'bg-green-500/20 border-green-400/30 text-green-200' 
                              : 'bg-gray-500/20 border-gray-400/30 text-gray-300'
                          }`}>
                            {showcase.isActive ? "✅ 显示中" : "⏸️ 已隐藏"}
                          </div>
                          <div className="bg-blue-500/20 border border-blue-400/30 text-blue-200 px-3 py-1 rounded-full text-sm font-medium">
                          {programInfo.type}
                          </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          onClick={() => toggleActive(showcase.id, showcase.isActive)}
                            className="bg-white/10 hover:bg-white/20 text-white border border-white/30 backdrop-blur-sm transition-all duration-300 hover:scale-105"
                        >
                          {showcase.isActive ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => setEditingId(showcase.id)}
                            className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 border border-blue-400/30 backdrop-blur-sm transition-all duration-300 hover:scale-105"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => deleteShowcase(showcase.id)}
                            className="bg-red-500/20 hover:bg-red-500/30 text-red-200 border border-red-400/30 backdrop-blur-sm transition-all duration-300 hover:scale-105"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                                        
                    <div className="flex items-start space-x-6">
                        <div className="w-48 h-32 bg-white/10 rounded-xl overflow-hidden flex-shrink-0 border border-white/20">
                        <img
                          src={programInfo.image}
                          alt={programInfo.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-grow">
                          <h3 className="text-xl font-semibold text-white mb-3">
                          {programInfo.title}
                        </h3>
                          <div className="space-y-2">
                            <p className="text-slate-300">
                              <span className="text-blue-300 font-medium">项目类型：</span>{programInfo.type}
                        </p>
                        {programInfo.city && (
                              <p className="text-slate-300">
                                <span className="text-purple-300 font-medium">城市：</span>{programInfo.city}
                          </p>
                        )}
                            <p className="text-sm text-slate-400">
                              <span className="text-cyan-300 font-medium">项目标识：</span>{showcase.programSlug}
                        </p>
                            <p className="text-sm text-slate-400">
                              <span className="text-green-300 font-medium">更新时间：</span>{new Date(showcase.updatedAt).toLocaleString('zh-CN')}
                        </p>
                      </div>
                    </div>
                      </div>
                    </div>
                  </div>
              )
            })
        )}
      </div>
      </main>

      {/* CSS动画样式 */}
      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>

      {/* 添加表单弹出窗口 */}
      <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>添加精选项目</DialogTitle>
            <DialogDescription>
              选择要在首页展示的项目
            </DialogDescription>
          </DialogHeader>
          <AddShowcaseForm
            availablePrograms={availablePrograms}
            availablePositions={getAvailablePositions()}
            showcases={showcases}
            onSuccess={() => {
              setShowAddForm(false)
              fetchShowcases()
            }}
            onCancel={() => setShowAddForm(false)}
          />
        </DialogContent>
      </Dialog>

      {/* 编辑表单 */}
      {editingId && (
        <EditShowcaseForm
          showcase={showcases.find(s => s.id === editingId)!}
          availablePrograms={availablePrograms}
          onSuccess={() => {
            setEditingId(null)
            fetchShowcases()
          }}
          onCancel={() => setEditingId(null)}
        />
      )}
    </div>
  )
}

// 添加表单组件
const AddShowcaseForm = ({
  availablePrograms,
  availablePositions,
  showcases,
  onSuccess,
  onCancel
}: {
  availablePrograms: Program[]
  availablePositions: number[]
  showcases: HomepageShowcase[]
  onSuccess: () => void
  onCancel: () => void
}) => {
  const { i18n } = useTranslation()
  const [formData, setFormData] = useState({
    position: availablePositions[0] || 1,
    programType: '',
    programSlug: '',
    titleZh: '',
    titleEn: '',
    programTypeZh: '',
    programTypeEn: '',
    cityZh: '',
    cityEn: '',
    isActive: true
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // 获取已选择的项目slugs
  const selectedProgramSlugs = showcases.map(s => s.programSlug)

  const filteredPrograms = availablePrograms.filter(p =>
    (!formData.programType || p.type === formData.programType)
  )

  // 检查项目是否已被选择
  const isProgramSelected = (slug: string) => selectedProgramSlugs.includes(slug)

  const selectedProgram = availablePrograms.find(p =>
    p.slug === formData.programSlug && p.type === formData.programType
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.programType || !formData.programSlug) {
      setError('请选择项目类型和具体项目')
      return
    }

    // 检查项目是否已被选择
    if (isProgramSelected(formData.programSlug)) {
      setError('该项目已在首页展示，请选择其他项目')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/admin/homepage-showcase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        onSuccess()
      } else {
        const errorData = await response.json()
        setError(errorData.error || '添加失败')
      }
    } catch (error) {
      console.error('Error adding showcase:', error)
      setError('添加失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 位置选择 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            显示位置 *
          </label>
          <select
            value={formData.position}
            onChange={(e) => setFormData({...formData, position: parseInt(e.target.value)})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            required
          >
            {availablePositions.map(pos => (
              <option key={pos} value={pos}>位置 {pos}</option>
            ))}
          </select>
        </div>

        {/* 项目类型选择 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            项目类型 *
          </label>
          <select
            value={formData.programType}
            onChange={(e) => setFormData({
              ...formData,
              programType: e.target.value,
              programSlug: '' // 重置项目选择
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            required
          >
            <option value="">请选择项目类型</option>
            <option value="china">游学中国</option>
            <option value="international">游学国际</option>
          </select>
        </div>
      </div>

      {/* 具体项目选择 */}
      {formData.programType && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            选择项目 *
            <span className="text-sm text-gray-500 font-normal">
              (已选择的项目将显示为灰色且不可选)
            </span>
          </label>
          <select
            value={formData.programSlug}
            onChange={(e) => setFormData({...formData, programSlug: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            required
          >
            <option value="">请选择具体项目</option>
            {filteredPrograms.map(program => {
              const isSelected = isProgramSelected(program.slug)
              return (
                <option
                  key={program.slug}
                  value={program.slug}
                  disabled={isSelected}
                  style={isSelected ? { color: '#9CA3AF', backgroundColor: '#F3F4F6' } : {}}
                >
                  {program.title} - {program.cityDisplay}
                  {isSelected ? ' (已选择)' : ''}
                </option>
              )
            })}
          </select>

          {/* 显示已选择的项目提示 */}
          {formData.programType && selectedProgramSlugs.length > 0 && (
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <h5 className="text-sm font-medium text-blue-800 mb-2">
                已在首页展示的{formData.programType === 'china' ? '中国' : '国际'}项目：
              </h5>
              <div className="space-y-1">
                {showcases
                  .filter(s => s.programType === formData.programType)
                  .sort((a, b) => a.position - b.position)
                  .map(showcase => {
                    const program = availablePrograms.find(p =>
                      p.slug === showcase.programSlug && p.type === showcase.programType
                    )
                    return (
                      <div key={showcase.id} className="text-sm text-blue-700">
                        位置{showcase.position}: {program?.title || showcase.programSlug}
                      </div>
                    )
                  })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 项目预览 */}
      {selectedProgram && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">项目预览</h4>
          <div className="flex items-start space-x-4">
            <div className="w-24 h-16 bg-gray-200 rounded overflow-hidden flex-shrink-0">
              <img
                src={selectedProgram.featuredImage || '/placeholder-program.jpg'}
                alt={selectedProgram.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="font-medium">{selectedProgram.title}</p>
              <p className="text-sm text-gray-600">{selectedProgram.typeLabel}</p>
              <p className="text-sm text-gray-600">{selectedProgram.cityDisplay}</p>
            </div>
          </div>
        </div>
      )}

      {/* 自定义字段 */}
      <div className="border-t pt-6">
        <h4 className="font-medium text-gray-900 mb-4">自定义显示内容（可选）</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              自定义中文标题
            </label>
            <input
              type="text"
              value={formData.titleZh}
              onChange={(e) => setFormData({...formData, titleZh: e.target.value})}
              placeholder="留空使用项目原标题"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              自定义英文标题
            </label>
            <input
              type="text"
              value={formData.titleEn}
              onChange={(e) => setFormData({...formData, titleEn: e.target.value})}
              placeholder="留空使用项目原标题"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          取消
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="bg-orange-600 hover:bg-orange-700"
        >
          {loading ? '添加中...' : '添加项目'}
        </Button>
      </div>
    </form>
  )
}

// 编辑表单组件
const EditShowcaseForm = ({
  showcase,
  availablePrograms,
  onSuccess,
  onCancel
}: {
  showcase: HomepageShowcase
  availablePrograms: Program[]
  onSuccess: () => void
  onCancel: () => void
}) => {
  const { i18n } = useTranslation()
  const [formData, setFormData] = useState({
    position: showcase.position,
    programType: showcase.programType,
    programSlug: showcase.programSlug,
    titleZh: showcase.titleZh || '',
    titleEn: showcase.titleEn || '',
    programTypeZh: showcase.programTypeZh || '',
    programTypeEn: showcase.programTypeEn || '',
    cityZh: showcase.cityZh || '',
    cityEn: showcase.cityEn || '',
    isActive: showcase.isActive
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const selectedProgram = availablePrograms.find(p =>
    p.slug === formData.programSlug && p.type === formData.programType
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/admin/homepage-showcase/${showcase.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        onSuccess()
      } else {
        const errorData = await response.json()
        setError(errorData.error || '更新失败')
      }
    } catch (error) {
      console.error('Error updating showcase:', error)
      setError('更新失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="mt-8 border-blue-200">
      <CardHeader>
        <CardTitle>编辑精选项目</CardTitle>
        <CardDescription>修改项目的显示设置</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* 项目信息显示 */}
          {selectedProgram && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">当前项目</h4>
              <div className="flex items-start space-x-4">
                <div className="w-24 h-16 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                  <img
                    src={selectedProgram.featuredImage || '/placeholder-program.jpg'}
                    alt={selectedProgram.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="font-medium">{selectedProgram.title}</p>
                  <p className="text-sm text-gray-600">{selectedProgram.typeLabel}</p>
                  <p className="text-sm text-gray-600">{selectedProgram.cityDisplay}</p>
                  <p className="text-sm text-gray-500">位置：{formData.position}</p>
                </div>
              </div>
            </div>
          )}

          {/* 自定义字段 */}
          <div>
            <h4 className="font-medium text-gray-900 mb-4">自定义显示内容</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  自定义中文标题
                </label>
                <input
                  type="text"
                  value={formData.titleZh}
                  onChange={(e) => setFormData({...formData, titleZh: e.target.value})}
                  placeholder="留空使用项目原标题"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  自定义英文标题
                </label>
                <input
                  type="text"
                  value={formData.titleEn}
                  onChange={(e) => setFormData({...formData, titleEn: e.target.value})}
                  placeholder="留空使用项目原标题"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  自定义中文项目类型
                </label>
                <input
                  type="text"
                  value={formData.programTypeZh}
                  onChange={(e) => setFormData({...formData, programTypeZh: e.target.value})}
                  placeholder="留空使用默认类型"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  自定义英文项目类型
                </label>
                <input
                  type="text"
                  value={formData.programTypeEn}
                  onChange={(e) => setFormData({...formData, programTypeEn: e.target.value})}
                  placeholder="留空使用默认类型"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  自定义中文城市
                </label>
                <input
                  type="text"
                  value={formData.cityZh}
                  onChange={(e) => setFormData({...formData, cityZh: e.target.value})}
                  placeholder="留空使用项目原城市"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  自定义英文城市
                </label>
                <input
                  type="text"
                  value={formData.cityEn}
                  onChange={(e) => setFormData({...formData, cityEn: e.target.value})}
                  placeholder="留空使用项目原城市"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* 状态设置 */}
          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">在首页显示</span>
            </label>
          </div>

          <div className="flex items-center justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              取消
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? '更新中...' : '更新项目'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

export default HomepageShowcasePage
