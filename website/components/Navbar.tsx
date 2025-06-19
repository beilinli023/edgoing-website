"use client"

import { useState, useEffect, Suspense } from "react"
import { Menu, X } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"
import { useTranslation } from "react-i18next"
import { useContent } from "@/hooks/useContent"
import { LanguageSwitcher } from "./LanguageSwitcher"

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)
  const pathname = usePathname()
  const { t, ready, i18n } = useTranslation()
  const { getContent } = useContent()

  // Track hydration to prevent SSR mismatch
  useEffect(() => {
    setIsHydrated(true)
  }, [])

  const isActive = (path: string) => {
    return pathname === path
  }

  const navLinks = [
    { href: "/", key: "nav.home", fallbackZh: "首页", fallbackEn: "Home" },
    { href: "/programs", key: "nav.programs", fallbackZh: "游学国际", fallbackEn: "Study Abroad" },
    { href: "/study-china", key: "nav.studyChina", fallbackZh: "游学中国", fallbackEn: "Study in China" },
    { href: "/about", key: "nav.about", fallbackZh: "关于EdGoing", fallbackEn: "About EdGoing" },
    { href: "/blog", key: "nav.blog", fallbackZh: "博客", fallbackEn: "Blog" },
    { href: "/contact", key: "nav.contact", fallbackZh: "开始项目", fallbackEn: "Start Project" },
  ]

  const getNavText = (key: string, fallbackZh: string, fallbackEn: string) => {
    // 优先从数据库获取内容，如果没有则使用 i18n
    const dbContent = getContent(key)
    if (dbContent) return dbContent

    // During SSR or before hydration, return English to match default language
    if (!isHydrated || !ready) {
      return fallbackEn
    }

    try {
      const translation = t(key)
      // If translation returns the key itself (meaning no translation found), use fallback
      if (translation === key) {
        return i18n.language === 'en' ? fallbackEn : fallbackZh
      }
      return translation || (i18n.language === 'en' ? fallbackEn : fallbackZh)
    } catch {
      return i18n.language === 'en' ? fallbackEn : fallbackZh
    }
  }

  return (
    <nav className="bg-white h-16 flex items-center justify-between px-4 lg:px-8 border-b border-gray-200 relative z-50">
      <Link href="/" className="flex items-center">
        <div className="h-10 w-40 relative">
          <Image
            src="/ico/1.png"
            alt="EdGoing - EXPLORE. LEARN. GROW"
            fill
            className="object-cover object-center"
            priority
          />
        </div>
      </Link>

      {/* Desktop Navigation */}
      <div className="hidden lg:flex items-center justify-center flex-1 mx-4">
        <div className="flex items-center justify-between w-full max-w-4xl">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`transition-all duration-200 text-base ${
                isActive(link.href) ? "text-[#00A0E9] font-medium" : "text-black hover:text-[#00A0E9]"
              } ${
                link.href === "/contact"
                  ? "px-4 py-2 rounded-full border border-black/40 hover:bg-black/5 hover:border-black"
                  : "px-3 py-2 hover:bg-black/5 rounded-md"
              }`}
            >
              <span className="whitespace-nowrap">{getNavText(link.key, link.fallbackZh, link.fallbackEn)}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center space-x-4">
        <Suspense fallback={<div className="w-16 h-8" />}>
          <LanguageSwitcher />
        </Suspense>
        <button
          className="lg:hidden text-gray-700 hover:text-[#00A0E9] transition-colors"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="absolute top-16 left-0 right-0 bg-white border-b border-gray-200 py-2 px-4 lg:hidden">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`block py-2 text-base transition-colors ${
                isActive(link.href) ? "text-[#00A0E9] font-medium" : "text-gray-700 hover:text-[#00A0E9]"
              } ${link.href === "/contact" ? "mt-2 text-center border border-gray-300 rounded-full py-2" : ""}`}
              onClick={() => setIsMenuOpen(false)}
            >
              {getNavText(link.key, link.fallbackZh, link.fallbackEn)}
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}

export default Navbar
