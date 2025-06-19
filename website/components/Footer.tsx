"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useTranslation } from "react-i18next"

const Footer = () => {
  const { i18n, ready } = useTranslation()
  const [isClient, setIsClient] = useState(false)
  const [showImageModal, setShowImageModal] = useState(false)
  const [currentImage, setCurrentImage] = useState('')

  const handleImageClick = (e: React.MouseEvent, imagePath: string) => {
    e.preventDefault()
    setCurrentImage(imagePath)
    setShowImageModal(true)
    return false
  }

  const closeModal = () => {
    setShowImageModal(false)
    setCurrentImage('')
  }

  useEffect(() => {
    setIsClient(true)
  }, [])

  // 硬编码的双语内容
  const getHardcodedText = (type: string) => {
    if (!isClient || !ready) {
      // SSR期间默认返回中文
      return hardcodedContent.zh[type as keyof typeof hardcodedContent.zh] || ''
    }

    const lang = i18n.language === 'en' ? 'en' : 'zh'
    return hardcodedContent[lang][type as keyof typeof hardcodedContent.zh] || ''
  }

  const hardcodedContent = {
    zh: {
      navigation: "导航",
      contactUs: "联系我们",
      followUs: "关注我们",
      callUs: "电话",
      email: "邮箱",
      address: "地址",
      locations: "上海 | 新加坡",
      shanghai: "上海",
      shanghaiAddress: "上海市黄埔区黄陂南路838号",
      shanghaiDistrict: "中海国际B座18楼",
      singapore: "新加坡",
      singaporeAddress: "9 Kelantan Lane #06-01",
      singaporePostal: "Singapore 208628",
      followDescription: "通过社交媒体关注我们，了解最新动态和教育资讯",
      copyright: "2025 引里信息咨询（上海）有限公司 版权所有",
      navHome: "首页",
      navWorldStudy: "游学国际",
      navChinaStudy: "游学中国",
      navBlog: "博客",
      navAbout: "关于EdGoing",
      navFaq: "常见问题",
      navContact: "开始项目"
    },
    en: {
      navigation: "Navigation",
      contactUs: "Contact Us",
      followUs: "Follow Us",
      callUs: "Call Us",
      email: "Email",
      address: "Address",
      locations: "Shanghai | Singapore",
      shanghai: "Shanghai",
      shanghaiAddress: "Room 1801, Building B, Zhonghai International Center",
      shanghaiDistrict: "No.838 Huangpi South Road, Huangpu District, Shanghai 200025",
      singapore: "Singapore",
      singaporeAddress: "9 Kelantan Lane #06-01",
      singaporePostal: "Singapore 208628",
      followDescription: "Follow us on social media for the latest updates and educational insights",
      copyright: "2025 Yinli Information Consulting (Shanghai) Co., Ltd. All rights reserved.",
      navHome: "Home",
      navWorldStudy: "Study Abroad",
      navChinaStudy: "Study in China",
      navBlog: "Blog",
      navAbout: "About EdGoing",
      navFaq: "FAQ",
      navContact: "Start Project"
    }
  }

  const navLinks = [
    { href: "/", textKey: "navHome" },
    { href: "/programs", textKey: "navWorldStudy" },
    { href: "/study-china", textKey: "navChinaStudy" },
    { href: "/blog", textKey: "navBlog" },
    { href: "/about", textKey: "navAbout" },
    { href: "/faq", textKey: "navFaq" },
    { href: "/contact", textKey: "navContact" },
  ]

  return (
    <footer className="bg-white text-gray-700 py-12">
      <div className="container mx-auto px-6 md:px-8 lg:px-16 xl:px-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 lg:gap-16 xl:gap-20">
          {/* Navigation Column */}
          <div>
            <h3 className="text-lg font-bold mb-6 text-gray-900">{getHardcodedText("navigation")}</h3>
            <div className="space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block text-gray-600 hover:text-blue-600 transition-colors"
                >
                  {getHardcodedText(link.textKey)}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact Us Column */}
          <div>
            <h3 className="text-lg font-bold mb-6 text-gray-900">{getHardcodedText("contactUs")}</h3>
            <div className="space-y-3">
              <div>
                <span className="text-gray-600">{getHardcodedText("callUs")}: </span>
                <a href="tel:4001153558" className="text-blue-600 hover:underline">
                  4001153558
                </a>
              </div>
              <div>
                <span className="text-gray-600">{getHardcodedText("email")}: </span>
                <a href="mailto:Hello@edgoing.com" className="text-blue-600 hover:underline">
                  Hello@edgoing.com
                </a>
              </div>
              <div className="space-y-2">
                <div>
                  <span className="text-gray-600">{getHardcodedText("address")}: </span>
                  <span className="text-gray-600">{getHardcodedText("locations")}</span>
                </div>
                <div className="text-gray-600">
                  <div>
                    {getHardcodedText("shanghai")}: {getHardcodedText("shanghaiAddress")}
                  </div>
                  <div>{getHardcodedText("shanghaiDistrict")}</div>
                  <div className="mt-1">
                    {getHardcodedText("singapore")}: {getHardcodedText("singaporeAddress")}
                  </div>
                  <div>{getHardcodedText("singaporePostal")}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Follow Us Column */}
          <div>
            <h3 className="text-lg font-bold mb-6 text-gray-900">{getHardcodedText("followUs")}</h3>

            <div className="space-y-4">
              {/* 描述文字 */}
              <p className="text-gray-600">
                {getHardcodedText("followDescription")}
              </p>

                             {/* 社交图标和Logo紧密垂直排列 */}
               <div className="flex flex-col">
              <div className="flex gap-4">
                <a href="#social1" className="hover:opacity-80 transition-opacity">
                  <Image
                      src="/ico/2.png"
                    alt="Social Media 1"
                    width={32}
                    height={32}
                    className="w-8 h-8"
                  />
                </a>
                <a href="#social2" className="hover:opacity-80 transition-opacity">
                  <Image
                      src="/ico/3.png"
                    alt="Social Media 2"
                    width={32}
                    height={32}
                    className="w-8 h-8"
                  />
                </a>
                  <a 
                    href="#social3" 
                    className="hover:opacity-80 transition-opacity cursor-pointer"
                    onClick={(e) => handleImageClick(e, '/ico/Wechat.jpg')}
                  >
                  <Image
                      src="/ico/4.png"
                    alt="Social Media 3"
                    width={32}
                    height={32}
                    className="w-8 h-8"
                  />
                </a>
                  <a 
                    href="#social4" 
                    className="hover:opacity-80 transition-opacity cursor-pointer"
                    onClick={(e) => handleImageClick(e, '/ico/RedNote.jpg')}
                  >
                  <Image
                      src="/ico/5.png"
                    alt="Social Media 4"
                    width={32}
                    height={32}
                    className="w-8 h-8"
                  />
                </a>
              </div>

                {/* Logo - 使用负边距紧贴社交图标 */}
                <div className="-mt-12">
                <Image
                    src="/ico/1.png"
                  alt="EdGoing Logo"
                    width={220}
                    height={56}
                    className="object-contain"
                />
                </div>
              </div>
            </div>

            {showImageModal && (
              <div 
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                onClick={closeModal}
              >
                <div className="relative w-1/4 max-w-xl max-h-[120vh]" onClick={e => e.stopPropagation()}>
                  <button 
                    onClick={closeModal}
                    className="absolute -top-10 right-0 text-white text-2xl hover:text-gray-300"
                    aria-label="Close"
                  >
                    ×
                  </button>
                  <div className="relative w-full pt-[100%]">
                    <Image
                      src={currentImage}
                      alt="Notification"
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 mt-12 pt-8 text-center text-gray-500">
          <p>{getHardcodedText("copyright")}</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
