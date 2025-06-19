"use client"

import { Calendar, MapPin, GraduationCap, Clock, DollarSign, FileText } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ProgramDetailProps {
  program: {
    id: string
    title: string
    description: string
    type: string[]
    duration?: string
    location: string
    city?: string
    country?: string
    grades: string[]
    sessions?: Array<{
      id: string
      dates: string
    }>
    deadline?: string
    price?: string
    capacity?: number
    highlights?: string[]
    schedule?: Array<{
      day: string
      activities: string[]
    }>
    includes?: string[]
    requirements?: string[]
    images?: string[]
  }
  locale?: string
}

export default function ProgramDetail({ program, locale = "zh" }: ProgramDetailProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* 基本信息 */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="space-y-4">
          {/* 第一行：项目类型 + 时长 */}
          <div className="flex flex-wrap items-center gap-6">
            {/* 项目类型 */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600">项目类型:</span>
              <div className="flex gap-2">
                {program.type.map((type, index) => (
                  <Badge key={index} variant="secondary">
                    {type}
                  </Badge>
                ))}
              </div>
            </div>

            {/* 时长 */}
            {program.duration && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-600">时长:</span>
                <span className="text-sm font-medium">{program.duration}</span>
              </div>
            )}
          </div>

          {/* 第二行：城市 + 年级 */}
          <div className="flex flex-wrap items-center gap-6">
            {/* 城市 */}
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-600">城市:</span>
              <span className="text-sm font-medium">{program.city || program.location}</span>
            </div>

            {/* 年级 */}
            <div className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-600">年级:</span>
              <div className="flex gap-2">
                {program.grades.map((grade, index) => (
                  <Badge key={index} variant="outline">
                    {grade}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* 第三行：营期 */}
          {program.sessions && program.sessions.length > 0 && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-600">营期:</span>
              <div className="flex flex-wrap gap-2">
                {program.sessions.map((session) => (
                  <Badge key={session.id} variant="default" className="bg-blue-100 text-blue-800">
                    {session.dates}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* 第四行：截止日期 */}
          {program.deadline && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium text-gray-600">截止日期:</span>
              <Badge variant="destructive">
                {typeof program.deadline === 'string'
                  ? program.deadline.includes('T')
                    ? program.deadline.split('T')[0]
                    : program.deadline
                  : new Date(program.deadline).toISOString().split('T')[0]
                }
              </Badge>
            </div>
          )}
        </div>
      </div>

      {/* 项目描述 */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <h3 className="text-lg font-semibold mb-4">项目介绍</h3>
        <p className="text-gray-600 mb-6 whitespace-pre-line">{program.description}</p>
      </div>

      {/* 详细信息标签页 */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">项目亮点</TabsTrigger>
          <TabsTrigger value="schedule">日程安排</TabsTrigger>
          <TabsTrigger value="includes">费用包含</TabsTrigger>
          <TabsTrigger value="requirements">申请要求</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            {program.highlights && program.highlights.length > 0 ? (
              <ul className="space-y-2">
                {program.highlights.map((highlight, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    <span className="text-gray-600">{highlight}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">项目亮点信息即将更新</p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="schedule" className="mt-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            {program.schedule && program.schedule.length > 0 ? (
              <div className="space-y-4">
                {program.schedule.map((day, index) => (
                  <div key={index} className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-semibold text-blue-600 mb-2">{day.day}</h4>
                    <ul className="space-y-1">
                      {day.activities.map((activity, actIndex) => (
                        <li key={actIndex} className="text-gray-600">
                          • {activity}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">日程安排信息即将更新</p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="includes" className="mt-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            {program.includes && program.includes.length > 0 ? (
              <ul className="space-y-2">
                {program.includes.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-600">{item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">费用信息即将更新</p>
            )}

            {program.price && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-blue-600" />
                  <span className="font-semibold text-blue-600">项目费用：{program.price}</span>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="requirements" className="mt-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            {program.requirements && program.requirements.length > 0 ? (
              <ul className="space-y-2">
                {program.requirements.map((req, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    <span className="text-gray-600">{req}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">申请要求即将更新</p>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* 行动按钮 */}
      <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
            立即报名
          </Button>
          <Button size="lg" variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            下载项目手册
          </Button>
          <Button size="lg" variant="outline">
            咨询顾问
          </Button>
        </div>
      </div>
    </div>
  )
}
