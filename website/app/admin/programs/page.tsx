"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface Program {
  id: string
  title: string
  slug: string
  status: string
  language: string
  country: string
  city: string
  createdAt: string
  author: {
    name: string
    username: string
  }
  _count: {
    applications: number
  }
}

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    fetchPrograms()
  }, [])

  const fetchPrograms = async () => {
    try {
      const response = await fetch('/api/admin/programs')
      if (response.ok) {
        const data = await response.json()
        setPrograms(data.programs)
      } else if (response.status === 401) {
        router.push('/admin/login')
      } else {
        setError('Failed to fetch programs')
      }
    } catch (error) {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">项目管理</h1>
              <p className="text-gray-600">管理游学项目</p>
            </div>
            <div className="flex space-x-4">
              <Button onClick={() => router.push('/admin')}>
                返回仪表板
              </Button>
              <Button onClick={() => router.push('/admin/programs/create')}>
                创建项目
              </Button>
            </div>
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

          <div className="grid gap-6">
            {programs.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <p className="text-gray-500 mb-4">没有找到项目</p>
                  <Button onClick={() => router.push('/admin/programs/create')}>
                    创建您的第一个项目
                  </Button>
                </CardContent>
              </Card>
            ) : (
              programs.map((program) => (
                <Card key={program.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{program.title}</CardTitle>
                        <CardDescription>
                          {program.country} • {program.city} • {program.language.toUpperCase()}
                        </CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          program.status === 'PUBLISHED'
                            ? 'bg-green-100 text-green-800'
                            : program.status === 'DRAFT'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {program.status}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-600">
                        <p>作者：{program.author.name || program.author.username}</p>
                        <p>申请数：{program._count.applications}</p>
                        <p>创建时间：{new Date(program.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/admin/programs/${program.id}`)}
                        >
                          编辑
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`/programs/${program.slug}`, '_blank')}
                        >
                          查看
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
