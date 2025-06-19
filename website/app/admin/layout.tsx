"use client"

import type React from "react"
import { I18nProvider } from "@/components/I18nProvider"
import { ClientLanguageHandler } from "@/components/ClientLanguageHandler"

import { Suspense } from "react"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <I18nProvider>
      <Suspense fallback={null}>
        <ClientLanguageHandler />
      </Suspense>
      {/* 不包含主导航栏 - 管理后台有自己独立的界面 */}
      {children}
    </I18nProvider>
  )
} 