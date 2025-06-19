"use client"

import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { Input } from "@/components/ui/input"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

interface FAQ {
  id: string
  question: string
  answer: string
  order: number
}

const FAQSection = () => {
  const { i18n } = useTranslation()
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  useEffect(() => {
    fetchFAQs()
  }, [i18n.language])

  const fetchFAQs = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/faqs?language=${i18n.language}`)
      if (response.ok) {
        const data = await response.json()
        setFaqs(data.faqs)
      } else {
        console.error('Failed to fetch FAQs')
      }
    } catch (error) {
      console.error('Error fetching FAQs:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filter FAQs based on search term
  const filteredFAQs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const toggleAccordion = (value: string) => {
    setExpandedItems((prev) => (prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]))
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto mb-16">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00A0E9] mx-auto"></div>
          <p className="mt-2 text-gray-500">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto mb-16">
      <div className="mb-8">
        <Input
          type="text"
          placeholder={i18n.language === 'zh' ? "搜索FAQ..." : "Search FAQs..."}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full border-[#00A0E9] focus-visible:ring-[#00A0E9]"
        />
      </div>

      {faqs.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {i18n.language === 'zh' ? '暂无FAQ内容' : 'No FAQ content available'}
        </div>
      ) : (
        <>
          <Accordion type="multiple" value={expandedItems} className="space-y-4">
            {filteredFAQs.map((faq) => (
              <AccordionItem key={faq.id} value={`item-${faq.id}`}>
                <AccordionTrigger onClick={() => toggleAccordion(`item-${faq.id}`)}>
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent>{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          {filteredFAQs.length === 0 && (
            <p className="text-center text-muted-foreground mt-8">
              {i18n.language === 'zh' ? '没有找到匹配的问题' : 'No matching questions found.'}
            </p>
          )}
        </>
      )}
    </div>
  )
}

export default FAQSection
