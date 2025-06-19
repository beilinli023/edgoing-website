"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { useSearchParams } from "next/navigation"
import { useTranslation } from "react-i18next"
import { useProvinces } from "@/hooks/useProvinces"
import { useToast } from "@/hooks/use-toast"
import PrivacyPolicyModal from "./PrivacyPolicyModal"

const roles = [
  { value: "student", key: "contact.form.fields.role.student" },
  { value: "parent", key: "contact.form.fields.role.parent" },
  { value: "teacher", key: "contact.form.fields.role.teacher" },
  { value: "administrator", key: "contact.form.fields.role.administrator" },
  { value: "consultant", key: "contact.form.fields.role.consultant" },
  { value: "other", key: "contact.form.fields.role.other" }
]





// 这些将从CMS共享字段动态获取
// const gradeOptions = ["Elementary", "Middle School", "High School", "University", "Professional"]
// const preferredDestinations = ["USA", "UK", "Canada", "Australia", "New Zealand", "Japan", "Singapore", "Other"]
// const learningInterests = [...]

export default function ContactForm() {
  const { i18n, ready } = useTranslation()
  const { toast } = useToast()
  const searchParams = useSearchParams()

  // 防止水合错误的客户端状态
  const [isClient, setIsClient] = useState(false)

  // 客户端初始化
  useEffect(() => {
    setIsClient(true)

    // 检查URL参数中的语言设置
    const urlLang = searchParams.get('lang')
    if (urlLang && (urlLang === 'en' || urlLang === 'zh') && i18n.language !== urlLang) {
      i18n.changeLanguage(urlLang)
    }
  }, [searchParams, i18n])

  // 省市数据
  const { provinces, loading: provincesLoading, getCitiesByProvince } = useProvinces(i18n.language === 'en' ? 'en' : 'zh')

  // 共享字段数据状态
  const [sharedFields, setSharedFields] = useState({
    programTypes: [] as any[],
    gradeLevels: [] as any[],
    countries: [] as any[]
  })
  const [fieldsLoading, setFieldsLoading] = useState(true)

  // 获取共享字段数据
  useEffect(() => {
    const fetchSharedFields = async () => {
      try {
        setFieldsLoading(true)

        // 获取所有共享字段数据
        const response = await fetch('/api/shared-fields')
        const data = await response.json()

        setSharedFields({
          programTypes: data.programTypes || [],
          gradeLevels: data.gradeLevels || [],
          countries: data.countries || []
        })


      } catch (error) {
        console.error('Error fetching shared fields:', error)
        // 使用默认值作为后备
        setSharedFields({
          programTypes: [],
          gradeLevels: [],
          countries: []
        })
      } finally {
        setFieldsLoading(false)
      }
    }

    fetchSharedFields()
  }, [])



  // 防止水合错误的安全文本获取函数
  const getText = (fallback: string, fallbackEn?: string) => {
    if (!isClient || !ready) {
      // 服务器端和客户端水合前都返回中文，保持一致性
      return fallback
    }
    return i18n.language === 'en' ? (fallbackEn || fallback) : fallback
  }

  // 获取字段名称（支持双语）
  const getFieldName = (item: any) => {
    if (!isClient || !ready) {
      // 服务器端和客户端水合前都返回中文名称，保持一致性
      return item.name
    }
    if (i18n.language === 'en' && item.nameEn) {
      return item.nameEn
    }
    return item.name
  }

  // 排序函数：确保"其他"选项在最后
  const sortWithOthersLast = (items: any[]) => {
    return items.sort((a, b) => {
      const aName = getFieldName(a).toLowerCase()
      const bName = getFieldName(b).toLowerCase()

      // 检查是否为"其他"相关的选项
      const aIsOther = aName.includes('other') || aName.includes('其他') || aName.includes('others')
      const bIsOther = bName.includes('other') || bName.includes('其他') || bName.includes('others')

      if (aIsOther && !bIsOther) return 1
      if (!aIsOther && bIsOther) return -1

      // 如果都不是"其他"或都是"其他"，按字母顺序排序
      return aName.localeCompare(bName)
    })
  }

  // 从共享字段生成选项数组
  const gradeOptions = sortWithOthersLast(sharedFields.gradeLevels.filter(level => level.isActive !== false))
  const preferredDestinations = sortWithOthersLast(sharedFields.countries.filter(country => country.isActive !== false))
  const learningInterests = sortWithOthersLast(sharedFields.programTypes.filter(type => type.isActive !== false))



  const [formData, setFormData] = useState({
    role: "",
    schoolName: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    grade: "",
    province: "",
    city: "",
    destinations: [] as string[],
    learningInterests: [] as string[],
    message: "",
    consent: true, // 默认勾选
    privacyConsent: true, // 默认勾选
  })

  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (searchParams.get("scroll") === "form" && formRef.current) {
      setTimeout(() => {
        formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
      }, 100)
    }
  }, [searchParams])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
      ...(name === "province" ? { city: "" } : {}), // Reset city when province changes
    }))
  }

  const handleMultiSelect = (name: "destinations" | "learningInterests", value: string) => {
    setFormData((prev) => {
      const currentValues = prev[name]
      if (currentValues.includes(value)) {
        return { ...prev, [name]: currentValues.filter((v) => v !== value) }
      } else {
        return { ...prev, [name]: [...currentValues, value] }
      }
    })
  }

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPrivacyModal, setShowPrivacyModal] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/contact/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        // 显示成功的toast消息
        toast({
          description: getText("提交成功", "Submitted successfully"),
          variant: "default",
        })

        // Reset form
        setFormData({
          role: "",
          schoolName: "",
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          grade: "",
          province: "",
          city: "",
          destinations: [] as string[],
          learningInterests: [] as string[],
          message: "",
          consent: true, // 重置后默认勾选
          privacyConsent: true, // 重置后默认勾选
        })
      } else {
        // 显示错误的toast消息
        toast({
          title: getText("提交失败", "Submission failed"),
          description: data.error || getText("发生错误，请重试", "An error occurred, please try again"),
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Form submission error:', error)
      toast({
        title: getText("提交失败", "Submission failed"),
        description: getText("发生错误，请重试", "An error occurred, please try again"),
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }



  return (
    <form ref={formRef} id="contact-form" onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-6 pt-8">
      <div className="mb-6">
        <p className="text-gray-600 space-y-2 text-center">
          <span className="block">{getText("需要帮助或有任何问题想咨询我们？", "Need help with assistance, or just have a question for us?")}</span>
          <span className="block">{getText("填写我们的表单，我们将在2个工作日内回复您。", "Fill out our form and we'll respond within 2 business days.")}</span>
          <span className="block">
            {getText("或致电联系我们 @", "Or Call Us @")} <span className="text-gray-600">4001153558</span>
          </span>
        </p>
      </div>


      <div className="space-y-6">
        {/* Role Selection */}
        <div>
          <label className="block text-sm font-medium mb-2">{getText("您的身份*", "Your Role*")}</label>
          <Select value={formData.role} onValueChange={(value) => setFormData((prev) => ({ ...prev, role: value }))}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={getText("请选择您的身份", "Select your role")} />
            </SelectTrigger>
            <SelectContent>
              {roles.map((role) => (
                <SelectItem key={role.value} value={role.value}>
                  {getText(
                    role.value === "student" ? "学生" :
                    role.value === "parent" ? "家长" :
                    role.value === "teacher" ? "教师" :
                    role.value === "administrator" ? "学校管理员" :
                    role.value === "consultant" ? "教育顾问" :
                    "其他",
                    role.value === "student" ? "Student" :
                    role.value === "parent" ? "Parent" :
                    role.value === "teacher" ? "Teacher" :
                    role.value === "administrator" ? "School Administrator" :
                    role.value === "consultant" ? "Educational Consultant" :
                    "Other"
                  )}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Name Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium mb-2">
              {getText("名字*", "First Name*")}
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg"
              placeholder={getText("请输入您的名字", "Enter your first name")}
              required
            />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium mb-2">
              {getText("姓氏*", "Last Name*")}
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg"
              placeholder={getText("请输入您的姓氏", "Enter your last name")}
              required
            />
          </div>
        </div>

        {/* Contact Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              {getText("邮箱地址*", "Email Address*")}
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg"
              placeholder={getText("请输入您的邮箱地址", "Enter your email address")}
              required
            />
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium mb-2">
              {getText("联系电话*", "Phone Number*")}
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg"
              placeholder={getText("请输入您的联系电话", "Enter your phone number")}
              required
            />
          </div>
        </div>

        {/* School Name */}
        <div>
          <label htmlFor="schoolName" className="block text-sm font-medium mb-2">
            {getText("学校名称", "School Name")}
          </label>
          <Input
            type="text"
            id="schoolName"
            name="schoolName"
            value={formData.schoolName}
            onChange={handleChange}
            className="w-full"
            placeholder={getText("请输入您的学校名称", "Enter your school name")}
          />
        </div>

        {/* Grade/Education Level */}
        <div>
          <label className="block text-sm font-medium mb-2">{getText("年级/学历*", "Grade/Education Level*")}</label>
          <Select value={formData.grade} onValueChange={(value) => setFormData((prev) => ({ ...prev, grade: value }))}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={getText("请选择您的年级/学历", "Select your grade/education level")} />
            </SelectTrigger>
            <SelectContent>
              {fieldsLoading ? (
                <SelectItem value="loading" disabled>{getText("加载中...", "Loading...")}</SelectItem>
              ) : gradeOptions.length > 0 ? (
                gradeOptions.map((grade) => (
                  <SelectItem key={grade.id} value={grade.id}>
                    {getFieldName(grade)}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-options" disabled>{getText("暂无选项", "No options available")}</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Province and City Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">{getText("省份", "Province/State")}</label>
            <Select
              value={formData.province}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, province: value, city: "" }))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={getText("请选择您的省份", "Select your province/state")} />
              </SelectTrigger>
              <SelectContent className="max-h-[200px]">
                {provincesLoading ? (
                  <SelectItem value="loading" disabled>{getText("加载中...", "Loading...")}</SelectItem>
                ) : provinces.length > 0 ? (
                  provinces.map((province) => (
                    <SelectItem key={province.id} value={province.id}>
                      {province.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-options" disabled>{getText("暂无选项", "No options available")}</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">{getText("城市", "City")}</label>
            <Select
              value={formData.city}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, city: value }))}
              disabled={!formData.province}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={getText("请选择您的城市", "Select your city")} />
              </SelectTrigger>
              <SelectContent className="max-h-[200px]">
                {formData.province ? (
                  getCitiesByProvince(formData.province).map((city) => (
                    <SelectItem key={city.id} value={city.id}>
                      {city.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-province" disabled>{getText("请先选择省份", "Please select province first")}</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Preferred Destinations */}
        <div>
          <label className="block text-sm font-medium mb-2">{getText("意向目的地 (多选)", "Preferred Destinations (Multiple)")}</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {fieldsLoading ? (
              <div className="text-gray-500">{getText("加载中...", "Loading...")}</div>
            ) : preferredDestinations.length > 0 ? (
              preferredDestinations.map((destination) => (
                <div key={destination.id} className="flex items-center">
                  <Checkbox
                    id={`destination-${destination.id}`}
                    checked={formData.destinations.includes(destination.id)}
                    onCheckedChange={() => handleMultiSelect("destinations", destination.id)}
                  />
                  <label htmlFor={`destination-${destination.id}`} className="ml-2 text-sm">
                    {getFieldName(destination)}
                  </label>
                </div>
              ))
            ) : (
              <div className="text-gray-500">{getText("暂无选项", "No options available")}</div>
            )}
          </div>
        </div>

        {/* Learning Interests */}
        <div>
          <label className="block text-sm font-medium mb-2">{getText("学习兴趣*", "Learning Interests*")}</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {fieldsLoading ? (
              <div className="text-gray-500">{getText("加载中...", "Loading...")}</div>
            ) : learningInterests.length > 0 ? (
              learningInterests.map((interest) => (
                <div key={interest.id} className="flex items-center">
                  <Checkbox
                    id={`learning-${interest.id}`}
                    checked={formData.learningInterests.includes(interest.id)}
                    onCheckedChange={() => handleMultiSelect("learningInterests", interest.id)}
                  />
                  <label htmlFor={`learning-${interest.id}`} className="ml-2 text-sm">
                    {getFieldName(interest)}
                  </label>
                </div>
              ))
            ) : (
              <div className="text-gray-500">{getText("暂无选项", "No options available")}</div>
            )}
          </div>
        </div>

        {/* Message */}
        <div>
          <label htmlFor="message" className="block text-sm font-medium mb-2">
            {getText("留言", "Message")}
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows={4}
            className="w-full p-3 border rounded-lg"
            placeholder={getText("请告诉我们您的需求和问题...", "Please tell us your needs and questions...")}
          />
        </div>

        {/* Consent Checkbox */}
        <div className="flex items-start gap-2">
          <Checkbox
            id="consent"
            checked={formData.consent}
            onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, consent: checked as boolean }))}
          />
          <label htmlFor="consent" className="text-sm text-gray-600">
            {getText("我同意接收EdGoing的项目信息和更新", "I agree to receive program information and updates from EdGoing")}
          </label>
        </div>

        {/* Privacy Policy Consent Checkbox */}
        <div className="flex items-start gap-2">
          <Checkbox
            id="privacyConsent"
            checked={formData.privacyConsent}
            onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, privacyConsent: checked as boolean }))}
            required
          />
          <label htmlFor="privacyConsent" className="text-sm text-gray-600">
            {getText("我已阅读并同意", "I have read and agree to the")}{" "}
            <button
              type="button"
              onClick={() => setShowPrivacyModal(true)}
              className="text-blue-600 hover:text-blue-800 underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded"
            >
              {getText("隐私政策", "Privacy Policy")}
            </button>
            {" "}
            <span className="text-gray-500">
              ({getText("点击查看", "Click to view")})
            </span>
          </label>
        </div>
      </div>

      <Button
        type="submit"
        size="lg"
        className="w-full md:w-auto bg-blue-600 hover:bg-blue-700"
        disabled={isSubmitting || !formData.privacyConsent}
      >
        {isSubmitting
          ? getText("提交中...", "Submitting...")
          : getText("提交申请", "Submit Application")
        }
      </Button>

      {/* Privacy Policy Modal */}
      <PrivacyPolicyModal
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
        onAccept={() => {
          setFormData((prev) => ({ ...prev, privacyConsent: true }))
          setShowPrivacyModal(false)
        }}
      />
    </form>
  )
}
