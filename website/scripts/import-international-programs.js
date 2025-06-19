const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

// 生成URL友好的slug
function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // 移除特殊字符
    .replace(/\s+/g, '-') // 空格替换为连字符
    .replace(/-+/g, '-') // 多个连字符合并为一个
    .trim('-') // 移除首尾连字符
}

// 确保slug唯一
async function ensureUniqueSlug(baseSlug) {
  let slug = baseSlug
  let counter = 1

  while (true) {
    const existing = await prisma.internationalProgram.findUnique({
      where: { slug }
    })

    if (!existing) {
      return slug
    }

    slug = `${baseSlug}-${counter}`
    counter++
  }
}

// 获取或创建国家
async function getOrCreateCountry(countryNameZh, countryNameEn) {
  let country = await prisma.country.findFirst({
    where: {
      OR: [
        { name: countryNameZh },
        { nameEn: countryNameEn }
      ]
    }
  })

  if (!country) {
    country = await prisma.country.create({
      data: {
        name: countryNameZh,
        nameEn: countryNameEn,
        isActive: true
      }
    })
    console.log(`创建新国家: ${countryNameZh} (${countryNameEn})`)
  }

  return country
}

// 获取或创建项目类型
async function getOrCreateProgramType(typeNameZh, typeNameEn) {
  let programType = await prisma.programType.findFirst({
    where: {
      OR: [
        { name: typeNameZh },
        { nameEn: typeNameEn }
      ]
    }
  })

  if (!programType) {
    programType = await prisma.programType.create({
      data: {
        name: typeNameZh,
        nameEn: typeNameEn,
        isActive: true
      }
    })
    console.log(`创建新项目类型: ${typeNameZh} (${typeNameEn})`)
  }

  return programType
}

// 获取或创建年级
async function getOrCreateGradeLevel(gradeLevelZh, gradeLevelEn) {
  let gradeLevel = await prisma.gradeLevel.findFirst({
    where: {
      OR: [
        { name: gradeLevelZh },
        { nameEn: gradeLevelEn }
      ]
    }
  })

  if (!gradeLevel) {
    gradeLevel = await prisma.gradeLevel.create({
      data: {
        name: gradeLevelZh,
        nameEn: gradeLevelEn,
        isActive: true
      }
    })
    console.log(`创建新年级: ${gradeLevelZh} (${gradeLevelEn})`)
  }

  return gradeLevel
}

// 获取或创建城市
async function getOrCreateCity(cityNameZh, cityNameEn, country) {
  let city = await prisma.city.findFirst({
    where: {
      OR: [
        { name: cityNameZh },
        { nameEn: cityNameEn }
      ]
    }
  })

  if (!city) {
    city = await prisma.city.create({
      data: {
        name: cityNameZh,
        nameEn: cityNameEn,
        countryId: country.id,
        isActive: true
      }
    })
    console.log(`创建新城市: ${cityNameZh} (${cityNameEn}) - ${country.name}`)
  }

  return city
}

// 处理单个JSON文件
async function processJsonFile(filePath, authorId) {
  const fileName = path.basename(filePath, '.json')
  console.log(`\n处理文件: ${fileName}`)

  try {
    let jsonContent = fs.readFileSync(filePath, 'utf8').trim()

    // 处理JSON格式问题
    if (!jsonContent.startsWith('{')) {
      jsonContent = `{${jsonContent}}`
    }
    if (!jsonContent.endsWith('}')) {
      jsonContent = `${jsonContent}}`
    }

    let data
    try {
      data = JSON.parse(jsonContent)
    } catch (parseError) {
      console.error(`JSON解析错误 (${fileName}):`, parseError.message)
      console.log('尝试修复JSON格式...')

      // 尝试修复常见的JSON格式问题
      jsonContent = jsonContent
        .replace(/,\s*}/g, '}') // 移除对象末尾的逗号
        .replace(/,\s*]/g, ']') // 移除数组末尾的逗号
        .replace(/"\s*\n\s*"/g, '",\n  "') // 修复缺失的逗号

      data = JSON.parse(jsonContent)
    }

    // 生成基础slug（使用英文标题）
    const baseSlug = generateSlug(data.title_en)
    const uniqueSlug = await ensureUniqueSlug(baseSlug)

    // 处理国家数据
    const countryZh = Array.isArray(data.country_zh) ? data.country_zh[0] : data.country_zh
    const countryEn = Array.isArray(data.country_en) ? data.country_en[0] : data.country_en
    const country = await getOrCreateCountry(countryZh, countryEn)

    // 处理城市数据
    let city = null
    if (data.city_zh && data.city_en) {
      const cityZh = Array.isArray(data.city_zh) ? data.city_zh[0] : data.city_zh
      const cityEn = Array.isArray(data.city_en) ? data.city_en[0] : data.city_en
      city = await getOrCreateCity(cityZh, cityEn, country)
    } else {
      // 如果没有城市数据，根据国家创建默认城市
      const defaultCityMap = {
        '新加坡': { zh: '新加坡', en: 'Singapore' },
        'Singapore': { zh: '新加坡', en: 'Singapore' },
        '英国': { zh: '伦敦', en: 'London' },
        'United Kingdom': { zh: '伦敦', en: 'London' },
        '美国': { zh: '纽约', en: 'New York' },
        'United States': { zh: '纽约', en: 'New York' },
        '日本': { zh: '东京', en: 'Tokyo' },
        'Japan': { zh: '东京', en: 'Tokyo' },
        '马来西亚': { zh: '吉隆坡', en: 'Kuala Lumpur' },
        'Malaysia': { zh: '吉隆坡', en: 'Kuala Lumpur' }
      }

      const defaultCity = defaultCityMap[countryZh] || defaultCityMap[countryEn]
      if (defaultCity) {
        city = await getOrCreateCity(defaultCity.zh, defaultCity.en, country)
      }
    }

    // 处理项目类型数据
    const programTypes = []
    if (data.program_type_zh && data.program_type_en) {
      const typesZh = Array.isArray(data.program_type_zh) ? data.program_type_zh : [data.program_type_zh]
      const typesEn = Array.isArray(data.program_type_en) ? data.program_type_en : [data.program_type_en]

      for (let i = 0; i < Math.max(typesZh.length, typesEn.length); i++) {
        const typeZh = typesZh[i] || typesZh[0]
        const typeEn = typesEn[i] || typesEn[0]
        const programType = await getOrCreateProgramType(typeZh, typeEn)
        programTypes.push(programType.name)
      }
    }

    // 处理年级数据
    const gradeLevels = []
    if (data.grade_level_zh && data.grade_level_en) {
      const gradesZh = Array.isArray(data.grade_level_zh) ? data.grade_level_zh : [data.grade_level_zh]
      const gradesEn = Array.isArray(data.grade_level_en) ? data.grade_level_en : [data.grade_level_en]

      for (let i = 0; i < Math.max(gradesZh.length, gradesEn.length); i++) {
        const gradeZh = gradesZh[i] || gradesZh[0]
        const gradeEn = gradesEn[i] || gradesEn[0]
        const gradeLevel = await getOrCreateGradeLevel(gradeZh, gradeEn)
        gradeLevels.push(gradeLevel.name)
      }
    }

    // 创建国际项目主记录
    const program = await prisma.internationalProgram.create({
      data: {
        title: data.title_zh || data.title_en || '未命名项目', // 添加必需的title字段
        slug: uniqueSlug,
        description: data.overview_zh || data.overview_en || '', // 添加必需的description字段
        status: 'PUBLISHED',
        language: 'zh', // 默认语言
        country: country.name,
        cityId: city ? city.id : null, // 添加城市ID
        duration: data.duration_zh || data.duration_en || '',
        type: JSON.stringify(programTypes),
        gradeLevel: JSON.stringify(gradeLevels),
        publishedAt: new Date(),
        authorId: authorId
      }
    })

    console.log(`创建项目: ${uniqueSlug}`)

    // 创建中文翻译
    await prisma.internationalProgramTranslation.create({
      data: {
        programId: program.id,
        language: 'zh',
        title: data.title_zh || '',
        description: data.overview_zh || '',
        duration: data.duration_zh || '',
        highlights: JSON.stringify([data.highlights_zh || '']),
        academics: JSON.stringify([data.features_zh || '']),
        itinerary: JSON.stringify([data.itinerary_zh || '']),
        requirements: JSON.stringify([data.other_info_zh || '']),
        sessions: JSON.stringify([]),
        materials: JSON.stringify([])
      }
    })

    // 创建英文翻译
    await prisma.internationalProgramTranslation.create({
      data: {
        programId: program.id,
        language: 'en',
        title: data.title_en || '',
        description: data.overview_en || '',
        duration: data.duration_en || '',
        highlights: JSON.stringify([data.highlights_en || '']),
        academics: JSON.stringify([data.features_en || '']),
        itinerary: JSON.stringify([data.itinerary_en || '']),
        requirements: JSON.stringify([data.other_info_en || '']),
        sessions: JSON.stringify([]),
        materials: JSON.stringify([])
      }
    })

    console.log(`✅ 成功导入项目: ${data.title_zh} / ${data.title_en}`)
    return program

  } catch (error) {
    console.error(`❌ 处理文件 ${fileName} 时出错:`, error.message)
    throw error
  }
}

// 主函数
async function main() {
  try {
    console.log('🚀 开始导入国际项目数据...')

    // 获取或创建默认用户
    let author = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    })

    if (!author) {
      // 如果没有管理员用户，创建一个默认用户
      author = await prisma.user.create({
        data: {
          email: 'admin@edgoing.com',
          username: 'admin',
          password: 'hashed_password', // 在实际使用中应该是哈希密码
          role: 'ADMIN',
          name: '系统管理员'
        }
      })
      console.log('创建默认管理员用户')
    }

    // 获取JSON文件目录
    const programsDir = path.join(__dirname, '../public/content/programs')

    if (!fs.existsSync(programsDir)) {
      throw new Error(`目录不存在: ${programsDir}`)
    }

    // 读取所有JSON文件
    const files = fs.readdirSync(programsDir)
      .filter(file => file.endsWith('.json'))
      .sort()

    console.log(`找到 ${files.length} 个JSON文件`)

    let successCount = 0
    let errorCount = 0

    // 处理每个文件
    for (const file of files) {
      try {
        const filePath = path.join(programsDir, file)
        await processJsonFile(filePath, author.id)
        successCount++
      } catch (error) {
        console.error(`处理文件 ${file} 失败:`, error.message)
        errorCount++
      }
    }

    console.log('\n📊 导入统计:')
    console.log(`✅ 成功: ${successCount} 个项目`)
    console.log(`❌ 失败: ${errorCount} 个项目`)
    console.log(`📁 总计: ${files.length} 个文件`)

    if (successCount > 0) {
      console.log('\n🎉 数据导入完成！')
      console.log('你可以在CMS管理界面查看导入的项目：')
      console.log('- 中文版本: http://localhost:3000/admin/international-programs?lang=zh')
      console.log('- 英文版本: http://localhost:3000/admin/international-programs?lang=en')
    }

  } catch (error) {
    console.error('❌ 导入过程中发生错误:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// 运行脚本
if (require.main === module) {
  main()
    .catch((error) => {
      console.error('❌ 脚本执行失败:', error)
      process.exit(1)
    })
}

module.exports = {
  processJsonFile,
  generateSlug,
  ensureUniqueSlug
}
