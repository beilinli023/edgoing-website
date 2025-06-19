"use client"

import { useState, useEffect } from "react"
import { Button } from "./ui/button"
import Link from "next/link"
import { useTranslation } from "react-i18next"

const CallToAction = () => {
  const { t, ready } = useTranslation()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const getText = (key: string, fallback: string) => {
    if (!isClient || !ready) return fallback
    try {
      return t(key) || fallback
    } catch {
      return fallback
    }
  }
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          {getText("cta.title", "准备开始您的旅程？")}
        </h2>
        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
          {getText("cta.subtitle", "迈出国际教育冒险的第一步。我们的团队将帮助您找到完美的项目。")}
        </p>
        <Link href="/contact">
          <Button
            size="lg"
            className="bg-yellow-500 hover:bg-yellow-600 text-black px-12 py-3 text-lg rounded-md font-medium"
          >
            {getText("cta.button", "开始咨询")}
          </Button>
        </Link>
      </div>
    </section>
  )
}

export default CallToAction
