"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Edit, Trash2, Settings, Globe, MapPin, GraduationCap } from 'lucide-react'
import { DarkThemeWrapper, GlassCard, DarkButton } from '@/components/admin/DarkThemeWrapper'
import { ProgramTypeForm, GradeLevelForm, CountryForm, CityForm } from '@/components/admin/SharedFieldForms'

interface ProgramType {
  id: string
  name: string
  nameEn?: string
  description?: string
  isActive: boolean
  order: number
}

interface GradeLevel {
  id: string
  name: string
  nameEn?: string
  description?: string
  isActive: boolean
  order: number
}

interface Country {
  id: string
  name: string
  nameEn?: string
  code?: string
  isActive: boolean
  order: number
  cities: City[]
}

interface City {
  id: string
  name: string
  nameEn?: string
  countryId: string
  isActive: boolean
  order: number
  country?: Country
}

export default function SharedFieldsPage() {
  const router = useRouter()
  const [programTypes, setProgramTypes] = useState<ProgramType[]>([])
  const [gradeLevels, setGradeLevels] = useState<GradeLevel[]>([])
  const [countries, setCountries] = useState<Country[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [activeTab, setActiveTab] = useState('program-types')

  // Form states
  const [showProgramTypeForm, setShowProgramTypeForm] = useState(false)
  const [showGradeLevelForm, setShowGradeLevelForm] = useState(false)
  const [showCountryForm, setShowCountryForm] = useState(false)
  const [showCityForm, setShowCityForm] = useState(false)

  const [editingProgramType, setEditingProgramType] = useState<ProgramType | null>(null)
  const [editingGradeLevel, setEditingGradeLevel] = useState<GradeLevel | null>(null)
  const [editingCountry, setEditingCountry] = useState<Country | null>(null)
  const [editingCity, setEditingCity] = useState<City | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  // Clear messages when switching tabs
  useEffect(() => {
    setError('')
    setSuccess('')
  }, [activeTab])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [programTypesRes, gradeLevelsRes, countriesRes, citiesRes] = await Promise.all([
        fetch('/api/admin/shared-fields/program-types'),
        fetch('/api/admin/shared-fields/grade-levels'),
        fetch('/api/admin/shared-fields/countries'),
        fetch('/api/admin/shared-fields/cities')
      ])

      if (!programTypesRes.ok || !gradeLevelsRes.ok || !countriesRes.ok || !citiesRes.ok) {
        throw new Error('Failed to fetch data')
      }

      const [programTypesData, gradeLevelsData, countriesData, citiesData] = await Promise.all([
        programTypesRes.json(),
        gradeLevelsRes.json(),
        countriesRes.json(),
        citiesRes.json()
      ])

      setProgramTypes(programTypesData)
      setGradeLevels(gradeLevelsData)
      setCountries(countriesData)
      setCities(citiesData)
    } catch (error) {
      console.error('Error fetching data:', error)
      setError('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProgramType = async (data: Partial<ProgramType>) => {
    try {
      const response = await fetch('/api/admin/shared-fields/program-types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create program type')
      }

      await fetchData()
      setShowProgramTypeForm(false)
      setError('') // Clear any previous errors
      setSuccess('项目类型创建成功！')
    } catch (error) {
      console.error('Error creating program type:', error)
      setError(error instanceof Error ? error.message : 'Failed to create program type')
      setSuccess('') // Clear success message on error
    }
  }

  const handleUpdateProgramType = async (id: string, data: Partial<ProgramType>) => {
    try {
      const response = await fetch(`/api/admin/shared-fields/program-types/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!response.ok) throw new Error('Failed to update program type')

      await fetchData()
      setEditingProgramType(null)
      setError('') // Clear any previous errors
      setSuccess('项目类型更新成功！')
    } catch (error) {
      console.error('Error updating program type:', error)
      setError('Failed to update program type')
    }
  }

  const handleDeleteProgramType = async (id: string) => {
    if (!confirm('确定要删除这个项目类型吗？')) return

    try {
      const response = await fetch(`/api/admin/shared-fields/program-types/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete program type')

      await fetchData()
    } catch (error) {
      console.error('Error deleting program type:', error)
      setError('Failed to delete program type')
    }
  }

  // Grade Level handlers
  const handleCreateGradeLevel = async (data: Partial<GradeLevel>) => {
    try {
      const response = await fetch('/api/admin/shared-fields/grade-levels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create grade level')
      }

      await fetchData()
      setShowGradeLevelForm(false)
      setError('') // Clear any previous errors
      setSuccess('年级创建成功！')
    } catch (error) {
      console.error('Error creating grade level:', error)
      setError(error instanceof Error ? error.message : 'Failed to create grade level')
      setSuccess('') // Clear success message on error
    }
  }

  const handleUpdateGradeLevel = async (id: string, data: Partial<GradeLevel>) => {
    try {
      const response = await fetch(`/api/admin/shared-fields/grade-levels/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!response.ok) throw new Error('Failed to update grade level')

      await fetchData()
      setEditingGradeLevel(null)
      setError('') // Clear any previous errors
      setSuccess('年级更新成功！')
    } catch (error) {
      console.error('Error updating grade level:', error)
      setError('Failed to update grade level')
    }
  }

  const handleDeleteGradeLevel = async (id: string) => {
    if (!confirm('确定要删除这个年级吗？')) return

    try {
      const response = await fetch(`/api/admin/shared-fields/grade-levels/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete grade level')

      await fetchData()
    } catch (error) {
      console.error('Error deleting grade level:', error)
      setError('Failed to delete grade level')
    }
  }

  // Country handlers
  const handleCreateCountry = async (data: Partial<Country>) => {
    try {
      const response = await fetch('/api/admin/shared-fields/countries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create country')
      }

      await fetchData()
      setShowCountryForm(false)
      setError('') // Clear any previous errors
      setSuccess('国家创建成功！')
    } catch (error) {
      console.error('Error creating country:', error)
      setError(error instanceof Error ? error.message : 'Failed to create country')
      setSuccess('') // Clear success message on error
    }
  }

  const handleUpdateCountry = async (id: string, data: Partial<Country>) => {
    try {
      const response = await fetch(`/api/admin/shared-fields/countries/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!response.ok) throw new Error('Failed to update country')

      await fetchData()
      setEditingCountry(null)
      setError('') // Clear any previous errors
      setSuccess('国家更新成功！')
    } catch (error) {
      console.error('Error updating country:', error)
      setError('Failed to update country')
    }
  }

  const handleDeleteCountry = async (id: string) => {
    if (!confirm('确定要删除这个国家吗？这将同时删除该国家下的所有城市。')) return

    try {
      const response = await fetch(`/api/admin/shared-fields/countries/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete country')
      }

      await fetchData()
    } catch (error) {
      console.error('Error deleting country:', error)
      setError(error instanceof Error ? error.message : 'Failed to delete country')
    }
  }

  // City handlers
  const handleCreateCity = async (data: Partial<City>) => {
    try {
      const response = await fetch('/api/admin/shared-fields/cities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create city')
      }

      await fetchData()
      setShowCityForm(false)
      setError('') // Clear any previous errors
      setSuccess('城市创建成功！')
    } catch (error) {
      console.error('Error creating city:', error)
      setError(error instanceof Error ? error.message : 'Failed to create city')
      setSuccess('') // Clear success message on error
    }
  }

  const handleUpdateCity = async (id: string, data: Partial<City>) => {
    try {
      const response = await fetch(`/api/admin/shared-fields/cities/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!response.ok) throw new Error('Failed to update city')

      await fetchData()
      setEditingCity(null)
      setError('') // Clear any previous errors
      setSuccess('城市更新成功！')
    } catch (error) {
      console.error('Error updating city:', error)
      setError('Failed to update city')
    }
  }

  const handleDeleteCity = async (id: string) => {
    if (!confirm('确定要删除这个城市吗？')) return

    try {
      const response = await fetch(`/api/admin/shared-fields/cities/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete city')

      await fetchData()
    } catch (error) {
      console.error('Error deleting city:', error)
      setError('Failed to delete city')
    }
  }

  if (loading) {
    return (
      <DarkThemeWrapper
        title="共享字段管理"
        description="管理项目类型、年级、国家和城市等共享字段"
        loading={true}
      >
        <div />
      </DarkThemeWrapper>
    )
  }

  return (
    <DarkThemeWrapper
      title="共享字段管理"
      description="管理项目类型、年级、国家和城市等共享字段"
    >
      <div className="space-y-6">
        {error && (
          <div className="bg-red-500/20 border border-red-500/30 text-red-200 px-4 py-3 rounded-lg mb-6 backdrop-blur-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-500/20 border border-green-500/30 text-green-200 px-4 py-3 rounded-lg mb-6 backdrop-blur-sm">
            {success}
            <button
              onClick={() => setSuccess('')}
              className="float-right text-green-200 hover:text-green-100"
            >
              ×
            </button>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white/10">
            <TabsTrigger value="program-types" className="flex items-center gap-2 data-[state=active]:bg-white/20 data-[state=active]:text-white text-slate-300">
              <GraduationCap className="w-4 h-4" />
              项目类型
            </TabsTrigger>
            <TabsTrigger value="grade-levels" className="flex items-center gap-2 data-[state=active]:bg-white/20 data-[state=active]:text-white text-slate-300">
              <GraduationCap className="w-4 h-4" />
              年级
            </TabsTrigger>
            <TabsTrigger value="countries" className="flex items-center gap-2 data-[state=active]:bg-white/20 data-[state=active]:text-white text-slate-300">
              <Globe className="w-4 h-4" />
              国家
            </TabsTrigger>
            <TabsTrigger value="cities" className="flex items-center gap-2 data-[state=active]:bg-white/20 data-[state=active]:text-white text-slate-300">
              <MapPin className="w-4 h-4" />
              城市
            </TabsTrigger>
          </TabsList>

            <TabsContent value="program-types">
              <div className="space-y-6">
                {(showProgramTypeForm || editingProgramType) && (
                  <ProgramTypeForm
                    programType={editingProgramType}
                    onSubmit={(data) => {
                      if (editingProgramType) {
                        handleUpdateProgramType(editingProgramType.id, data)
                      } else {
                        handleCreateProgramType(data)
                      }
                    }}
                    onCancel={() => {
                      setShowProgramTypeForm(false)
                      setEditingProgramType(null)
                    }}
                  />
                )}

              <GlassCard className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-semibold text-white">项目类型管理</h3>
                    <p className="text-slate-300">管理所有项目类型，这些类型可以在游学中国和游学国际项目中使用</p>
                  </div>
                  <DarkButton onClick={() => setShowProgramTypeForm(true)} variant="primary">
                    <Plus className="w-4 h-4 mr-2" />
                    添加项目类型
                  </DarkButton>
                </div>
                <div className="space-y-4">
                  {programTypes.map((type) => (
                    <div key={type.id} className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-lg">
                      <div>
                        <h3 className="font-medium text-white">{type.name}</h3>
                        {type.nameEn && <p className="text-sm text-slate-300">{type.nameEn}</p>}
                        {type.description && <p className="text-sm text-slate-400">{type.description}</p>}
                        <p className="text-xs text-slate-500">状态: {type.isActive ? '启用' : '禁用'}</p>
                      </div>
                      <div className="flex space-x-2">
                        <DarkButton
                          size="sm"
                          variant="secondary"
                          onClick={() => setEditingProgramType(type)}
                        >
                          <Edit className="w-4 h-4" />
                        </DarkButton>
                        <DarkButton
                          size="sm"
                          variant="danger"
                          onClick={() => handleDeleteProgramType(type.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </DarkButton>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
              </div>
            </TabsContent>

            <TabsContent value="grade-levels">
              <div className="space-y-6">
                {(showGradeLevelForm || editingGradeLevel) && (
                  <GradeLevelForm
                    gradeLevel={editingGradeLevel}
                    onSubmit={(data) => {
                      if (editingGradeLevel) {
                        handleUpdateGradeLevel(editingGradeLevel.id, data)
                      } else {
                        handleCreateGradeLevel(data)
                      }
                    }}
                    onCancel={() => {
                      setShowGradeLevelForm(false)
                      setEditingGradeLevel(null)
                    }}
                  />
                )}

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>年级管理</span>
                      <Button onClick={() => setShowGradeLevelForm(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        添加年级
                      </Button>
                    </CardTitle>
                    <CardDescription>
                      管理所有年级选项，这些年级可以在游学中国项目中使用
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {gradeLevels.map((level) => (
                        <div key={level.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <h3 className="font-medium">{level.name}</h3>
                            {level.nameEn && <p className="text-sm text-gray-600">{level.nameEn}</p>}
                            {level.description && <p className="text-sm text-gray-500">{level.description}</p>}
                            <p className="text-xs text-gray-400">状态: {level.isActive ? '启用' : '禁用'}</p>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingGradeLevel(level)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteGradeLevel(level.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="countries">
              <div className="space-y-6">
                {(showCountryForm || editingCountry) && (
                  <CountryForm
                    country={editingCountry}
                    onSubmit={(data) => {
                      if (editingCountry) {
                        handleUpdateCountry(editingCountry.id, data)
                      } else {
                        handleCreateCountry(data)
                      }
                    }}
                    onCancel={() => {
                      setShowCountryForm(false)
                      setEditingCountry(null)
                    }}
                  />
                )}

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>国家管理</span>
                      <Button onClick={() => setShowCountryForm(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        添加国家
                      </Button>
                    </CardTitle>
                    <CardDescription>
                      管理所有国家选项，国家与城市建立映射关系
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {countries.map((country) => (
                        <div key={country.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h3 className="font-medium">{country.name}</h3>
                              {country.nameEn && <p className="text-sm text-gray-600">{country.nameEn}</p>}
                              {country.code && <p className="text-sm text-gray-500">代码: {country.code}</p>}
                              <p className="text-xs text-gray-400">状态: {country.isActive ? '启用' : '禁用'}</p>
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingCountry(country)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteCountry(country.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          {country.cities.length > 0 && (
                            <div className="mt-3 pl-4 border-l-2 border-gray-200">
                              <p className="text-sm font-medium text-gray-700 mb-2">城市 ({country.cities.length}):</p>
                              <div className="flex flex-wrap gap-2">
                                {country.cities.map((city) => (
                                  <span
                                    key={city.id}
                                    className={`px-2 py-1 text-xs rounded ${
                                      city.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                                    }`}
                                  >
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
              </div>
            </TabsContent>

            <TabsContent value="cities">
              <div className="space-y-6">
                {(showCityForm || editingCity) && (
                  <CityForm
                    city={editingCity}
                    countries={countries}
                    onSubmit={(data) => {
                      if (editingCity) {
                        handleUpdateCity(editingCity.id, data)
                      } else {
                        handleCreateCity(data)
                      }
                    }}
                    onCancel={() => {
                      setShowCityForm(false)
                      setEditingCity(null)
                    }}
                  />
                )}

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>城市管理</span>
                      <Button onClick={() => setShowCityForm(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        添加城市
                      </Button>
                    </CardTitle>
                    <CardDescription>
                      管理所有城市选项，每个城市都属于一个国家
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {cities.map((city) => (
                        <div key={city.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <h3 className="font-medium">{city.name}</h3>
                            {city.nameEn && <p className="text-sm text-gray-600">{city.nameEn}</p>}
                            <p className="text-sm text-gray-500">所属国家: {city.countries?.name || '未设置'}</p>
                            <p className="text-xs text-gray-400">状态: {city.isActive ? '启用' : '禁用'}</p>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingCity(city)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteCity(city.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
        </Tabs>
      </div>
    </DarkThemeWrapper>
  )
}
