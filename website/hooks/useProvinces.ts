import { useState, useEffect } from 'react'

export interface City {
  id: string
  name: string
  code: string
  provinceId: string
}

export interface Province {
  id: string
  name: string
  code: string
  cities: City[]
}

export interface ProvincesData {
  provinces: Province[]
}

export function useProvinces(language: 'zh' | 'en' = 'zh') {
  const [provinces, setProvinces] = useState<Province[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch(`/api/provinces?language=${language}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch provinces')
        }
        
        const data: ProvincesData = await response.json()
        setProvinces(data.provinces)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
        console.error('Error fetching provinces:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchProvinces()
  }, [language])

  const getProvince = (provinceId: string) => {
    return provinces.find(p => p.id === provinceId)
  }

  const getCitiesByProvince = (provinceId: string) => {
    const province = getProvince(provinceId)
    return province ? province.cities : []
  }

  const getProvinceByCode = (code: string) => {
    return provinces.find(p => p.code === code)
  }

  const getCityByCode = (code: string) => {
    for (const province of provinces) {
      const city = province.cities.find(c => c.code === code)
      if (city) return city
    }
    return null
  }

  return {
    provinces,
    loading,
    error,
    getProvince,
    getCitiesByProvince,
    getProvinceByCode,
    getCityByCode,
  }
}
