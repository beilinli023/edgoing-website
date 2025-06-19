import type React from "react"
import Image from "next/image"
import { MapPin } from "lucide-react"
import { useTranslation } from "react-i18next"

interface ChinaProgramDetailHeroProps {
  title: string
  city?: {
    id: string
    name: string
    nameEn?: string
    countries?: {
      name: string
      nameEn?: string
    }
  }
  backgroundImage: string | { url: string; alt?: string } | null
}

const ChinaProgramDetailHero: React.FC<ChinaProgramDetailHeroProps> = ({ title, city, backgroundImage }) => {
  const { i18n } = useTranslation()

  const getCityDisplayName = () => {
    if (!city) return 'Unknown City'
    return i18n.language === 'en' && city.nameEn ? city.nameEn : city.name
  }

  const getCountryDisplayName = () => {
    if (!city?.countries) {
      // Fallback to localized "China" instead of hardcoded English
      return i18n.language === 'en' ? 'China' : '中国'
    }
    return i18n.language === 'en' && city.countries.nameEn ? city.countries.nameEn : city.countries.name
  }

  const getBackgroundImageUrl = () => {
    if (typeof backgroundImage === 'string') {
      return backgroundImage
    }
    if (backgroundImage && typeof backgroundImage === 'object' && backgroundImage.url) {
      return backgroundImage.url
    }
    return "/placeholder.svg"
  }

  return (
    <div className="relative h-[400px] w-full overflow-hidden">
      <Image
        src={getBackgroundImageUrl()}
        alt={title}
        fill
        className="object-cover object-center"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-4 md:px-8 max-w-4xl mx-auto text-white">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">{title}</h1>
        <div className="flex items-center text-lg">
          <MapPin size={20} className="mr-2" />
          <span>{getCountryDisplayName()}, {getCityDisplayName()}</span>
        </div>
      </div>
    </div>
  )
}

export default ChinaProgramDetailHero
