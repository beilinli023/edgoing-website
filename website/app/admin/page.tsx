"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Sparkles, BookOpen, Users } from 'lucide-react'
import { UserMenu } from '@/components/admin/UserMenu'

interface User {
  id: string
  email: string
  username: string
  role: string
  name?: string
}

export default function AdminDashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      } else {
        // Only redirect to login if authentication is not disabled
        if (process.env.NEXT_PUBLIC_DISABLE_AUTH !== 'true') {
          router.push('/admin/login')
        } else {
          console.log('🔓 Authentication disabled - using development mode')
          // Set a mock user for development
          setUser({
            id: 'dev-user-id',
            email: 'dev@edgoing.com',
            username: 'developer',
            role: 'ADMIN',
            name: 'Development User'
          })
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      // Only redirect to login if authentication is not disabled
      if (process.env.NEXT_PUBLIC_DISABLE_AUTH !== 'true') {
        router.push('/admin/login')
      } else {
        console.log('🔓 Authentication disabled - using development mode')
        // Set a mock user for development
        setUser({
          id: 'dev-user-id',
          email: 'dev@edgoing.com',
          username: 'developer',
          role: 'ADMIN',
          name: 'Development User'
        })
      }
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-purple-400 border-b-transparent rounded-full animate-spin animation-delay-150"></div>
          <div className="mt-4 text-center">
            <div className="text-white font-medium text-lg">加载中...</div>
            <div className="text-slate-300 text-sm mt-1">正在初始化管理面板</div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* 动态背景元素 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <main className="relative z-10 max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* 页面标题区域 */}
          <div className="flex items-center justify-between mb-8">
            <div className="text-center flex-1">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent mb-4">
                功能控制面板
              </h2>
              <p className="text-slate-300 text-lg max-w-2xl mx-auto">
                通过强大的管理工具，轻松管理您的教育平台内容，提升用户体验
              </p>
            </div>
            {/* 用户菜单 */}
            <div className="flex-shrink-0">
              {user && <UserMenu user={user} />}
            </div>
          </div>

          {/* 欢迎引导Banner */}
          <div className="mb-8 relative animate-fadeInUp">
              <div className="relative backdrop-blur-lg bg-gradient-to-r from-white/10 via-blue-500/10 to-purple-500/10 rounded-2xl border border-gradient-to-r from-blue-400/30 via-purple-400/30 to-pink-400/30 shadow-2xl overflow-hidden hover:shadow-3xl transition-all duration-500">
                {/* 彩虹渐变边框效果 */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-pink-500/30 rounded-2xl animate-shimmer"></div>
                <div className="absolute inset-[1px] bg-gradient-to-br from-slate-900/90 via-purple-900/90 to-slate-900/90 rounded-2xl"></div>

                {/* 内部发光效果 */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 rounded-2xl"></div>

                <div className="relative p-6 md:p-8">
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                    {/* 左侧图标和主要内容 */}
                    <div className="flex-1">
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                          <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-white mb-1">
                            🎉 欢迎使用 EdGoing 管理系统
                          </h3>
                          <p className="text-blue-200 text-sm">
                            {user?.name ? `欢迎回来，${user.name}` : '欢迎回来，管理员'}
                          </p>
                        </div>
                      </div>

                      <p className="text-slate-300 text-base mb-6 leading-relaxed">
                        这里是您的教育平台指挥中心。选择下方功能模块开始管理您的内容，或查看快速入门指南了解更多功能。
                      </p>

                      {/* 快速开始指南 */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="flex items-center text-sm text-slate-300">
                          <div className="w-6 h-6 bg-blue-500/30 rounded-lg flex items-center justify-center mr-3">
                            <span className="text-blue-300">✨</span>
                          </div>
                          <span><strong className="text-white">主页管理</strong> - 更新精选项目和学员故事</span>
                        </div>
                        <div className="flex items-center text-sm text-slate-300">
                          <div className="w-6 h-6 bg-emerald-500/30 rounded-lg flex items-center justify-center mr-3">
                            <span className="text-emerald-300">📝</span>
                          </div>
                          <span><strong className="text-white">内容管理</strong> - 添加新的游学项目和博客</span>
                        </div>
                        <div className="flex items-center text-sm text-slate-300">
                          <div className="w-6 h-6 bg-purple-500/30 rounded-lg flex items-center justify-center mr-3">
                            <span className="text-purple-300">🎯</span>
                          </div>
                          <span><strong className="text-white">媒体管理</strong> - 上传图片和编辑页面内容</span>
                        </div>
                        <div className="flex items-center text-sm text-slate-300">
                          <div className="w-6 h-6 bg-orange-500/30 rounded-lg flex items-center justify-center mr-3">
                            <span className="text-orange-300">📋</span>
                          </div>
                          <span><strong className="text-white">申请管理</strong> - 查看和处理用户申请</span>
                        </div>
                      </div>
                    </div>

                    {/* 右侧快捷操作按钮 */}
                    <div className="flex flex-col gap-3 min-w-[200px]">
                      <Button
                        className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                        onClick={() => router.push('/admin/homepage-showcase')}
                      >
                        <BookOpen className="w-4 h-4 mr-2" />
                        主页精选项目管理
                      </Button>
                      <Button
                        variant="outline"
                        className="bg-white/10 hover:bg-white/20 text-white border-white/30 hover:border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                        onClick={() => router.push('/admin/applications')}
                      >
                        <Users className="w-4 h-4 mr-2" />
                        查看申请
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          {/* 现代化卡片网格 */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

            {/* 主页管理 - 渐变蓝色主题 */}
            <div className="md:col-span-1 group">
              <div className="relative h-full backdrop-blur-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/10 rounded-2xl border border-blue-400/30 shadow-2xl hover:shadow-blue-500/25 transition-all duration-500 hover:-translate-y-2 hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent rounded-2xl"></div>
                <div className="relative p-6 h-full flex flex-col">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mr-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">主页管理</h3>
                      <p className="text-blue-200 text-sm">首页内容与展示</p>
                    </div>
                  </div>
                  <div className="space-y-3 flex-1">
                    <Button 
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105" 
                      onClick={() => router.push('/admin/homepage-showcase')}
                    >
                      <span className="mr-2">✨</span>
                      主页精选项目管理
                    </Button>
                    <Button 
                      className="w-full bg-blue-500/70 hover:bg-blue-600/70 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105" 
                      onClick={() => router.push('/admin/testimonials')}
                    >
                      <span className="mr-2">👥</span>
                      学员故事库
                    </Button>
                    <Button 
                      className="w-full bg-blue-400/60 hover:bg-blue-500/60 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105" 
                      onClick={() => router.push('/admin/partner-logos')}
                    >
                      <span className="mr-2">🤝</span>
                      合作伙伴Logo
                    </Button>

                  </div>
                </div>
              </div>
            </div>

            {/* 内容管理 - 渐变绿色主题 */}
            <div className="md:col-span-1 group">
              <div className="relative h-full backdrop-blur-lg bg-gradient-to-br from-emerald-500/20 to-green-500/10 rounded-2xl border border-emerald-400/30 shadow-2xl hover:shadow-emerald-500/25 transition-all duration-500 hover:-translate-y-2 hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/10 to-transparent rounded-2xl"></div>
                <div className="relative p-6 h-full flex flex-col">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl flex items-center justify-center mr-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">内容管理</h3>
                      <p className="text-emerald-200 text-sm">核心内容编辑</p>
                    </div>
                  </div>
                  <div className="space-y-3 flex-1">
                    <Button 
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105" 
                      onClick={() => router.push('/admin/international-programs')}
                    >
                      <span className="mr-2">🌍</span>
                      游学国际项目
                    </Button>
                    <Button 
                      className="w-full bg-emerald-500/70 hover:bg-emerald-600/70 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105" 
                      onClick={() => router.push('/admin/china-programs')}
                    >
                      <span className="mr-2">🏛️</span>
                      游学中国项目
                    </Button>
                    <Button 
                      className="w-full bg-emerald-400/60 hover:bg-emerald-500/60 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105" 
                      onClick={() => router.push('/admin/blogs')}
                    >
                      <span className="mr-2">📝</span>
                      博客库
                    </Button>
                    <Button 
                      className="w-full bg-emerald-300/50 hover:bg-emerald-400/50 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105" 
                      onClick={() => router.push('/admin/videos')}
                    >
                      <span className="mr-2">🎬</span>
                      博客视频库
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* 媒体管理 - 渐变紫色主题 */}
            <div className="md:col-span-1 group">
              <div className="relative h-full backdrop-blur-lg bg-gradient-to-br from-purple-500/20 to-pink-500/10 rounded-2xl border border-purple-400/30 shadow-2xl hover:shadow-purple-500/25 transition-all duration-500 hover:-translate-y-2 hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-transparent rounded-2xl"></div>
                <div className="relative p-6 h-full flex flex-col">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mr-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">媒体管理</h3>
                      <p className="text-purple-200 text-sm">多媒体内容</p>
                    </div>
                  </div>
                  <div className="space-y-3 flex-1">
                    <Button 
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105" 
                      onClick={() => router.push('/admin/faqs')}
                    >
                      <span className="mr-2">❓</span>
                      FAQ编辑
                    </Button>
                    <Button 
                      className="w-full bg-purple-500/70 hover:bg-purple-600/70 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105" 
                      onClick={() => router.push('/admin/hero-pages')}
                    >
                      <span className="mr-2">🎯</span>
                      Hero页面管理
                    </Button>
                    <Button 
                      className="w-full bg-purple-400/60 hover:bg-purple-500/60 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105" 
                      onClick={() => router.push('/admin/shared-fields')}
                    >
                      <span className="mr-2">🔧</span>
                      共享字段管理
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* 申请管理 - 渐变橙色主题 */}
            <div className="md:col-span-1 group">
              <div className="relative h-full backdrop-blur-lg bg-gradient-to-br from-orange-500/20 to-yellow-500/10 rounded-2xl border border-orange-400/30 shadow-2xl hover:shadow-orange-500/25 transition-all duration-500 hover:-translate-y-2 hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-600/10 to-transparent rounded-2xl"></div>
                <div className="relative p-6 h-full flex flex-col">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-xl flex items-center justify-center mr-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">申请管理</h3>
                      <p className="text-orange-200 text-sm">用户申请处理</p>
                    </div>
                  </div>
                  <div className="space-y-3 flex-1">
                    <Button 
                      className="w-full bg-orange-600 hover:bg-orange-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105" 
                      onClick={() => router.push('/admin/applications')}
                    >
                      <span className="mr-2">📋</span>
                      查看申请
                    </Button>
                    <Button 
                      className="w-full bg-orange-500/70 hover:bg-orange-600/70 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105" 
                      onClick={() => router.push('/admin/newsletters')}
                    >
                      <span className="mr-2">📧</span>
                      邮件订阅管理
                    </Button>
                    <Button 
                      className="w-full bg-orange-400/60 hover:bg-orange-500/60 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105" 
                      onClick={() => router.push('/admin/email-notifications')}
                    >
                      <span className="mr-2">🔔</span>
                      通知邮箱维护
                    </Button>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* 底部状态栏 */}
          <div className="mt-12 text-center">
            <div className="inline-flex items-center px-6 py-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20 shadow-lg">
              <div className="w-3 h-3 bg-green-400 rounded-full mr-3 animate-pulse"></div>
              <span className="text-white font-medium">系统运行正常</span>
              <span className="text-slate-300 ml-2">• 最后更新：刚刚</span>
            </div>
          </div>
        </div>
      </main>

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
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out;
        }
        .animate-shimmer {
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
          background-size: 200% 100%;
          animation: shimmer 2s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .animation-delay-150 {
          animation-delay: 150ms;
        }
      `}</style>
    </div>
  )
}
