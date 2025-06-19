"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"
import { useSSRSafeTranslation } from "@/hooks/useSSRSafeTranslation"

// 默认的学员故事数据作为fallback
const defaultTestimonials = [
  {
    id: "default-1",
    content: "我在新加坡的游学经历非常棒，不仅让我学到了很多科学知识，还让我体验了不同的文化。老师们都很专业，课程设计得很有趣，让我对科学产生了更大的兴趣。这次旅行真的改变了我对世界的看法。",
    author: "张文慧",
    role: "高中生",
    program: "新加坡科学营",
    image: "/uploads/1749485075525-uq8w8qnumk.jpg",
    order: 1,
    translation: {
      content: "My study tour experience in Singapore was amazing. Not only did I learn a lot of scientific knowledge, but I also experienced different cultures. The teachers were very professional and the courses were designed to be very interesting, which made me more interested in science. This trip really changed my view of the world.",
      author: "Zhang Wenhui",
      role: "High School Student",
      program: "Singapore Science Camp",
    }
  },
  {
    id: "default-2",
    content: "参加EdGoing的项目让我的孩子变得更加自信和独立。她不仅提高了英语水平，还学会了如何与来自不同文化背景的同学相处。这是一次非常值得的投资。",
    author: "李明",
    role: "学生家长",
    program: "国际文化交流项目",
    image: "/uploads/1749485677092-jwxoobhlgyn.jpg",
    order: 2,
    translation: {
      content: "Participating in EdGoing's program made my child more confident and independent. She not only improved her English level, but also learned how to get along with classmates from different cultural backgrounds. This was a very worthwhile investment.",
      author: "Li Ming",
      role: "Parent",
      program: "International Cultural Exchange Program",
    }
  },
  {
    id: "default-3",
    content: "通过EdGoing的STEM项目，我对编程和机器人技术产生了浓厚的兴趣。导师们都很专业，教学方式很有趣，让我在玩中学到了很多知识。",
    author: "王小明",
    role: "初中生",
    program: "STEM创新营",
    image: "/uploads/1749483271726-phigx91kd4o.jpg",
    order: 3,
    translation: {
      content: "Through EdGoing's STEM program, I developed a strong interest in programming and robotics. The mentors were very professional and the teaching methods were interesting, allowing me to learn a lot while having fun.",
      author: "Wang Xiaoming",
      role: "Middle School Student",
      program: "STEM Innovation Camp",
    }
  },
]

interface TestimonialData {
  id: string
  content: string
  author: string
  role: string
  program: string
  image: string | null
  order: number
  translation?: {
    content: string
    author: string
    role: string
    program: string
  } | null
}

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [testimonials, setTestimonials] = useState<TestimonialData[]>(defaultTestimonials)
  const [loading, setLoading] = useState(true)
  const [isClient, setIsClient] = useState(false)
  const { getSimpleText, i18n } = useSSRSafeTranslation()

  useEffect(() => {
    setIsClient(true)
  }, [])

  // 获取学员故事数据
  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const language = i18n.language || 'zh'
        const response = await fetch(`/api/testimonials?language=${language}`)
        if (response.ok) {
          const data = await response.json()
          if (data.testimonials && data.testimonials.length > 0) {
            setTestimonials(data.testimonials)
          }
        }
      } catch (error) {
        console.error('Failed to fetch testimonials:', error)
        // 保持使用默认数据
      } finally {
        setLoading(false)
      }
    }

    // 只在客户端获取数据
    if (typeof window !== 'undefined') {
      fetchTestimonials()
    } else {
      setLoading(false)
    }
  }, [i18n.language])

  // 获取当前语言的内容
  // API已经根据语言返回了正确的主内容，所以直接使用即可
  const getCurrentContent = (testimonial: TestimonialData) => {
    return {
      content: testimonial.content,
      author: testimonial.author,
      role: testimonial.role,
      program: testimonial.program,
    }
  }

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
  }

  const previousTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  return (
    <section className="py-10 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {isClient && i18n.language === 'en' ? 'Student Stories' : '学员故事'}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {isClient && i18n.language === 'en'
              ? 'Listen to our students share their learning experiences and growth stories.'
              : '聆听我们的学员分享他们在国外的转变体验。'
            }
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Navigation Buttons */}
            <button
              onClick={previousTestimonial}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 text-gray-400 hover:text-gray-600 transition-colors z-10"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>

            <button
              onClick={nextTestimonial}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 text-gray-400 hover:text-gray-600 transition-colors z-10"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-8 h-8" />
            </button>

            {/* Testimonial Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="text-center space-y-6"
              >
                <div className="p-6 md:p-8">
                  <p className="text-base md:text-lg text-gray-700 italic leading-relaxed mb-6">
                    "{getCurrentContent(testimonials[currentIndex]).content}"
                  </p>

                  <div className="flex items-center justify-center space-x-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden">
                      <Image
                        src={testimonials[currentIndex].image || "/placeholder.svg"}
                        alt={getCurrentContent(testimonials[currentIndex]).author}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-gray-900 text-base">
                        {getCurrentContent(testimonials[currentIndex]).author}
                      </div>
                      <div className="text-gray-600 text-sm">
                        {getCurrentContent(testimonials[currentIndex]).role}
                      </div>
                      <div className="text-sm text-blue-600 font-medium">
                        {getCurrentContent(testimonials[currentIndex]).program}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Pagination Dots */}
            <div className="flex justify-center space-x-2 mt-6">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentIndex ? "bg-blue-600" : "bg-gray-300"
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Testimonials
