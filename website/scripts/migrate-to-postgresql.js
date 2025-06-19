#!/usr/bin/env node

/**
 * 🔄 数据库迁移脚本：SQLite -> PostgreSQL
 * 
 * 用于将本地SQLite数据迁移到Vercel PostgreSQL
 */

const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

async function migrateDatabase() {
  log('🔄 开始数据库迁移...', 'cyan')
  
  try {
    // 检查环境变量
    const sqliteUrl = 'file:./dev.db'
    const postgresUrl = process.env.DATABASE_URL
    
    if (!postgresUrl || postgresUrl.includes('sqlite') || postgresUrl.includes('file:')) {
      log('❌ 错误：请设置正确的PostgreSQL DATABASE_URL环境变量', 'red')
      log('示例：DATABASE_URL="postgresql://user:pass@host:port/db"', 'yellow')
      process.exit(1)
    }
    
    log('📊 连接到SQLite数据库...', 'blue')
    const sqlitePrisma = new PrismaClient({
      datasources: {
        db: {
          url: sqliteUrl
        }
      }
    })
    
    log('📊 连接到PostgreSQL数据库...', 'blue')
    const postgresPrisma = new PrismaClient({
      datasources: {
        db: {
          url: postgresUrl
        }
      }
    })
    
    // 迁移数据的表列表（按依赖关系排序）
    const tables = [
      'users',
      'countries',
      'cities',
      'grade_levels',
      'program_types',
      'media',
      'settings',
      'newsletters',
      'partners',
      'partner_logos',
      'hero_pages',
      'homepage_showcases',
      'faqs',
      'pages',
      'programs',
      'china_programs',
      'international_programs',
      'blogs',
      'testimonials',
      'videos',
      'applications',
      'china_applications',
      'international_applications',
      'sessions'
    ]
    
    log('🚀 开始迁移数据...', 'green')
    
    for (const table of tables) {
      try {
        log(`📋 迁移表: ${table}`, 'yellow')
        
        // 从SQLite读取数据
        const data = await sqlitePrisma[table].findMany()
        
        if (data.length === 0) {
          log(`  ⚠️  表 ${table} 为空，跳过`, 'yellow')
          continue
        }
        
        // 写入PostgreSQL
        for (const record of data) {
          try {
            await postgresPrisma[table].create({
              data: record
            })
          } catch (error) {
            // 如果记录已存在，尝试更新
            if (error.code === 'P2002') {
              log(`  🔄 记录已存在，尝试更新: ${record.id}`, 'yellow')
              await postgresPrisma[table].update({
                where: { id: record.id },
                data: record
              })
            } else {
              throw error
            }
          }
        }
        
        log(`  ✅ 成功迁移 ${data.length} 条记录`, 'green')
        
      } catch (error) {
        log(`  ❌ 迁移表 ${table} 失败: ${error.message}`, 'red')
        // 继续迁移其他表
      }
    }
    
    log('🎉 数据库迁移完成！', 'green')
    
    // 关闭连接
    await sqlitePrisma.$disconnect()
    await postgresPrisma.$disconnect()
    
  } catch (error) {
    log(`❌ 迁移失败: ${error.message}`, 'red')
    process.exit(1)
  }
}

// 运行迁移
if (require.main === module) {
  migrateDatabase()
}

module.exports = { migrateDatabase }
