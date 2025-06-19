"use client"

import { Suspense } from "react"
import CMSPageHero from "@/components/CMSPageHero"
import ContactForm from "@/components/ContactForm"
import Footer from "@/components/Footer"
import { useTranslation } from "react-i18next"
import { useContent } from "@/hooks/useContent"

export default function ContactPage() {
  const { t, ready } = useTranslation()
  const { getContent } = useContent()

  const getText = (key: string, fallback: string) => {
    // 优先从数据库获取内容，如果没有则使用 i18n
    const dbContent = getContent(key)
    if (dbContent) return dbContent

    if (!ready) return fallback
    try {
      return t(key) || fallback
    } catch {
      return fallback
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <CMSPageHero
        pageName="contact"
        fallbackTitle={getText("contact.hero.title", "联系我们")}
        fallbackDescription={getText("contact.hero.description", "有任何问题或需要帮助？我们随时为您服务")}
        fallbackBackgroundImage="/uploads/1749482112470-rw98e9pzpos.jpg"
      />
      <div className="flex-grow bg-white py-16">
        <div className="container mx-auto px-4">
          <Suspense fallback={
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400"></div>
            </div>
          }>
            <ContactForm />
          </Suspense>
        </div>
      </div>
      <Footer />
    </div>
  )
}
