import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireEditor } from '@/lib/middleware'

// 🛡️ 强制此路由为动态，避免静态生成时的问题
export const dynamic = 'force-dynamic'


// Get all content settings for the website
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireEditor(request)
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const { searchParams } = new URL(request.url)
    const language = searchParams.get('language') || 'zh'

    // Get all settings that are used for website content
    const contentKeys = [
      // 网站基本信息
      'site_title',
      'site_description',
      'site_keywords',

      // 导航栏
      'nav_home',
      'nav_about',
      'nav_programs',
      'nav_study_china',
      'nav_blog',
      'nav_contact',
      'nav_faq',

      // Banner轮播图
      'banner_1_title',
      'banner_1_subtitle',
      'banner_1_cta',
      'banner_1_link',
      'banner_2_title',
      'banner_2_subtitle',
      'banner_2_cta',
      'banner_2_link',
      'banner_3_title',
      'banner_3_subtitle',
      'banner_3_cta',
      'banner_3_link',
      'banner_4_title',
      'banner_4_subtitle',
      'banner_4_cta',
      'banner_4_link',
      'banner_5_title',
      'banner_5_subtitle',
      'banner_5_cta',
      'banner_5_link',

      // 首页英雄区域
      'hero_title',
      'hero_subtitle',
      'hero_explore',
      'hero_learn',
      'hero_grow',
      'hero_button_text',

      // 项目展示
      '游学中国新视角：激发灵感、建立联系、实现蜕变的旅程.',
      '查看所有项目 →',
      'program_1_title',
      'program_1_subtitle',
      'program_2_title',
      'program_2_subtitle',
      'program_3_title',
      'program_3_subtitle',

      // 关于我们
      'about_title',
      'about_subtitle',
      'about_description',
          'about_mission_title',
    'about_mission_description',
    'mission_point_1',
    'mission_point_2', 
    'mission_point_3',
    'mission_point_4',
    'mission_point_5',
    'mission_point_6',
    'mission_quote_title',
    'mission_quote',
    'about_vision_title',
      'about_vision_description',

      // 为什么选择EdGoing
      'why_choose_title',
      'why_choose_subtitle',
      'why_choose_expertise_title',
      'why_choose_expertise_description',
      'why_choose_global_title',
      'why_choose_global_description',
      'why_choose_safety_title',
      'why_choose_safety_description',

      // 学员支持与安全
      'student_support_title',
      'student_support_subtitle',
      'support_leadership_title',
      'support_leadership_description',
      'support_education_title',
      'support_education_description',
      'support_accommodation_title',
      'support_accommodation_description',
      'support_247_title',
      'support_247_description',
      'support_cultural_title',
      'support_cultural_description',
      'support_academic_title',
      'support_academic_description',

      // 学员故事
      'testimonials_title',
      'testimonials_subtitle',
      'testimonial_1_content',
      'testimonial_1_author',
      'testimonial_1_role',
      'testimonial_1_program',
      'testimonial_2_content',
      'testimonial_2_author',
      'testimonial_2_role',
      'testimonial_2_program',
      'testimonial_3_content',
      'testimonial_3_author',
      'testimonial_3_role',
      'testimonial_3_program',

      // 邮件订阅
      'newsletter_title',
      'newsletter_subtitle',
      'newsletter_placeholder',
      'newsletter_button',

      // 行动号召
      'cta_title',
      'cta_subtitle',
      'cta_button_text',



      // 页脚导航链接
      'footer_nav_home',
      'footer_nav_world_study',
      'footer_nav_china_study',
      'footer_nav_blog',
      'footer_nav_about',
      'footer_nav_faq',
      'footer_nav_contact',

      // 联系页面
      'contact_title',
      'contact_subtitle',
      'contact_form_name',
      'contact_form_email',
      'contact_form_message',
      'contact_form_submit',

      // 项目页面
      'programs_title',
      'programs_subtitle',
      'programs_search_placeholder',
      'programs_filter_country',
      'programs_filter_type',
      'programs_no_results',
    ]

    const settings = await prisma.settings.findMany({
      where: {
        key: { in: contentKeys },
        language,
      },
      include: {
        setting_translations: true,
      },
    })

    // Create default settings if they don't exist
    const existingKeys = settings.map(s => s.key)
    const missingKeys = contentKeys.filter(key => !existingKeys.includes(key))

    const defaultValues: Record<string, string> = {
      // 网站基本信息
      site_title: language === 'zh' ? 'EdGoing - Explore. Learn. Grow.' : 'EdGoing - Explore. Learn. Grow.',
      site_description: language === 'zh' ? '专业的国际教育游学服务平台，为学生提供优质的海外学习体验' : 'Professional international education and study tour platform providing quality overseas learning experiences',
      site_keywords: language === 'zh' ? '国际教育,游学,留学,EdGoing,海外学习' : 'international education,study tour,study abroad,EdGoing,overseas learning',

      // 导航栏
      nav_home: language === 'zh' ? '首页' : 'Home',
      nav_programs: language === 'zh' ? '游学国际' : 'World Study Tour',
      nav_study_china: language === 'zh' ? '游学中国' : 'China Study Tour',
      nav_about: language === 'zh' ? '关于EdGoing' : 'About EdGoing',
      nav_blog: language === 'zh' ? '博客' : 'Blog',
      nav_contact: language === 'zh' ? '开始项目' : 'Start Project',

      // Banner轮播图
      banner_1_title: language === 'zh' ? '2025 Summer Study Tour' : '2025 Summer Study Tour',
      banner_1_subtitle: language === 'zh' ? 'Deep-dive programs in 20+ global universities' : 'Deep-dive programs in 20+ global universities',
      banner_1_cta: language === 'zh' ? 'Learn More' : 'Learn More',
      banner_2_title: language === 'zh' ? 'UK Elite University Tour' : 'UK Elite University Tour',
      banner_2_subtitle: language === 'zh' ? 'Explore Oxford, Cambridge and more' : 'Explore Oxford, Cambridge and more',
      banner_2_cta: language === 'zh' ? 'Discover Now' : 'Discover Now',
      banner_3_title: language === 'zh' ? 'Japan Tech Innovation Tour' : 'Japan Tech Innovation Tour',
      banner_3_subtitle: language === 'zh' ? 'Where cutting-edge meets tradition' : 'Where cutting-edge meets tradition',
      banner_3_cta: language === 'zh' ? 'Join the Innovation' : 'Join the Innovation',
      banner_4_title: language === 'zh' ? 'Global Leadership Summit' : 'Global Leadership Summit',
      banner_4_subtitle: language === 'zh' ? 'Empowering the next generation of world leaders' : 'Empowering the next generation of world leaders',
      banner_4_cta: language === 'zh' ? 'Be a Leader' : 'Be a Leader',
      banner_5_title: language === 'zh' ? 'Sustainable Future Program' : 'Sustainable Future Program',
      banner_5_subtitle: language === 'zh' ? 'Learn to shape a greener tomorrow' : 'Learn to shape a greener tomorrow',
      banner_5_cta: language === 'zh' ? 'Go Green' : 'Go Green',

      // 项目展示
      program_showcase_title: language === 'zh' ? '游学中国新视角：激发灵感、建立联系、实现财富的旅程。' : 'New Perspective on China Study Tours: A Journey to Inspire, Connect, and Achieve Wealth.',
      program_showcase_link_text: language === 'zh' ? '查看所有项目 →' : 'View All Programs →',

      // 首页英雄区域
      hero_title: language === 'zh' ? 'Explore. Learn. Grow.' : 'Explore. Learn. Grow.',
      hero_subtitle: language === 'zh' ? '每一个 EdGoing 项目都是精心打造的探险之旅，旨在超越简单的观光——挑战固有观念、培养共情能力，并赋予学员以全新的方式看待世界和自我' : 'Your Lifetime Learning Journey Awaits',
      hero_explore: language === 'zh' ? '探索' : 'Explore',
      hero_learn: language === 'zh' ? '学习' : 'Learn',
      hero_grow: language === 'zh' ? '成长' : 'Grow',
      hero_button_text: language === 'zh' ? '开始探索' : 'Start Exploring',

      // 关于我们
      about_title: language === 'zh' ? '关于EdGoing' : 'About EdGoing',
      about_subtitle: language === 'zh' ? '专业的国际教育服务' : 'Professional International Education Services',
      about_description: language === 'zh' ? '我们致力于为学生提供优质的国际教育体验，通过精心设计的游学项目，帮助学生开拓国际视野，提升综合能力。' : 'We are committed to providing students with quality international education experiences through carefully designed study tour programs to help students broaden their international perspectives and enhance their comprehensive abilities.',
      about_mission_title: language === 'zh' ? '我们的使命' : 'Our Mission',
      about_mission_description: language === 'zh' ? 'EdGoing致力于为全球学生提供变革性的教育体验，通过以下方式实现我们的使命：' : 'EdGoing is committed to providing transformative educational experiences for global students through the following approaches:',
      mission_point_1: language === 'zh' ? '通过创造超越课堂的变革性、真实世界的学习体验，重新定义教育。' : 'Redefine education by creating transformative, real-world learning experiences beyond the classroom.',
      mission_point_2: language === 'zh' ? '通过精心策划的教育旅行项目，架起文化桥梁，促进全球连接。' : 'Bridge cultures and foster global connections through curated educational travel programs.',
      mission_point_3: language === 'zh' ? '通过沉浸式、实践性的学习机会，激发好奇心和个人成长。' : 'Inspire curiosity and personal growth through immersive, hands-on learning opportunities.',
      mission_point_4: language === 'zh' ? '与全球顶级大学合作，提供人工智能、技术、人文学科等领域的高质量课程。' : 'Partner with top universities worldwide to offer high-quality programs in fields like AI, technology, and humanities.',
      mission_point_5: language === 'zh' ? '赋能来自中国及世界各地的学生，探索新领域并发展关键技能。' : 'Empower students from China and around the world to explore new fields and develop critical skills.',
      mission_point_6: language === 'zh' ? '通过培养富有思想、创新和全球视野的领导者，塑造未来。' : 'Shape the future by cultivating thoughtful, innovative, and globally-minded leaders.',
      mission_quote_title: language === 'zh' ? '我们的承诺' : 'Our Commitment',
      mission_quote: language === 'zh' ? '每一个EdGoing项目都是一次精心打造的成长之旅，我们致力于为学生创造改变人生的学习体验，让他们在探索世界的同时发现更好的自己。' : 'Every EdGoing program is a carefully crafted journey of growth. We are committed to creating life-changing learning experiences for students, helping them discover their better selves while exploring the world.',
      about_vision_title: language === 'zh' ? '我们的愿景' : 'Our Vision',
      about_vision_description: language === 'zh' ? '成为全球领先的国际教育服务提供商' : 'To become a leading global provider of international education services',

      // 为什么选择EdGoing
      why_choose_title: language === 'zh' ? '为什么选择' : 'Why Choose',
      why_choose_subtitle: language === 'zh' ? '以变革性、安全和个性化的旅程激发全球思维，获得全球信赖' : 'Inspiring global thinking through transformative, safe and personalized journeys, trusted worldwide',
      why_choose_expertise_title: language === 'zh' ? '专业知识与经验' : 'Professional Knowledge & Experience',
      why_choose_expertise_description: language === 'zh' ? 'EdGoing 植根于全球专业知识，致力于严谨的研究，精心打造最高品质、变革性的教育项目，激励学员在课堂之外学习。' : 'EdGoing is rooted in global expertise, committed to rigorous research, and carefully crafts the highest quality, transformative educational programs that inspire students to learn beyond the classroom.',
      why_choose_global_title: language === 'zh' ? '全球视野' : 'Global Vision',
      why_choose_global_description: language === 'zh' ? '通过战略性的全球合作伙伴关系，EdGoing 创造了真实的文化交流，使学员成为几乎所有识广、富有同理心且具有全球视野的未来领导者。' : 'Through strategic global partnerships, EdGoing creates authentic cultural exchanges, enabling students to become well-informed, empathetic future leaders with a global perspective.',
      why_choose_safety_title: language === 'zh' ? '安全与个性化承诺' : 'Safety & Personalization Commitment',
      why_choose_safety_description: language === 'zh' ? 'EdGoing 设计安全、高品质且个性化的旅程，帮助学员掌握终身技能并获得变革性的全球视野。' : 'EdGoing designs safe, high-quality and personalized journeys to help students master lifelong skills and gain transformative global perspectives.',

      // 学员支持与安全
      student_support_title: language === 'zh' ? '学员支持与安全' : 'Student Support and Safety',
      student_support_subtitle: language === 'zh' ? '我们优先考虑您的健康，在您的教育旅程中全天候提供全面的支持服务。' : 'We prioritize your health and safety first, providing comprehensive support services throughout your educational journey.',
      support_leadership_title: language === 'zh' ? '经验丰富的领导团队' : 'Experienced Leadership Team',
      support_leadership_description: language === 'zh' ? '5年以上领导经验，应急处理能力强、清晰的行动指南和1:15的师生比例，提供个性化支持。' : 'Our experienced team provides professional guidance and comprehensive support throughout your journey.',
      support_education_title: language === 'zh' ? '高质量教育项目' : 'High-Quality Education Programs',
      support_education_description: language === 'zh' ? '由专家主导的课程，与顶级合作伙伴合作，提供卓越的教育体验。' : 'Carefully designed programs with top partner institutions to provide excellent educational experiences.',
      support_accommodation_title: language === 'zh' ? '安全住宿和健康餐饮' : 'Safe Accommodation and Healthy Dining',
      support_accommodation_description: language === 'zh' ? '安全的住宿环境，严格的安全措施，以及适合各种饮食需求的营养均衡餐食。' : 'Safe living environments and nutritious meals to ensure your health and well-being.',
      support_247_title: language === 'zh' ? '全天候支持' : '24/7 Support',
      support_247_description: language === 'zh' ? '全天候服务，为学员提供持续支持。' : 'Round-the-clock support services to provide continuous assistance for students.',
      support_cultural_title: language === 'zh' ? '沉浸式文化体验' : 'Immersive Cultural Experience',
      support_cultural_description: language === 'zh' ? '互动活动，融入丰富的游览和当地参与，促进深度学习。' : 'Interactive activities and rich travel experiences to promote deep cultural learning.',
      support_academic_title: language === 'zh' ? '受认可的学术卓越' : 'Recognized Academic Excellence',
      support_academic_description: language === 'zh' ? '旨在提高学术表现和未来大学申请的课程' : 'Courses recognized by top universities, enhancing your academic credentials.',

      // 学员故事
      testimonials_title: language === 'zh' ? '学员故事' : 'Student Stories',
      testimonials_subtitle: language === 'zh' ? '聆听我们的学员分享他们在国外的转变体验。' : 'Listen to our students share their learning experiences and growth stories.',
      testimonial_1_content: language === 'zh' ? '我在新加坡的游学经历非常棒，不仅让我学到了很多科学知识，还让我体验了不同的文化。老师们都很专业，课程设计得很有趣，让我对科学产生了更大的兴趣。这次旅行真的改变了我对世界的看法。' : 'My study tour experience in Singapore was amazing. Not only did I learn a lot of scientific knowledge, but I also experienced different cultures. The teachers were very professional and the courses were designed to be very interesting, which made me more interested in science. This trip really changed my view of the world.',
      testimonial_1_author: language === 'zh' ? '张文慧' : 'Zhang Wenhui',
      testimonial_1_role: language === 'zh' ? '高中生' : 'High School Student',
      testimonial_1_program: language === 'zh' ? '新加坡科学营' : 'Singapore Science Camp',
      testimonial_2_content: language === 'zh' ? '参加EdGoing的项目让我的孩子变得更加自信和独立。她不仅提高了英语水平，还学会了如何与来自不同文化背景的同学相处。这是一次非常值得的投资。' : 'Participating in EdGoing\'s program made my child more confident and independent. She not only improved her English level, but also learned how to get along with classmates from different cultural backgrounds. This was a very worthwhile investment.',
      testimonial_2_author: language === 'zh' ? '李明' : 'Li Ming',
      testimonial_2_role: language === 'zh' ? '学生家长' : 'Parent',
      testimonial_2_program: language === 'zh' ? '国际文化交流项目' : 'International Cultural Exchange Program',
      testimonial_3_content: language === 'zh' ? '通过EdGoing的STEM项目，我对编程和机器人技术产生了浓厚的兴趣。导师们都很专业，教学方式很有趣，让我在玩中学到了很多知识。' : 'Through EdGoing\'s STEM program, I developed a strong interest in programming and robotics. The mentors were very professional and the teaching methods were very interesting, allowing me to learn a lot while playing.',
      testimonial_3_author: language === 'zh' ? '王小明' : 'Wang Xiaoming',
      testimonial_3_role: language === 'zh' ? '初中生' : 'Middle School Student',
      testimonial_3_program: language === 'zh' ? 'STEM创新营' : 'STEM Innovation Camp',

      // 邮件订阅
      newsletter_title: language === 'zh' ? '订阅我们的最新消息' : 'Subscribe to Our Latest News',
      newsletter_subtitle: language === 'zh' ? '订阅我们的电子邮件，及时了解最新的项目、旅行机会和教育资讯。' : 'Subscribe to our learning newsletter to get learning resources and content, and receive special offers.',
      newsletter_placeholder: language === 'zh' ? '输入您的邮箱地址' : 'Enter your email address',
      newsletter_button: language === 'zh' ? '订阅' : 'Subscribe',

      // 行动号召
      cta_title: language === 'zh' ? '准备开始您的旅程？' : 'Ready to Start Your Journey?',
      cta_subtitle: language === 'zh' ? '迈出国际教育冒险的第一步。我们的团队将帮助您找到完美的项目。' : 'Take the first step in your international education adventure. Our team is ready to help you plan the perfect program.',
      cta_button_text: language === 'zh' ? '开始咨询' : 'Start Consultation',

      // 页脚
      footer_navigation: language === 'zh' ? 'NAVIGATION' : 'NAVIGATION',
      footer_contact_us: language === 'zh' ? 'CONTACT US' : 'CONTACT US',
      footer_follow_us: language === 'zh' ? 'FOLLOW US' : 'FOLLOW US',
      footer_call_us: language === 'zh' ? 'Call Us' : 'Call Us',
      footer_email: language === 'zh' ? 'Email' : 'Email',
      footer_address: language === 'zh' ? 'Address' : 'Address',
      footer_locations: language === 'zh' ? 'Shanghai | Singapore' : 'Shanghai | Singapore',
      footer_shanghai: language === 'zh' ? 'Shanghai' : 'Shanghai',
      footer_shanghai_address: language === 'zh' ? '18F, Tower B, 838 South Huangpi Road' : '18F, Tower B, 838 South Huangpi Road',
      footer_shanghai_district: language === 'zh' ? 'Huangpu District, Shanghai, 200025' : 'Huangpu District, Shanghai, 200025',
      footer_singapore: language === 'zh' ? 'Singapore' : 'Singapore',
      footer_singapore_address: language === 'zh' ? '9 Kelantan Lane #06-01' : '9 Kelantan Lane #06-01',
      footer_singapore_postal: language === 'zh' ? 'Singapore 208628' : 'Singapore 208628',
      footer_follow_description: language === 'zh' ? 'Follow us on social media for updates and educational insights' : 'Follow us on social media for updates and educational insights',
      footer_copyright: language === 'zh' ? '2025 EdGoing. All rights reserved.' : '2025 EdGoing. All rights reserved.',

      // 页脚导航链接
      footer_nav_home: language === 'zh' ? 'Home' : 'Home',
      footer_nav_world_study: language === 'zh' ? 'World Study Tour' : 'World Study Tour',
      footer_nav_china_study: language === 'zh' ? 'China Study Tour' : 'China Study Tour',
      footer_nav_blog: language === 'zh' ? 'Blog' : 'Blog',
      footer_nav_about: language === 'zh' ? 'About EdGoing' : 'About EdGoing',
      footer_nav_faq: language === 'zh' ? 'FAQ' : 'FAQ',
      footer_nav_contact: language === 'zh' ? "Let's Plan" : "Let's Plan",

      // 联系页面
      contact_title: language === 'zh' ? '联系我们' : 'Contact Us',
      contact_subtitle: language === 'zh' ? '有任何问题或需要咨询，请随时联系我们' : 'If you have any questions or need consultation, please feel free to contact us',
      contact_form_name: language === 'zh' ? '姓名' : 'Name',
      contact_form_email: language === 'zh' ? '邮箱' : 'Email',
      contact_form_message: language === 'zh' ? '留言' : 'Message',
      contact_form_submit: language === 'zh' ? '发送消息' : 'Send Message',

      // 项目页面
      programs_title: language === 'zh' ? '探索我们的项目' : 'Explore Our Programs',
      programs_subtitle: language === 'zh' ? '通过我们多样化的教育项目探索学习机会的世界' : 'Explore the world of learning opportunities through our diverse educational programs',
      programs_search_placeholder: language === 'zh' ? '搜索项目...' : 'Search programs...',
      programs_filter_country: language === 'zh' ? '选择国家' : 'Select Country',
      programs_filter_type: language === 'zh' ? '选择类型' : 'Select Type',
      programs_no_results: language === 'zh' ? '没有找到匹配的项目' : 'No matching programs found',
    }

    // Create missing settings
    for (const key of missingKeys) {
      // 🛡️ 生成安全的设置ID
      const settingId = `setting_${key}_${language}_${Date.now()}`

      await prisma.settings.create({
        data: {
          id: settingId, // 🛡️ 手动提供ID，因为模型要求String类型的ID
          key,
          value: defaultValues[key] || '',
          type: 'TEXT',
          language,
          updatedAt: new Date(), // 🛡️ 手动提供updatedAt字段
        },
      })
    }

    // Fetch all settings again
    const allSettings = await prisma.settings.findMany({
      where: {
        key: { in: contentKeys },
        language,
      },
      include: {
        setting_translations: true,
      },
    })

    return NextResponse.json({ settings: allSettings })
  } catch (error) {
    console.error('Get content error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Update multiple content settings
export async function PUT(request: NextRequest) {
  try {
    const authResult = await requireEditor(request)
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const data = await request.json()
    const { settings, language = 'zh' } = data

    // Update each setting
    const updatePromises = Object.entries(settings).map(([key, value]) =>
      prisma.settings.upsert({
        where: {
          key_language: {
            key,
            language
          }
        },
        update: { value: value as string },
        create: {
          id: `setting_${key}_${language}_${Date.now()}`, // 🛡️ 手动提供ID，因为模型要求String类型的ID
          key,
          value: value as string,
          type: 'TEXT',
          language,
          updatedAt: new Date(), // 🛡️ 手动提供updatedAt字段
        },
      })
    )

    await Promise.all(updatePromises)

    return NextResponse.json({ message: 'Content updated successfully' })
  } catch (error) {
    console.error('Update content error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
