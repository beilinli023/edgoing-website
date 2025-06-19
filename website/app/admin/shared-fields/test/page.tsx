"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface SharedFieldsData {
  programTypes: any[]
  gradeLevels: any[]
  countries: any[]
  cities: any[]
}

export default function SharedFieldsTestPage() {
  const [data, setData] = useState<SharedFieldsData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchData = async () => {
    try {
      setLoading(true)
      setError('')
      
      const response = await fetch('/api/admin/shared-fields')
      if (!response.ok) {
        throw new Error('Failed to fetch data')
      }
      
      const result = await response.json()
      setData(result)
    } catch (error) {
      console.error('Error fetching data:', error)
      setError('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">共享字段API测试</h1>
              <p className="text-gray-600">测试共享字段数据API</p>
            </div>
            <Button onClick={fetchData}>
              刷新数据
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {data && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>项目类型 ({data.programTypes.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {data.programTypes.map((type) => (
                      <div key={type.id} className="p-2 border rounded">
                        <div className="font-medium">{type.name}</div>
                        {type.nameEn && <div className="text-sm text-gray-600">{type.nameEn}</div>}
                        {type.description && <div className="text-sm text-gray-500">{type.description}</div>}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>年级 ({data.gradeLevels.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {data.gradeLevels.map((level) => (
                      <div key={level.id} className="p-2 border rounded">
                        <div className="font-medium">{level.name}</div>
                        {level.nameEn && <div className="text-sm text-gray-600">{level.nameEn}</div>}
                        {level.description && <div className="text-sm text-gray-500">{level.description}</div>}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>国家 ({data.countries.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {data.countries.map((country) => (
                      <div key={country.id} className="p-2 border rounded">
                        <div className="font-medium">{country.name}</div>
                        {country.nameEn && <div className="text-sm text-gray-600">{country.nameEn}</div>}
                        {country.code && <div className="text-sm text-gray-500">代码: {country.code}</div>}
                        {country.cities.length > 0 && (
                          <div className="mt-2">
                            <div className="text-sm font-medium">城市 ({country.cities.length}):</div>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {country.cities.map((city: any) => (
                                <span key={city.id} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                                  {city.name}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>城市 ({data.cities.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {data.cities.map((city) => (
                      <div key={city.id} className="p-2 border rounded">
                        <div className="font-medium">{city.name}</div>
                        {city.nameEn && <div className="text-sm text-gray-600">{city.nameEn}</div>}
                        <div className="text-sm text-gray-500">所属: {city.countries?.name || '未设置'}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
