"use client"

import type React from "react"
import Image from "next/image"
import { MapPin } from "lucide-react"
import { useTranslation } from "react-i18next"

interface InternationalProgramDetailHeroProps {
  titleKey: string
  titleFallback: string
  countryKey: string
  countryFallback: string
  backgroundImage: string
}

const InternationalProgramDetailHero: React.FC<InternationalProgramDetailHeroProps> = ({
  titleKey,
  titleFallback,
  countryKey,
  countryFallback,
  backgroundImage,
}) => {
  const { t, ready } = useTranslation()

  const getText = (key: string, fallback: string) => {
    if (!ready) return fallback
    try {
      return t(key) || fallback
    } catch {
      return fallback
    }
  }

  return (
    <div className="relative h-[400px] w-full overflow-hidden">
      <Image
        src={backgroundImage || "/placeholder.svg"}
        alt={getText(titleKey, titleFallback)}
        fill
        className="object-cover object-center"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-4 md:px-8 max-w-4xl mx-auto text-white">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">{getText(titleKey, titleFallback)}</h1>
        <div className="flex items-center text-lg">
          <MapPin size={20} className="mr-2" />
          <span>{getText(countryKey, countryFallback)}</span>
        </div>
      </div>
    </div>
  )
}

export default InternationalProgramDetailHero
