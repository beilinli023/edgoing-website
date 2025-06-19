"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { X } from 'lucide-react'

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
  cities?: City[]
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

interface ProgramTypeFormProps {
  programType?: ProgramType | null
  onSubmit: (data: Partial<ProgramType>) => void
  onCancel: () => void
}

export function ProgramTypeForm({ programType, onSubmit, onCancel }: ProgramTypeFormProps) {
  const [formData, setFormData] = useState({
    name: programType?.name || '',
    nameEn: programType?.nameEn || '',
    description: programType?.description || '',
    isActive: programType?.isActive ?? true
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{programType ? '编辑项目类型' : '添加项目类型'}</span>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="w-4 h-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">中文名称 *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="nameEn">英文名称</Label>
            <Input
              id="nameEn"
              value={formData.nameEn}
              onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="description">描述</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
            />
            <Label htmlFor="isActive">启用</Label>
          </div>

          <div className="flex space-x-2">
            <Button type="submit">
              {programType ? '更新' : '创建'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              取消
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

interface GradeLevelFormProps {
  gradeLevel?: GradeLevel | null
  onSubmit: (data: Partial<GradeLevel>) => void
  onCancel: () => void
}

export function GradeLevelForm({ gradeLevel, onSubmit, onCancel }: GradeLevelFormProps) {
  const [formData, setFormData] = useState({
    name: gradeLevel?.name || '',
    nameEn: gradeLevel?.nameEn || '',
    description: gradeLevel?.description || '',
    isActive: gradeLevel?.isActive ?? true
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{gradeLevel ? '编辑年级' : '添加年级'}</span>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="w-4 h-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">中文名称 *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="nameEn">英文名称</Label>
            <Input
              id="nameEn"
              value={formData.nameEn}
              onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="description">描述</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
            />
            <Label htmlFor="isActive">启用</Label>
          </div>

          <div className="flex space-x-2">
            <Button type="submit">
              {gradeLevel ? '更新' : '创建'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              取消
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

interface CountryFormProps {
  country?: Country | null
  onSubmit: (data: Partial<Country>) => void
  onCancel: () => void
}

export function CountryForm({ country, onSubmit, onCancel }: CountryFormProps) {
  const [formData, setFormData] = useState({
    name: country?.name || '',
    nameEn: country?.nameEn || '',
    code: country?.code || '',
    isActive: country?.isActive ?? true
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{country ? '编辑国家' : '添加国家'}</span>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="w-4 h-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">中文名称 *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="nameEn">英文名称</Label>
            <Input
              id="nameEn"
              value={formData.nameEn}
              onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="code">国家代码</Label>
            <Input
              id="code"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              placeholder="如: CN, US, UK"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
            />
            <Label htmlFor="isActive">启用</Label>
          </div>

          <div className="flex space-x-2">
            <Button type="submit">
              {country ? '更新' : '创建'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              取消
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

interface CityFormProps {
  city?: City | null
  countries: Country[]
  onSubmit: (data: Partial<City>) => void
  onCancel: () => void
}

export function CityForm({ city, countries, onSubmit, onCancel }: CityFormProps) {
  const [formData, setFormData] = useState({
    name: city?.name || '',
    nameEn: city?.nameEn || '',
    countryId: city?.countryId || '',
    isActive: city?.isActive ?? true
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{city ? '编辑城市' : '添加城市'}</span>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="w-4 h-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">中文名称 *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="nameEn">英文名称</Label>
            <Input
              id="nameEn"
              value={formData.nameEn}
              onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="countryId">所属国家 *</Label>
            <Select
              value={formData.countryId}
              onValueChange={(value) => setFormData({ ...formData, countryId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="选择国家" />
              </SelectTrigger>
              <SelectContent>
                {countries.filter(c => c.isActive).map((country) => (
                  <SelectItem key={country.id} value={country.id}>
                    {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
            />
            <Label htmlFor="isActive">启用</Label>
          </div>

          <div className="flex space-x-2">
            <Button type="submit" disabled={!formData.countryId}>
              {city ? '更新' : '创建'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              取消
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
