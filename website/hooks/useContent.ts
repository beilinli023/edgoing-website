import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

interface ContentData {
  [key: string]: string
}

export function useContent() {
  const [content, setContent] = useState<ContentData>({})
  const [loading, setLoading] = useState(true)
  const { i18n } = useTranslation()

  useEffect(() => {
    fetchContent()
  }, [i18n.language])

  const fetchContent = async () => {
    try {
      const response = await fetch(`/api/content?language=${i18n.language}`)
      if (response.ok) {
        const data = await response.json()
        setContent(data.content)
      }
    } catch (error) {
      console.error('Failed to fetch content:', error)
    } finally {
      setLoading(false)
    }
  }

  const getContent = (key: string, fallback: string = '') => {
    return content[key] || fallback
  }

  return {
    content,
    loading,
    getContent,
  }
}
