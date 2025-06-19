// 基础内容接口
interface BaseContent {
  id: string // CMS 内容唯一标识符
  type: "program" | "activity" | "banner" | "page" // 内容类型
  title: {
    // 多语言标题
    en: string
    zh: string
  }
  slug: string // URL 友好的标识符
  status: "draft" | "published" | "archived"
  createdAt: string // ISO 日期字符串
  updatedAt: string // ISO 日期字符串
  publishedAt?: string // ISO 日期字符串
  metadata: {
    description: {
      // 多语言描述（用于 SEO）
      en: string
      zh: string
    }
    keywords: string[] // SEO 关键词
  }
}

// 项目接口
export interface Program extends BaseContent {
  type: "program"
  programId: string // 项目 ID
  description: {
    // 多语言描述
    en: string
    zh: string
  }
  duration: string
  location: string
  programType: string
  suitableFor: string[]
  image: string
  // ... 其他项目特定字段
}

// 活动接口
export interface Activity extends BaseContent {
  type: "activity"
  activityId: string // 活动 ID
  programId: string // 关联的项目 ID
  description: {
    // 多语言描述
    en: string
    zh: string
  }
  date: string
  location: string
  capacity: number
  currentRegistrations: number
  // ... 其他活动特定字段
}

// 轮播图接口
export interface Banner extends BaseContent {
  type: "banner"
  image: string
  link: string
  order: number // 显示顺序
}

// CMS 内容联合类型
export type CMSContent = Program | Activity | Banner
