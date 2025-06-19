"use client"

import type React from "react"
import { useState, useEffect } from "react"

interface ColorfulSloganProps {
  className?: string
  size?: "sm" | "md" | "lg" | "xl"
}

const ColorfulSlogan: React.FC<ColorfulSloganProps> = ({ 
  className = "", 
  size = "lg" 
}) => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const sizeClasses = {
    sm: "text-lg md:text-xl",
    md: "text-xl md:text-2xl", 
    lg: "text-2xl md:text-3xl",
    xl: "text-4xl md:text-5xl"
  }

  const words = [
    { text: "Explore.", color: "text-blue-600", delay: "delay-0" },
    { text: "Learn.", color: "text-green-600", delay: "delay-300" },
    { text: "Grow.", color: "text-orange-500", delay: "delay-500" }
  ]

  return (
    <span className={`flex items-center gap-4 font-bold ${sizeClasses[size]} ${className}`}>
      {words.map((word, index) => (
        <span
          key={word.text}
          className={`
            ${word.color} 
            colorful-word
            transform transition-all duration-700 ease-out
            ${isVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-8 opacity-0 scale-95'}
            hover:scale-110 hover:-translate-y-1 hover:drop-shadow-2xl
            cursor-default
            relative
            group
            letter-wave-animation
          `}
          style={{
            transitionDelay: `${index * 150}ms`,
            animationDelay: `${index * 0.3}s`
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.animationPlayState = 'paused'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.animationPlayState = 'running'
          }}
        >
          <span className="relative z-10 transition-all duration-300">
            {word.text}
          </span>
          <span 
            className={`
              absolute inset-0 ${word.color} opacity-20 blur-sm scale-110
              colorful-glow
              transition-all duration-500 group-hover:opacity-40 group-hover:scale-125
            `}
          />
        </span>
      ))}
    </span>
  )
}

export default ColorfulSlogan 