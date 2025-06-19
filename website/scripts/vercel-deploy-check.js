#!/usr/bin/env node

/**
 * 🔍 Vercel部署前检查脚本
 * 
 * 检查项目是否准备好部署到Vercel
 */

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

function checkFile(filePath, description) {
  const exists = fs.existsSync(filePath)
  if (exists) {
    log(`✅ ${description}`, 'green')
  } else {
    log(`❌ ${description} - 文件不存在: ${filePath}`, 'red')
  }
  return exists
}

function checkEnvVar(varName, description) {
  const value = process.env[varName]
  if (value && value !== 'undefined') {
    log(`✅ ${description}`, 'green')
    return true
  } else {
    log(`❌ ${description} - 环境变量未设置: ${varName}`, 'red')
    return false
  }
}

async function runDeploymentCheck() {
  log('🔍 Vercel部署前检查开始...', 'cyan')
  log('', 'reset')
  
  let allChecksPass = true
  
  // 1. 检查必要文件
  log('📁 检查必要文件...', 'blue')
  const fileChecks = [
    ['package.json', 'Package.json 文件'],
    ['next.config.mjs', 'Next.js 配置文件'],
    ['vercel.json', 'Vercel 配置文件'],
    ['prisma/schema.prisma', 'Prisma Schema 文件'],
    ['app/layout.tsx', '根布局文件'],
    ['app/page.tsx', '首页文件']
  ]
  
  for (const [file, desc] of fileChecks) {
    if (!checkFile(file, desc)) {
      allChecksPass = false
    }
  }
  
  log('', 'reset')
  
  // 2. 检查环境变量
  log('🌍 检查环境变量...', 'blue')
  const envChecks = [
    ['DATABASE_URL', 'PostgreSQL 数据库连接'],
    ['JWT_SECRET', 'JWT 密钥'],
    ['NODE_ENV', '环境变量']
  ]
  
  for (const [envVar, desc] of envChecks) {
    if (!checkEnvVar(envVar, desc)) {
      allChecksPass = false
    }
  }
  
  log('', 'reset')
  
  // 3. 检查数据库配置
  log('🗄️ 检查数据库配置...', 'blue')
  try {
    const schemaContent = fs.readFileSync('prisma/schema.prisma', 'utf8')
    
    if (schemaContent.includes('provider = "postgresql"')) {
      log('✅ 数据库配置为 PostgreSQL', 'green')
    } else if (schemaContent.includes('provider = "sqlite"')) {
      log('⚠️  数据库仍为 SQLite - Vercel不支持SQLite', 'yellow')
      log('   请切换到 PostgreSQL 或使用 schema.postgresql.prisma', 'yellow')
      allChecksPass = false
    } else {
      log('❌ 无法识别数据库配置', 'red')
      allChecksPass = false
    }
    
    if (schemaContent.includes('url      = env("DATABASE_URL")')) {
      log('✅ 数据库URL使用环境变量', 'green')
    } else {
      log('❌ 数据库URL未使用环境变量', 'red')
      allChecksPass = false
    }
    
  } catch (error) {
    log('❌ 无法读取 Prisma schema 文件', 'red')
    allChecksPass = false
  }
  
  log('', 'reset')
  
  // 4. 检查Next.js配置
  log('⚙️ 检查 Next.js 配置...', 'blue')
  try {
    const nextConfigContent = fs.readFileSync('next.config.mjs', 'utf8')
    
    if (nextConfigContent.includes('process.env.VERCEL')) {
      log('✅ Next.js 配置支持 Vercel 部署', 'green')
    } else {
      log('⚠️  Next.js 配置可能需要调整', 'yellow')
    }
    
    if (nextConfigContent.includes('output:')) {
      log('✅ 输出模式已配置', 'green')
    } else {
      log('⚠️  未配置输出模式', 'yellow')
    }
    
  } catch (error) {
    log('❌ 无法读取 Next.js 配置文件', 'red')
    allChecksPass = false
  }
  
  log('', 'reset')
  
  // 5. 检查依赖
  log('📦 检查依赖...', 'blue')
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
    
    const requiredDeps = ['next', 'react', 'react-dom', '@prisma/client', 'prisma']
    for (const dep of requiredDeps) {
      if (packageJson.dependencies[dep] || packageJson.devDependencies[dep]) {
        log(`✅ 依赖 ${dep} 已安装`, 'green')
      } else {
        log(`❌ 缺少依赖: ${dep}`, 'red')
        allChecksPass = false
      }
    }
    
    if (packageJson.scripts.build) {
      log('✅ 构建脚本已配置', 'green')
    } else {
      log('❌ 缺少构建脚本', 'red')
      allChecksPass = false
    }
    
  } catch (error) {
    log('❌ 无法读取 package.json 文件', 'red')
    allChecksPass = false
  }
  
  log('', 'reset')
  
  // 总结
  if (allChecksPass) {
    log('🎉 所有检查通过！项目准备好部署到 Vercel', 'green')
    log('', 'reset')
    log('📋 部署步骤:', 'blue')
    log('1. 提交代码到 Git 仓库', 'cyan')
    log('2. 在 Vercel 中导入项目', 'cyan')
    log('3. 设置根目录为 "website"', 'cyan')
    log('4. 配置环境变量', 'cyan')
    log('5. 部署项目', 'cyan')
  } else {
    log('❌ 检查失败！请修复上述问题后再部署', 'red')
    log('', 'reset')
    log('📖 参考文档: VERCEL_DEPLOYMENT.md', 'blue')
  }
  
  return allChecksPass
}

// 运行检查
if (require.main === module) {
  runDeploymentCheck().then(success => {
    process.exit(success ? 0 : 1)
  })
}

module.exports = { runDeploymentCheck }
