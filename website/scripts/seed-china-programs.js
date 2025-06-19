const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const chinaProgramsData = [
  {
    title: "北京文化沉浸式体验营",
    slug: "beijing-cultural-immersion",
    description: "深度探索北京的历史文化，参观故宫、长城等世界文化遗产，体验传统文化工坊，感受古都魅力。在这个为期两周的项目中，学生将深入了解中国传统文化，参与书法、武术等传统文化工坊，同时参观北京的著名景点。",
    country: "中国",
    city: "北京",
    duration: "2周；14天",
    deadline: new Date("2025-06-15"),
    featuredImage: "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?q=80&w=2070&fit=crop",
    gallery: JSON.stringify([
      "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?q=80&w=2070&fit=crop",
      "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2070&fit=crop"
    ]),
    type: JSON.stringify(["传统与艺术探索", "学术拓展"]),
    gradeLevel: JSON.stringify(["高中", "本科"]),
    sessions: JSON.stringify(["2025年7月1日 - 7月14日", "2025年7月15日 - 7月28日", "2025年8月1日 - 8月14日"]),
    highlights: JSON.stringify([
      "参观故宫、长城等世界文化遗产",
      "体验传统文化工坊：书法、武术、茶艺",
      "与北京大学学生交流",
      "探索胡同文化"
    ]),
    academics: JSON.stringify([
      "中国历史文化讲座",
      "传统艺术工作坊",
      "语言交流课程",
      "文化比较研究"
    ]),
    itinerary: JSON.stringify([
      "第1-3天：北京历史文化探索",
      "第4-6天：传统文化工坊体验",
      "第7-9天：现代北京与传统文化对比",
      "第10-12天：文化项目制作",
      "第13-14天：成果展示与总结"
    ]),
    requirements: JSON.stringify([
      "年龄16-25岁",
      "具备基本英语沟通能力",
      "对中国文化有浓厚兴趣",
      "身体健康，适应力强"
    ]),
    status: "PUBLISHED",
    language: "zh"
  },
  {
    title: "上海商业创新与科技探索",
    slug: "shanghai-business-innovation",
    description: "走进上海国际金融中心，参访知名企业，了解中国商业模式创新，体验前沿科技发展。深入了解中国的商业环境和创新生态系统。",
    country: "中国",
    city: "上海",
    duration: "2周；14天",
    deadline: new Date("2025-06-20"),
    featuredImage: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1f?q=80&w=2070&fit=crop",
    gallery: JSON.stringify([
      "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1f?q=80&w=2070&fit=crop",
      "https://images.unsplash.com/photo-1581362072978-14998d01fdaa?q=80&w=2070&fit=crop"
    ]),
    type: JSON.stringify(["商务", "STEM与科学创新"]),
    gradeLevel: JSON.stringify(["本科", "研究生"]),
    sessions: JSON.stringify(["2025年7月5日 - 7月18日", "2025年8月5日 - 8月18日"]),
    highlights: JSON.stringify([
      "参访阿里巴巴、腾讯等知名企业",
      "上海金融中心实地考察",
      "创新创业工作坊",
      "与企业高管面对面交流"
    ]),
    academics: JSON.stringify([
      "中国商业模式分析",
      "科技创新案例研究",
      "金融市场概览",
      "创业项目孵化"
    ]),
    itinerary: JSON.stringify([
      "第1-3天：上海商业环境概览",
      "第4-6天：科技企业参访",
      "第7-9天：金融中心深度体验",
      "第10-12天：创新项目实践",
      "第13-14天：商业计划展示"
    ]),
    requirements: JSON.stringify([
      "年龄18-28岁",
      "商科或理工科背景优先",
      "良好的英语沟通能力",
      "对商业创新有兴趣"
    ]),
    status: "PUBLISHED",
    language: "zh"
  },
  {
    title: "深圳科技硅谷创新之旅",
    slug: "shenzhen-tech-valley",
    description: "探访中国硅谷深圳，参观腾讯、华为等科技巨头，了解中国科技创新发展历程，体验前沿科技产品。",
    country: "中国",
    city: "深圳",
    duration: "10天",
    deadline: new Date("2025-06-25"),
    featuredImage: "https://images.unsplash.com/photo-1581362072978-14998d01fdaa?q=80&w=2070&fit=crop",
    gallery: JSON.stringify([
      "https://images.unsplash.com/photo-1581362072978-14998d01fdaa?q=80&w=2070&fit=crop"
    ]),
    type: JSON.stringify(["STEM与科学创新", "学术拓展"]),
    gradeLevel: JSON.stringify(["高中", "本科"]),
    sessions: JSON.stringify(["2025年7月10日 - 7月19日", "2025年8月10日 - 8月19日"]),
    highlights: JSON.stringify([
      "参观华为、腾讯总部",
      "深圳科技园区实地考察",
      "与科技从业者交流",
      "体验最新科技产品"
    ]),
    academics: JSON.stringify([
      "中国科技发展史",
      "人工智能应用案例",
      "5G技术发展",
      "科技创业生态"
    ]),
    itinerary: JSON.stringify([
      "第1-2天：深圳科技发展概览",
      "第3-4天：华为参访体验",
      "第5-6天：腾讯总部探访",
      "第7-8天：科技园区深度游",
      "第9-10天：科技项目展示"
    ]),
    requirements: JSON.stringify([
      "年龄16-24岁",
      "理工科背景优先",
      "对科技创新有浓厚兴趣",
      "基本英语沟通能力"
    ]),
    status: "PUBLISHED",
    language: "zh"
  }
]

async function main() {
  console.log('开始添加中国项目数据...')

  // 首先获取一个管理员用户作为作者
  const adminUser = await prisma.user.findFirst({
    where: {
      role: 'ADMIN'
    }
  })

  if (!adminUser) {
    console.error('未找到管理员用户，请先创建管理员用户')
    return
  }

  for (const programData of chinaProgramsData) {
    try {
      const existingProgram = await prisma.chinaProgram.findUnique({
        where: { slug: programData.slug }
      })

      if (existingProgram) {
        console.log(`项目 ${programData.title} 已存在，跳过...`)
        continue
      }

      // 查找城市ID
      const city = await prisma.city.findFirst({
        where: { name: programData.city }
      })

      const { city: cityName, ...restData } = programData

      const program = await prisma.chinaProgram.create({
        data: {
          ...restData,
          cityId: city?.id || null,
          authorId: adminUser.id,
          publishedAt: new Date()
        }
      })

      console.log(`✅ 创建项目: ${program.title}`)
    } catch (error) {
      console.error(`❌ 创建项目失败 ${programData.title}:`, error)
    }
  }

  console.log('中国项目数据添加完成！')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
