export interface Program {
  id: number // 数据库自动生成的ID
  programId: string // 项目ID，可能重复
  title: string
  description: string
  // ... 其他项目相关字段
}

export interface Activity {
  id: number // 数据库自动生成的ID
  activityId: string // 唯一的活动ID
  programId: string // 关联的项目ID
  title: string
  description: string
  date: string
  location: string
  capacity: number
  currentRegistrations: number
  // ... 其他活动相关字段
}
