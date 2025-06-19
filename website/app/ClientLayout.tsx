"use client"

import type React from "react"
import Navbar from "@/components/Navbar"
import { I18nProvider } from "@/components/I18nProvider"
import { ClientLanguageHandler } from "@/components/ClientLanguageHandler"

import { Toaster } from "@/components/ui/toaster"
import { Suspense } from "react"
import { usePathname } from "next/navigation"

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  // 检查是否为管理后台路径，如果是则不显示主导航栏
  const isAdminRoute = pathname?.startsWith('/admin')

  return (
    <I18nProvider>
      <Suspense fallback={null}>
        <ClientLanguageHandler />
      </Suspense>
      {/* 只在非管理后台页面显示主导航栏 */}
      {!isAdminRoute && <Navbar />}
      {children}
      <Toaster />
    </I18nProvider>
  )
}