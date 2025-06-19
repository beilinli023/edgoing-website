"use client"

import { useState, useEffect } from "react"
import CMSPageHero from "@/components/CMSPageHero"
import FAQSection from "@/components/FAQSection"
import CtaSection from "@/components/CtaSection"
import Footer from "@/components/Footer"
import { useTranslation } from "react-i18next"

export default function FAQPage() {
  const { i18n, ready } = useTranslation()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // 防止水合错误的安全文本获取函数
  const getText = (zhText: string, enText: string) => {
    if (!isClient || !ready) {
      // 服务器端和客户端水合前都返回中文，保持一致性
      return zhText
    }
    return i18n.language === 'zh' ? zhText : enText
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <CMSPageHero
        pageName="faq"
        fallbackTitle={getText("常见问题", "Frequently Asked Questions")}
        fallbackDescription={getText(
          "查找关于我们游学项目、活动和服务的常见问题答案。",
          "Find answers to common questions about our study abroad programs, activities, and services."
        )}
        fallbackBackgroundImage="/uploads/1749482112471-c1mnfqm9tyq.jpg"
      />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-16">
          <FAQSection />
        </div>
      </main>
      <CtaSection />
      <Footer />
    </div>
  )
}
