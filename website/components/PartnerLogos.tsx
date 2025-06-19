"use client"

import { useState, useEffect } from 'react'
import { useSSRSafeTranslation } from '@/hooks/useSSRSafeTranslation'

interface PartnerLogo {
  id: string
  companyName: string
  logoUrl: string
  websiteUrl?: string
  order: number
}

interface PartnerLogosProps {
  limit?: number
  className?: string
}

export default function PartnerLogos({ limit = 10, className = '' }: PartnerLogosProps) {
  const { getText } = useSSRSafeTranslation()
  const [partnerLogos, setPartnerLogos] = useState<PartnerLogo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPartnerLogos()
  }, [limit])

  const fetchPartnerLogos = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/partner-logos?limit=${limit}`)
      if (response.ok) {
        const data = await response.json()
        setPartnerLogos(data.partnerLogos || [])
      }
    } catch (error) {
      console.error('Failed to fetch partner logos:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className={`py-12 ${className}`}>
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="text-gray-500">
              {getText('common.loading', '加载中...', 'Loading...')}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (partnerLogos.length === 0) {
    return null
  }

  return (
    <div className={`py-12 bg-gray-50 ${className}`}>
      <div className="container mx-auto px-4">
        {/* 标题 */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {getText('homepage.partners.title', '合作伙伴', 'Our Partners')}
          </h2>
          <p className="text-gray-600">
            {getText(
              'homepage.partners.subtitle',
              '与我们携手共创美好未来',
              'Working together for a better future'
            )}
          </p>
        </div>

        {/* Logo网格 */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {partnerLogos.map((logo) => (
            <div
              key={logo.id}
              className="flex items-center justify-center p-4 rounded-lg transition-shadow duration-200"
            >
              {logo.websiteUrl ? (
                <a
                  href={logo.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full h-16 flex items-center justify-center"
                  title={logo.companyName}
                >
                  <img
                    src={logo.logoUrl}
                    alt={logo.companyName}
                    className="max-w-full max-h-full object-contain hover:scale-105 transition-all duration-200"
                  />
                </a>
              ) : (
                <div
                  className="w-full h-16 flex items-center justify-center"
                  title={logo.companyName}
                >
                  <img
                    src={logo.logoUrl}
                    alt={logo.companyName}
                    className="max-w-full max-h-full object-contain hover:scale-105 transition-all duration-200"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
