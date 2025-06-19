const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const testimonialsData = [
  {
    content: "参加新加坡STEM营让我对人工智能有了全新的认识。在南洋理工大学的实验室里，我们亲手制作了机器人，学习了编程，还参观了最前沿的科技公司。这次经历不仅提升了我的科学素养，更重要的是让我明确了未来的学习方向。",
    author: "李明",
    role: "高中生",
    program: "新加坡STEM与AI营",
    status: "PUBLISHED",
    language: "zh",
    order: 1,
    translations: {
      en: {
        content: "Participating in the Singapore STEM camp gave me a completely new understanding of artificial intelligence. In the laboratories at Nanyang Technological University, we built robots with our own hands, learned programming, and visited cutting-edge technology companies. This experience not only improved my scientific literacy, but more importantly, it clarified my future learning direction.",
        author: "Li Ming",
        role: "High School Student",
        program: "Singapore STEM & AI Camp"
      }
    }
  },
  {
    content: "剑桥大学暑期项目是我人生中最难忘的经历之一。在世界顶尖学府的课堂上，我不仅学到了专业知识，更重要的是学会了批判性思维。与来自世界各地的同学交流，让我的视野变得更加开阔。",
    author: "王小雨",
    role: "大学生",
    program: "剑桥大学暑期项目",
    status: "PUBLISHED",
    language: "zh",
    order: 2,
    translations: {
      en: {
        content: "The Cambridge University summer program was one of the most unforgettable experiences of my life. In the classrooms of this world-class institution, I not only learned professional knowledge, but more importantly, I learned critical thinking. Communicating with classmates from all over the world broadened my horizons significantly.",
        author: "Wang Xiaoyu",
        role: "University Student",
        program: "Cambridge University Summer Program"
      }
    }
  },
  {
    content: "北京文化沉浸式体验营让我深深爱上了中国传统文化。从故宫的宏伟建筑到胡同的市井生活，从书法的优雅到武术的刚劲，每一个体验都让我震撼。这次旅程不仅是文化的学习，更是心灵的洗礼。",
    author: "Sarah Johnson",
    role: "交换生",
    program: "北京文化沉浸式体验营",
    status: "PUBLISHED",
    language: "zh",
    order: 3,
    translations: {
      en: {
        content: "The Beijing Cultural Immersion Camp made me fall deeply in love with traditional Chinese culture. From the magnificent architecture of the Forbidden City to the daily life in the hutongs, from the elegance of calligraphy to the strength of martial arts, every experience was shocking. This journey was not only cultural learning, but also spiritual baptism.",
        author: "Sarah Johnson",
        role: "Exchange Student",
        program: "Beijing Cultural Immersion Camp"
      }
    }
  },
  {
    content: "日本东京动漫文化探索项目让我这个动漫迷圆了梦！参观动画制作公司，与知名声优面对面交流，还学习了日本传统文化。这次经历让我对日本文化有了更深层次的理解，也坚定了我学习日语的决心。",
    author: "张小明",
    role: "高中生",
    program: "日本东京动漫文化探索项目",
    status: "PUBLISHED",
    language: "zh",
    order: 4,
    translations: {
      en: {
        content: "The Japan Tokyo Anime Culture Exploration Program fulfilled my dream as an anime fan! Visiting animation production companies, face-to-face communication with famous voice actors, and learning about traditional Japanese culture. This experience gave me a deeper understanding of Japanese culture and strengthened my determination to learn Japanese.",
        author: "Zhang Xiaoming",
        role: "High School Student",
        program: "Japan Tokyo Anime Culture Exploration Program"
      }
    }
  },
  {
    content: "美国精英大学之旅让我对美国高等教育有了全面的了解。参观哈佛、MIT、斯坦福等顶尖大学，与招生官面对面交流，还体验了美式课堂。这次经历为我的留学申请提供了宝贵的经验和明确的目标。",
    author: "陈思雨",
    role: "高中生",
    program: "美国精英大学之旅",
    status: "PUBLISHED",
    language: "zh",
    order: 5,
    translations: {
      en: {
        content: "The American Elite Universities Tour gave me a comprehensive understanding of American higher education. Visiting top universities like Harvard, MIT, and Stanford, face-to-face communication with admissions officers, and experiencing American-style classrooms. This experience provided valuable experience and clear goals for my study abroad applications.",
        author: "Chen Siyu",
        role: "High School Student",
        program: "American Elite Universities Tour"
      }
    }
  }
]

async function main() {
  console.log('开始添加学员故事数据...')

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

  for (const testimonialData of testimonialsData) {
    try {
      const existingTestimonial = await prisma.testimonial.findFirst({
        where: { 
          author: testimonialData.author,
          language: testimonialData.language
        }
      })

      if (existingTestimonial) {
        console.log(`学员故事 ${testimonialData.author} 已存在，跳过...`)
        continue
      }

      const { translations, ...mainData } = testimonialData

      const testimonial = await prisma.testimonial.create({
        data: {
          ...mainData,
          authorId: adminUser.id,
          publishedAt: new Date(),
          translations: {
            create: [
              {
                language: 'en',
                content: translations.en.content,
                author: translations.en.author,
                role: translations.en.role,
                program: translations.en.program
              }
            ]
          }
        }
      })

      console.log(`✅ 创建学员故事: ${testimonial.author}`)
    } catch (error) {
      console.error(`❌ 创建学员故事失败 ${testimonialData.author}:`, error)
    }
  }

  console.log('学员故事数据添加完成！')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
