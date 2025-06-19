import type React from "react"

interface PageHeroProps {
  title: string
  description: string
  backgroundImage: string
}

const PageHero: React.FC<PageHeroProps> = ({ title, description, backgroundImage }) => {
  return (
    <div className="relative h-[400px] w-full overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${backgroundImage})`,
        }}
      >
        <div className="absolute inset-0 bg-black/40" />
      </div>

      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4 md:px-8 max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">{title}</h1>
        <p className="text-lg md:text-xl text-white/90">{description}</p>
      </div>
    </div>
  )
}

export default PageHero
