const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function seedVideos() {
  try {
    console.log('开始创建测试视频数据...')

    // 首先获取一个用户ID
    const user = await prisma.users.findFirst()
    if (!user) {
      console.error('没有找到用户，请先创建用户')
      return
    }

    // 创建测试视频数据
    const videos = [
      {
        slug: 'our-project-introduction',
        categoryZh: '项目介绍',
        categoryEn: 'Project Introduction',
        titleZh: '我们项目的介绍',
        titleEn: 'Our Project Introduction',
        descriptionZh: '了解我们的教育项目和服务，探索国际化学习的精彩旅程',
        descriptionEn: 'Learn about our educational programs and services, explore the exciting journey of international learning',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        isPublished: true,
        order: 1,
        uploadedBy: user.id,
      },
      {
        slug: 'cultural-exchange-program',
        categoryZh: '文化交流',
        categoryEn: 'Cultural Exchange',
        titleZh: '文化交流项目',
        titleEn: 'Cultural Exchange Program',
        descriptionZh: '体验不同文化的精彩交流，感受多元文化的魅力',
        descriptionEn: 'Experience exciting cultural exchanges and feel the charm of multiculturalism',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        isPublished: true,
        order: 2,
        uploadedBy: user.id,
      },
      {
        slug: 'study-abroad-experience',
        categoryZh: '学习体验',
        categoryEn: 'Study Experience',
        titleZh: '海外学习体验',
        titleEn: 'Study Abroad Experience',
        descriptionZh: '探索海外学习的精彩旅程，开拓国际视野',
        descriptionEn: 'Explore the exciting journey of studying abroad and broaden your international perspective',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        isPublished: false,
        order: 3,
        uploadedBy: user.id,
      }
    ]

    for (const videoData of videos) {
      const existingVideo = await prisma.videos.findUnique({
        where: { slug: videoData.slug }
      })

      if (!existingVideo) {
        // Generate a unique ID for the video
        const videoId = `video_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        const now = new Date()
        await prisma.videos.create({
          data: {
            id: videoId,
            updatedAt: now,
            ...videoData
          }
        })
        console.log(`创建视频: ${videoData.titleZh}`)
      } else {
        console.log(`视频已存在: ${videoData.titleZh}`)
      }
    }

    console.log('视频数据创建完成！')
  } catch (error) {
    console.error('创建视频数据时出错:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedVideos()
