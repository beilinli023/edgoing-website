"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useTranslation } from "react-i18next"
import { useContent } from "@/hooks/useContent"

const AboutHero = () => {
  const { t, ready } = useTranslation()
  const { getContent } = useContent()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const getText = (key: string, fallback: string) => {
    // 优先从数据库获取内容，如果没有则使用 i18n
    const dbContent = getContent(key)
    if (dbContent) return dbContent

    if (!isClient || !ready) return fallback
    try {
      return t(key) || fallback
    } catch {
      return fallback
    }
  }

  return (
    <div className="relative h-[500px] w-full overflow-hidden">
      <Image
        src="/uploads/1749482112470-limd1eseua.jpg"
        alt={getText("about.hero.title", "关于EdGoing")}
        fill
        className="object-cover object-center"
        priority
      />
      <div className="absolute inset-0 bg-black/30" />
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4 md:px-8 max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{getText("about.hero.title", "关于EdGoing")}</h1>
        <p className="text-lg md:text-xl text-white/90">{getText("about.hero.subtitle", "赋能国际教育文化交流")}</p>
      </div>
    </div>
  )
}

export default AboutHero
