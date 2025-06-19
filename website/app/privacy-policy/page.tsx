"use client"

import { useState, useEffect, Suspense } from "react"
import { useTranslation } from "react-i18next"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

function PrivacyPolicyContent() {
  const { i18n, ready } = useTranslation()
  const [isClient, setIsClient] = useState(false)
  const searchParams = useSearchParams()

  useEffect(() => {
    setIsClient(true)

    // 检查URL参数中的语言设置
    const urlLang = searchParams.get('lang')
    if (urlLang && (urlLang === 'en' || urlLang === 'zh') && i18n.language !== urlLang) {
      i18n.changeLanguage(urlLang)
    }
  }, [searchParams, i18n])

  // 防止水合错误的安全文本获取函数
  const getText = (zhText: string, enText: string) => {
    if (!isClient || !ready) {
      return zhText
    }
    return i18n.language === 'zh' ? zhText : enText
  }

  const goBack = () => {
    if (window.history.length > 1) {
      window.history.back()
    } else {
      window.location.href = `/contact?lang=${i18n.language}`
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-6 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            onClick={goBack}
            variant="ghost"
            className="mb-4 text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {getText("返回", "Back")}
          </Button>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {getText("隐私政策", "Privacy Policy")}
          </h1>
          <p className="text-gray-600">
            {getText("最后更新：2025年1月", "Last Updated: January 2025")}
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
          {/* 1. 信息收集 */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {getText("1. 信息收集", "1. Information Collection")}
            </h2>
            <div className="text-gray-700 space-y-3">
              <p>
                {getText(
                  "我们收集您主动提供的信息，包括但不限于：",
                  "We collect information that you voluntarily provide to us, including but not limited to:"
                )}
              </p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>{getText("姓名和联系信息", "Name and contact information")}</li>
                <li>{getText("学校和教育背景", "School and educational background")}</li>
                <li>{getText("项目兴趣和偏好", "Program interests and preferences")}</li>
                <li>{getText("通过表单提交的其他信息", "Other information submitted through forms")}</li>
              </ul>
            </div>
          </section>

          {/* 2. 信息使用 */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {getText("2. 信息使用", "2. Information Use")}
            </h2>
            <div className="text-gray-700 space-y-3">
              <p>
                {getText(
                  "我们使用收集的信息用于：",
                  "We use the collected information for:"
                )}
              </p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>{getText("回应您的咨询和请求", "Responding to your inquiries and requests")}</li>
                <li>{getText("提供项目信息和服务", "Providing program information and services")}</li>
                <li>{getText("改善我们的服务质量", "Improving our service quality")}</li>
                <li>{getText("发送相关的教育资讯（需您同意）", "Sending relevant educational information (with your consent)")}</li>
              </ul>
            </div>
          </section>

          {/* 3. 信息保护 */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {getText("3. 信息保护", "3. Information Protection")}
            </h2>
            <div className="text-gray-700 space-y-3">
              <p>
                {getText(
                  "我们采取适当的技术和组织措施来保护您的个人信息，防止未经授权的访问、使用或披露。",
                  "We implement appropriate technical and organizational measures to protect your personal information from unauthorized access, use, or disclosure."
                )}
              </p>
            </div>
          </section>

          {/* 4. 信息共享 */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {getText("4. 信息共享", "4. Information Sharing")}
            </h2>
            <div className="text-gray-700 space-y-3">
              <p>
                {getText(
                  "我们不会向第三方出售、交易或转让您的个人信息，除非：",
                  "We do not sell, trade, or transfer your personal information to third parties, except when:"
                )}
              </p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>{getText("获得您的明确同意", "We have your explicit consent")}</li>
                <li>{getText("法律要求或法律程序需要", "Required by law or legal process")}</li>
                <li>{getText("为了提供您请求的服务", "To provide services you have requested")}</li>
              </ul>
            </div>
          </section>

          {/* 5. Cookie使用 */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {getText("5. Cookie使用", "5. Cookie Usage")}
            </h2>
            <div className="text-gray-700 space-y-3">
              <p>
                {getText(
                  "我们的网站可能使用Cookie来改善用户体验。您可以通过浏览器设置控制Cookie的使用。",
                  "Our website may use cookies to improve user experience. You can control cookie usage through your browser settings."
                )}
              </p>
            </div>
          </section>

          {/* 6. 您的权利 */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {getText("6. 您的权利", "6. Your Rights")}
            </h2>
            <div className="text-gray-700 space-y-3">
              <p>
                {getText(
                  "您有权：",
                  "You have the right to:"
                )}
              </p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>{getText("访问您的个人信息", "Access your personal information")}</li>
                <li>{getText("更正不准确的信息", "Correct inaccurate information")}</li>
                <li>{getText("删除您的个人信息", "Delete your personal information")}</li>
                <li>{getText("撤回同意", "Withdraw consent")}</li>
              </ul>
            </div>
          </section>

          {/* 7. 联系我们 */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {getText("7. 联系我们", "7. Contact Us")}
            </h2>
            <div className="text-gray-700 space-y-3">
              <p>
                {getText(
                  "如果您对本隐私政策有任何问题或疑虑，请通过以下方式联系我们：",
                  "If you have any questions or concerns about this Privacy Policy, please contact us:"
                )}
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p><strong>{getText("邮箱", "Email")}:</strong> Hello@edgoing.com</p>
                <p><strong>{getText("电话", "Phone")}:</strong> 4001153558</p>
                <p><strong>{getText("地址", "Address")}:</strong> {getText("上海市黄埔区黄陂南路838号中海国际B座18楼", "18F, Tower B, 838 South Huangpi Road, Huangpu District, Shanghai")}</p>
              </div>
            </div>
          </section>

          {/* 8. 政策更新 */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {getText("8. 政策更新", "8. Policy Updates")}
            </h2>
            <div className="text-gray-700 space-y-3">
              <p>
                {getText(
                  "我们可能会不时更新本隐私政策。任何重大变更都会在网站上公布，并在适当情况下通过邮件通知您。",
                  "We may update this Privacy Policy from time to time. Any significant changes will be posted on our website and, where appropriate, notified to you by email."
                )}
              </p>
            </div>
          </section>
        </div>

        {/* Footer Actions */}
        <div className="mt-8 text-center">
          <Button
            onClick={goBack}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2"
          >
            {getText("我已阅读并理解", "I Have Read and Understand")}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function PrivacyPolicyPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PrivacyPolicyContent />
    </Suspense>
  )
}
