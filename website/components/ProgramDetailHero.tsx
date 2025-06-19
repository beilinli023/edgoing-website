"use client"

import { ChevronLeft } from "lucide-react"
import { useRouter } from "next/navigation"

interface ProgramDetailHeroProps {
  title: string
  subtitle?: string
  backgroundImage?: string
  backLink?: string
}

export default function ProgramDetailHero({
  title,
  subtitle,
  backgroundImage = "/placeholder.svg?height=400&width=1200",
  backLink = "/programs",
}: ProgramDetailHeroProps) {
  const router = useRouter()

  return (
    <div className="relative h-[400px] w-full overflow-hidden">
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${backgroundImage})` }}>
        <div className="absolute inset-0 bg-black/50" />
      </div>

      <div className="relative z-10 flex h-full flex-col justify-center px-4">
        <div className="mx-auto max-w-7xl w-full">
          <button
            onClick={() => router.back()}
            className="mb-4 inline-flex items-center text-white hover:text-gray-200 transition-colors"
          >
            <ChevronLeft className="mr-2 h-5 w-5" />
            返回
          </button>

          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{title}</h1>

          {subtitle && <p className="text-xl text-gray-200">{subtitle}</p>}
        </div>
      </div>
    </div>
  )
}
