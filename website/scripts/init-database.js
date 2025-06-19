#!/usr/bin/env node

/**
 * EdGoing 数据库初始化脚本
 * 
 * 功能：
 * - Prisma迁移自动执行
 * - 基础数据初始化
 * - 管理员账户自动创建
 * - 默认分类和页面创建
 * - 系统设置初始化
 * - 健康检查功能
 */

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const { nanoid } = require('nanoid')

const prisma = new PrismaClient()

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
}

const log = {
  info: (msg) => console.log(`${colors.blue}[INFO]${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}[SUCCESS]${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}[WARNING]${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}[ERROR]${colors.reset} ${msg}`),
  step: (msg) => console.log(`${colors.magenta}[STEP]${colors.reset} ${msg}`)
}

// 创建管理员用户
async function createAdminUser() {
  log.step('创建管理员用户...')
  
  try {
    // 检查是否已存在管理员用户
    const existingAdmin = await prisma.users.findFirst({
      where: { role: 'ADMIN' }
    })
    
    if (existingAdmin) {
      log.info('管理员用户已存在，跳过创建')
      return existingAdmin
    }
    
    // 创建管理员用户
    const hashedPassword = await bcrypt.hash('admin123', 10)
    
    const admin = await prisma.users.create({
      data: {
        id: nanoid(),
        username: 'admin',
        email: 'admin@edgoing.com',
        name: '系统管理员',
        password: hashedPassword,
        role: 'ADMIN',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })
    
    log.success(`管理员用户创建成功: ${admin.username}`)
    log.warning('默认密码: admin123 (请立即修改)')
    
    return admin
  } catch (error) {
    log.error(`创建管理员用户失败: ${error.message}`)
    throw error
  }
}

// 创建默认分类
async function createDefaultCategories() {
  log.step('创建默认分类...')
  
  const categories = [
    { name: '学术项目', nameEn: 'Academic Programs' },
    { name: '文化体验', nameEn: 'Cultural Experience' },
    { name: '语言学习', nameEn: 'Language Learning' },
    { name: '实习项目', nameEn: 'Internship Programs' }
  ]
  
  try {
    for (const category of categories) {
      const existing = await prisma.program_types.findFirst({
        where: { name: category.name }
      })
      
      if (!existing) {
        await prisma.program_types.create({
          data: {
            id: nanoid(),
            name: category.name,
            nameEn: category.nameEn,
            isActive: true,
            order: categories.indexOf(category) + 1,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        })
        log.info(`创建分类: ${category.name}`)
      }
    }
    
    log.success('默认分类创建完成')
  } catch (error) {
    log.error(`创建默认分类失败: ${error.message}`)
    throw error
  }
}

// 创建默认页面
async function createDefaultPages(adminUser) {
  log.step('创建默认页面...')
  
  const pages = [
    {
      title: '关于我们',
      slug: 'about',
      content: '欢迎来到EdGoing海外教育平台。我们致力于为学生提供优质的海外教育项目和文化体验机会。',
      template: 'default'
    },
    {
      title: '联系我们',
      slug: 'contact',
      content: '如有任何问题，请随时联系我们。我们的团队将竭诚为您服务。',
      template: 'contact'
    },
    {
      title: '隐私政策',
      slug: 'privacy-policy',
      content: '我们重视您的隐私，本政策说明我们如何收集、使用和保护您的个人信息。',
      template: 'legal'
    }
  ]
  
  try {
    for (const page of pages) {
      const existing = await prisma.pages.findFirst({
        where: { slug: page.slug }
      })
      
      if (!existing) {
        await prisma.pages.create({
          data: {
            id: nanoid(),
            title: page.title,
            slug: page.slug,
            content: page.content,
            status: 'PUBLISHED',
            language: 'zh',
            template: page.template,
            authorId: adminUser.id,
            publishedAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date()
          }
        })
        log.info(`创建页面: ${page.title}`)
      }
    }
    
    log.success('默认页面创建完成')
  } catch (error) {
    log.error(`创建默认页面失败: ${error.message}`)
    throw error
  }
}

// 创建系统设置
async function createSystemSettings() {
  log.step('初始化系统设置...')
  
  const settings = [
    { key: 'site_title', value: 'EdGoing海外教育平台', type: 'TEXT' },
    { key: 'site_description', value: '专业的海外教育项目平台', type: 'TEXT' },
    { key: 'contact_email', value: 'contact@edgoing.com', type: 'EMAIL' },
    { key: 'contact_phone', value: '+86-400-123-4567', type: 'TEXT' },
    { key: 'max_file_size', value: '10485760', type: 'NUMBER' },
    { key: 'items_per_page', value: '12', type: 'NUMBER' }
  ]
  
  try {
    for (const setting of settings) {
      const existing = await prisma.settings.findFirst({
        where: { 
          key: setting.key,
          language: 'zh'
        }
      })
      
      if (!existing) {
        await prisma.settings.create({
          data: {
            id: nanoid(),
            key: setting.key,
            value: setting.value,
            type: setting.type,
            language: 'zh',
            createdAt: new Date(),
            updatedAt: new Date()
          }
        })
        log.info(`创建设置: ${setting.key}`)
      }
    }
    
    log.success('系统设置初始化完成')
  } catch (error) {
    log.error(`初始化系统设置失败: ${error.message}`)
    throw error
  }
}

// 创建默认FAQ
async function createDefaultFAQs(adminUser) {
  log.step('创建默认FAQ...')
  
  const faqs = [
    {
      question: '如何申请项目？',
      answer: '您可以在项目详情页面点击"立即申请"按钮，填写申请表单即可。我们的团队会在24小时内与您联系。',
      category: 'application'
    },
    {
      question: '项目费用包含什么？',
      answer: '项目费用通常包含住宿、餐饮、课程费用和部分活动费用。具体包含内容请查看各项目的详细说明。',
      category: 'payment'
    },
    {
      question: '需要什么签证？',
      answer: '根据目的地国家不同，签证要求也不同。我们会为您提供详细的签证指导和协助。',
      category: 'visa'
    }
  ]
  
  try {
    for (const faq of faqs) {
      const existing = await prisma.faqs.findFirst({
        where: { question: faq.question }
      })
      
      if (!existing) {
        await prisma.faqs.create({
          data: {
            id: nanoid(),
            question: faq.question,
            answer: faq.answer,
            category: faq.category,
            isActive: true,
            order: faqs.indexOf(faq) + 1,
            authorId: adminUser.id,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        })
        log.info(`创建FAQ: ${faq.question}`)
      }
    }
    
    log.success('默认FAQ创建完成')
  } catch (error) {
    log.error(`创建默认FAQ失败: ${error.message}`)
    throw error
  }
}

// 健康检查
async function healthCheck() {
  log.step('执行数据库健康检查...')
  
  try {
    // 检查数据库连接
    await prisma.$queryRaw`SELECT 1`
    log.success('数据库连接正常')
    
    // 检查关键表
    const userCount = await prisma.users.count()
    const pageCount = await prisma.pages.count()
    const settingCount = await prisma.settings.count()
    
    log.info(`用户数量: ${userCount}`)
    log.info(`页面数量: ${pageCount}`)
    log.info(`设置数量: ${settingCount}`)
    
    log.success('数据库健康检查通过')
    
    return {
      status: 'healthy',
      users: userCount,
      pages: pageCount,
      settings: settingCount
    }
  } catch (error) {
    log.error(`数据库健康检查失败: ${error.message}`)
    throw error
  }
}

// 主函数
async function main() {
  console.log(`${colors.cyan}╔══════════════════════════════════════════════════════════════╗${colors.reset}`)
  console.log(`${colors.cyan}║                EdGoing 数据库初始化脚本                      ║${colors.reset}`)
  console.log(`${colors.cyan}╚══════════════════════════════════════════════════════════════╝${colors.reset}`)
  console.log()
  
  try {
    // 检查数据库连接
    log.info('连接数据库...')
    await prisma.$connect()
    log.success('数据库连接成功')
    
    // 执行初始化步骤
    const adminUser = await createAdminUser()
    await createDefaultCategories()
    await createDefaultPages(adminUser)
    await createSystemSettings()
    await createDefaultFAQs(adminUser)
    
    // 健康检查
    const healthResult = await healthCheck()
    
    console.log()
    console.log(`${colors.green}╔══════════════════════════════════════════════════════════════╗${colors.reset}`)
    console.log(`${colors.green}║                    🎉 初始化完成！                           ║${colors.reset}`)
    console.log(`${colors.green}╚══════════════════════════════════════════════════════════════╝${colors.reset}`)
    console.log()
    console.log(`${colors.cyan}管理员登录信息:${colors.reset}`)
    console.log(`  用户名: admin`)
    console.log(`  密码: admin123`)
    console.log(`  ${colors.yellow}⚠️  请立即登录后台修改默认密码！${colors.reset}`)
    console.log()
    
  } catch (error) {
    log.error(`初始化失败: ${error.message}`)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main()
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}

module.exports = {
  createAdminUser,
  createDefaultCategories,
  createDefaultPages,
  createSystemSettings,
  createDefaultFAQs,
  healthCheck
}
