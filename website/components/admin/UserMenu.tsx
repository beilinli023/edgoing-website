"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, User } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface UserMenuProps {
  user: {
    id: string
    email: string
    username: string
    role: string
    name?: string
  }
}

export function UserMenu({ user }: UserMenuProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      // 调用登出API
      await fetch('/api/auth/logout', {
        method: 'POST',
      })
    } catch (error) {
      console.error('Logout error:', error)
    }

    // 无论API调用是否成功，都直接重定向到登录页面
    router.push('/admin/login')
  }

  return (
    <div className="flex items-center space-x-3">
      {/* 用户信息显示 */}
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
          <User className="w-4 h-4 text-white" />
        </div>
        <div className="hidden md:block text-left">
          <div className="text-sm font-medium text-white">
            {user.name || user.username}
          </div>
          <div className="text-xs text-slate-300">
            {user.role === 'ADMIN' ? '管理员' : '编辑者'}
          </div>
        </div>
      </div>

      {/* 登出按钮 */}
      <Button
        onClick={handleLogout}
        disabled={isLoggingOut}
        className="bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-lg flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <LogOut className="w-4 h-4" />
        <span className="hidden sm:block">{isLoggingOut ? '登出中...' : '登出'}</span>
      </Button>
    </div>
  )
}
