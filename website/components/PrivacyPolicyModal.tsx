"use client"

import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ExternalLink, X } from "lucide-react"

interface PrivacyPolicyModalProps {
  isOpen: boolean
  onClose: () => void
  onAccept?: () => void
}

export default function PrivacyPolicyModal({ isOpen, onClose, onAccept }: PrivacyPolicyModalProps) {
  const { i18n, ready } = useTranslation()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // 防止水合错误的安全文本获取函数
  const getText = (zhText: string, enText: string) => {
    if (!isClient || !ready) {
      return zhText
    }
    return i18n.language === 'zh' ? zhText : enText
  }

  const openFullPolicy = () => {
    window.open(`/privacy-policy?lang=${i18n.language}`, '_blank')
  }

  const handleAccept = () => {
    if (onAccept) {
      onAccept()
    }
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{getText("隐私政策", "Privacy Policy")}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={openFullPolicy}
              className="text-blue-600 hover:text-blue-800"
            >
              <ExternalLink className="w-4 h-4 mr-1" />
              {getText("查看完整版", "View Full Version")}
            </Button>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6 text-sm">
            {/* 简要说明 */}
            <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
              <h3 className="font-semibold text-blue-900 mb-2">
                {getText("重要提示", "Important Notice")}
              </h3>
              <p className="text-blue-800">
                {getText(
                  "我们重视您的隐私。本政策说明我们如何收集、使用和保护您的个人信息。",
                  "We value your privacy. This policy explains how we collect, use, and protect your personal information."
                )}
              </p>
            </div>

            {/* 信息收集 */}
            <section>
              <h3 className="font-semibold text-gray-900 mb-3">
                {getText("我们收集的信息", "Information We Collect")}
              </h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>{getText("姓名和联系信息", "Name and contact information")}</li>
                <li>{getText("学校和教育背景", "School and educational background")}</li>
                <li>{getText("项目兴趣和偏好", "Program interests and preferences")}</li>
                <li>{getText("通过表单提交的其他信息", "Other information submitted through forms")}</li>
              </ul>
            </section>

            {/* 信息使用 */}
            <section>
              <h3 className="font-semibold text-gray-900 mb-3">
                {getText("信息使用目的", "How We Use Information")}
              </h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>{getText("回应您的咨询和请求", "Responding to your inquiries and requests")}</li>
                <li>{getText("提供项目信息和服务", "Providing program information and services")}</li>
                <li>{getText("改善我们的服务质量", "Improving our service quality")}</li>
                <li>{getText("发送相关的教育资讯（需您同意）", "Sending relevant educational information (with your consent)")}</li>
              </ul>
            </section>

            {/* 信息保护 */}
            <section>
              <h3 className="font-semibold text-gray-900 mb-3">
                {getText("信息保护", "Information Protection")}
              </h3>
              <p className="text-gray-700">
                {getText(
                  "我们采取适当的技术和组织措施来保护您的个人信息，防止未经授权的访问、使用或披露。我们不会向第三方出售您的个人信息。",
                  "We implement appropriate technical and organizational measures to protect your personal information from unauthorized access, use, or disclosure. We do not sell your personal information to third parties."
                )}
              </p>
            </section>

            {/* 您的权利 */}
            <section>
              <h3 className="font-semibold text-gray-900 mb-3">
                {getText("您的权利", "Your Rights")}
              </h3>
              <p className="text-gray-700 mb-2">
                {getText("您有权：", "You have the right to:")}
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>{getText("访问您的个人信息", "Access your personal information")}</li>
                <li>{getText("更正不准确的信息", "Correct inaccurate information")}</li>
                <li>{getText("删除您的个人信息", "Delete your personal information")}</li>
                <li>{getText("撤回同意", "Withdraw consent")}</li>
              </ul>
            </section>

            {/* 联系信息 */}
            <section>
              <h3 className="font-semibold text-gray-900 mb-3">
                {getText("联系我们", "Contact Us")}
              </h3>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-gray-700">
                  <strong>{getText("邮箱", "Email")}:</strong> Hello@edgoing.com
                </p>
                <p className="text-gray-700">
                  <strong>{getText("电话", "Phone")}:</strong> 4001153558
                </p>
              </div>
            </section>

            {/* 最后更新 */}
            <div className="text-xs text-gray-500 pt-4 border-t">
              {getText("最后更新：2025年1月", "Last Updated: January 2025")}
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            {getText("取消", "Cancel")}
          </Button>
          <Button
            onClick={openFullPolicy}
            variant="ghost"
            className="w-full sm:w-auto text-blue-600 hover:text-blue-800"
          >
            {getText("查看完整政策", "View Full Policy")}
          </Button>
          {onAccept && (
            <Button
              onClick={handleAccept}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
            >
              {getText("我已阅读并同意", "I Have Read and Agree")}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
