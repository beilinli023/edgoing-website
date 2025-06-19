"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useTranslation } from "react-i18next"

const NewsletterSignup = () => {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [isClient, setIsClient] = useState(false)
  const { t, ready, i18n } = useTranslation()

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")
    setError("")

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          language: i18n.language,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage(data.message)
        setEmail("")
      } else {
        setError(data.error || (i18n.language === 'zh' ? '订阅失败' : 'Subscription failed'))
      }
    } catch (error) {
      setError(i18n.language === 'zh' ? '网络错误，请重试' : 'Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="py-16 bg-gradient-to-br from-blue-900 via-blue-700 to-blue-500">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          {getText("newsletter.title", "订阅我们的最新消息")}
        </h2>
        <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
          {getText("newsletter.subtitle", "订阅我们的电子邮件，及时了解最新的项目、旅行机会和教育资讯。")}
        </p>

        {message && (
          <div className="max-w-md mx-auto mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            {message}
          </div>
        )}

        {error && (
          <div className="max-w-md mx-auto mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="max-w-md mx-auto flex gap-4">
          <Input
            type="email"
            placeholder={getText("newsletter.placeholder", "输入您的邮箱地址")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 bg-white border-0 text-gray-900"
            required
            disabled={loading}
          />
          <Button
            type="submit"
            className="bg-yellow-500 hover:bg-yellow-600 text-black px-8 h-12 rounded-md font-medium text-base"
            disabled={loading}
          >
            {loading ? "..." : getText("newsletter.button", "订阅")}
          </Button>
        </form>
      </div>
    </section>
  )
}

export default NewsletterSignup
