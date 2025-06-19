import React from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { UserMenu } from './UserMenu'

interface DarkThemeWrapperProps {
  title: string
  description: string
  children: React.ReactNode
  loading?: boolean
  headerActions?: React.ReactNode
  showBackButton?: boolean
  backPath?: string
  user?: {
    id: string
    email: string
    username: string
    role: string
    name?: string
  }
}

export function DarkThemeWrapper({
  title,
  description,
  children,
  loading = false,
  headerActions,
  showBackButton = true,
  backPath = '/admin',
  user
}: DarkThemeWrapperProps) {
  const router = useRouter()

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* 动态背景效果 */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute top-40 left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>
        
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-white/20 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-white text-lg">加载中...</p>
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
                {title}
              </h1>
              <p className="text-slate-300 mt-2">{description}</p>
            </div>
            <div className="flex items-center space-x-4">
              {headerActions}
              {showBackButton && (
                <Button
                  onClick={() => router.push(backPath)}
                  className="bg-white/10 hover:bg-white/20 text-white border border-white/30 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-lg"
                >
                  返回管理后台
                </Button>
              )}
              {user && <UserMenu user={user} />}
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 container mx-auto px-4 py-8">
        {children}
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
    </div>
  )
}

// 通知消息组件
export function NotificationMessage({ 
  type, 
  message, 
  onClose 
}: { 
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  onClose?: () => void 
}) {
  const typeStyles = {
    success: 'bg-green-500/20 border-green-400/30 text-green-200',
    error: 'bg-red-500/20 border-red-400/30 text-red-200',
    warning: 'bg-yellow-500/20 border-yellow-400/30 text-yellow-200',
    info: 'bg-blue-500/20 border-blue-400/30 text-blue-200'
  }

  const icons = {
    success: (
      <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    ),
    error: (
      <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
    ),
    warning: (
      <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
    ),
    info: (
      <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
      </svg>
    )
  }

  return (
    <div className={`backdrop-blur-lg border px-6 py-4 rounded-2xl mb-6 shadow-2xl ${typeStyles[type]}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {icons[type]}
          <span className="font-medium text-white">{message}</span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors ml-4"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}

// 玻璃态卡片组件
export function GlassCard({ 
  children, 
  className = '',
  onClick
}: { 
  children: React.ReactNode
  className?: string
  onClick?: () => void
}) {
  return (
    <div 
      className={`backdrop-blur-lg bg-white/5 border border-white/20 rounded-2xl shadow-2xl hover:shadow-blue-500/25 transition-all duration-500 hover:-translate-y-1 ${className} ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

// 统一按钮样式
export function DarkButton({ 
  variant = 'primary',
  size = 'default',
  children,
  className = '',
  ...props
}: {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning'
  size?: 'sm' | 'default' | 'lg'
  children: React.ReactNode
  className?: string
  [key: string]: any
}) {
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-white/10 hover:bg-white/20 text-white border border-white/30',
    success: 'bg-green-600 hover:bg-green-700 text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    warning: 'bg-yellow-600 hover:bg-yellow-700 text-white'
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    default: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  }

  return (
    <Button
      className={`${variants[variant]} ${sizes[size]} backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 rounded-lg ${className}`}
      {...props}
    >
      {children}
    </Button>
  )
} 