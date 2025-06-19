"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useTranslation } from "react-i18next"

const CtaSection = () => {
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
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
          {getText('还有其他问题？', 'Still Have Questions?')}
        </h2>
        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
          {getText(
            '如果您没有找到问题的答案，请随时联系我们。我们的顾问随时为您解答任何疑问。',
            "If you couldn't find the answer to your question, don't hesitate to reach out to us directly. Our advisors are here to help you with any inquiries you may have."
          )}
        </p>
        <Link href="/contact">
          <Button size="lg" className="bg-[#B5B568] hover:bg-[#B5B568]/90 text-white px-12 py-3 text-lg rounded-full">
            {getText('咨询顾问', 'Ask An Advisor')}
          </Button>
        </Link>
      </div>
    </section>
  )
}

export default CtaSection
