import nodemailer from 'nodemailer'
import { prisma } from '@/lib/prisma'

interface EmailConfig {
  smtpHost: string
  smtpPort: number
  smtpUser: string
  smtpPassword: string
  smtpSecure: boolean
  fromEmail: string
  fromName: string
  notificationEmails: string
  contactSubmissionEnabled: boolean
  newsletterEnabled: boolean
  isActive: boolean
}

export async function getEmailConfig(): Promise<EmailConfig | null> {
  try {
    const config = await prisma.email_notifications.findFirst()
    if (!config || !config.isActive) {
      return null
    }
    return config as EmailConfig
  } catch (error) {
    console.error('Error fetching email config:', error)
    return null
  }
}

export async function createTransporter(config: EmailConfig) {
  return nodemailer.createTransport({
    host: config.smtpHost,
    port: config.smtpPort,
    secure: config.smtpSecure,
    auth: {
      user: config.smtpUser,
      pass: config.smtpPassword,
    },
  })
}

export async function sendTestEmail(config: EmailConfig): Promise<boolean> {
  try {
    const transporter = await createTransporter(config)
    
    let notificationEmails: string[] = []
    try {
      notificationEmails = JSON.parse(config.notificationEmails || '[]')
    } catch {
      notificationEmails = []
    }

    if (notificationEmails.length === 0) {
      throw new Error('No notification emails configured')
    }

    const mailOptions = {
      from: `${config.fromName} <${config.fromEmail}>`,
      to: notificationEmails.join(', '),
      subject: 'EdGoing 邮件通知测试',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-bottom: 20px; border-bottom: 2px solid #6f42c1; padding-bottom: 10px;">
              🧪 EdGoing 邮件通知测试
            </h2>
            <p style="color: #666; margin-bottom: 25px;">这是一封测试邮件，用于验证 EdGoing 邮件通知系统是否正常工作。</p>

            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="color: #333; margin-bottom: 15px;">📊 测试信息</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 8px 0; color: #666;"><strong>发送时间：</strong></td><td style="padding: 8px 0;">${new Date().toLocaleString('zh-CN')}</td></tr>
                <tr><td style="padding: 8px 0; color: #666;"><strong>系统状态：</strong></td><td style="padding: 8px 0; color: #28a745;"><strong>✅ 正常运行</strong></td></tr>
                <tr><td style="padding: 8px 0; color: #666;"><strong>SMTP服务器：</strong></td><td style="padding: 8px 0;">${config.smtpHost}:${config.smtpPort}</td></tr>
                <tr><td style="padding: 8px 0; color: #666;"><strong>发件人：</strong></td><td style="padding: 8px 0;">${config.fromName} &lt;${config.fromEmail}&gt;</td></tr>
              </table>
            </div>

            <div style="background-color: #e8f5e8; padding: 15px; border-radius: 8px; margin-bottom: 25px; text-align: center;">
              <p style="margin: 0; color: #28a745; font-size: 16px;"><strong>🎉 邮件通知系统配置正确！</strong></p>
            </div>

            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
              此邮件由 EdGoing 管理系统自动发送，请勿回复。
            </p>
          </div>
        </div>
      `,
    }

    await transporter.sendMail(mailOptions)
    return true
  } catch (error) {
    console.error('Error sending test email:', error)
    return false
  }
}

export async function sendContactSubmissionNotification(submission: any): Promise<boolean> {
  try {
    const config = await getEmailConfig()
    if (!config || !config.contactSubmissionEnabled) {
      console.log('Contact submission notification disabled or no email config found')
      return false
    }

    const transporter = await createTransporter(config)

    let notificationEmails: string[] = []
    try {
      notificationEmails = JSON.parse(config.notificationEmails || '[]')
    } catch (error) {
      console.error('Error parsing notification emails:', error)
      notificationEmails = []
    }

    if (notificationEmails.length === 0) {
      console.log('No notification emails configured')
      return false
    }

    // Parse JSON fields for better display
    let destinations = '未填写'
    let learningInterests = '未填写'

    try {
      if (submission.destinations) {
        const destArray = JSON.parse(submission.destinations)
        destinations = Array.isArray(destArray) ? destArray.join(', ') : submission.destinations
      }
    } catch {
      destinations = submission.destinations || '未填写'
    }

    try {
      if (submission.learningInterests) {
        const interestsArray = JSON.parse(submission.learningInterests)
        learningInterests = Array.isArray(interestsArray) ? interestsArray.join(', ') : submission.learningInterests
      }
    } catch {
      learningInterests = submission.learningInterests || '未填写'
    }

    const mailOptions = {
      from: `${config.fromName} <${config.fromEmail}>`,
      to: notificationEmails.join(', '),
      subject: '新的联系表单提交 - EdGoing',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-bottom: 20px; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
              📝 新的联系表单提交
            </h2>
            <p style="color: #666; margin-bottom: 25px;">有新的用户提交了联系表单，请及时处理。</p>

            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="color: #333; margin-bottom: 15px;">👤 联系人信息</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 5px 0; color: #666;"><strong>姓名：</strong></td><td style="padding: 5px 0;">${submission.firstName} ${submission.lastName}</td></tr>
                <tr><td style="padding: 5px 0; color: #666;"><strong>角色：</strong></td><td style="padding: 5px 0;">${submission.role}</td></tr>
                <tr><td style="padding: 5px 0; color: #666;"><strong>邮箱：</strong></td><td style="padding: 5px 0;"><a href="mailto:${submission.email}" style="color: #007bff;">${submission.email}</a></td></tr>
                <tr><td style="padding: 5px 0; color: #666;"><strong>电话：</strong></td><td style="padding: 5px 0;">${submission.phone}</td></tr>
                <tr><td style="padding: 5px 0; color: #666;"><strong>学校：</strong></td><td style="padding: 5px 0;">${submission.schoolName || '未填写'}</td></tr>
                <tr><td style="padding: 5px 0; color: #666;"><strong>年级：</strong></td><td style="padding: 5px 0;">${submission.grade || '未填写'}</td></tr>
                <tr><td style="padding: 5px 0; color: #666;"><strong>省份：</strong></td><td style="padding: 5px 0;">${submission.province || '未填写'}</td></tr>
                <tr><td style="padding: 5px 0; color: #666;"><strong>城市：</strong></td><td style="padding: 5px 0;">${submission.city || '未填写'}</td></tr>
              </table>
            </div>

            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="color: #333; margin-bottom: 15px;">🎯 申请信息</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 5px 0; color: #666;"><strong>目的地：</strong></td><td style="padding: 5px 0;">${destinations}</td></tr>
                <tr><td style="padding: 5px 0; color: #666;"><strong>学习兴趣：</strong></td><td style="padding: 5px 0;">${learningInterests}</td></tr>
                <tr><td style="padding: 5px 0; color: #666;"><strong>留言：</strong></td><td style="padding: 5px 0;">${submission.message || '无'}</td></tr>
              </table>
            </div>

            <div style="background-color: #e3f2fd; padding: 15px; border-radius: 8px; margin-bottom: 25px;">
              <p style="margin: 0; color: #1976d2;"><strong>⏰ 提交时间：</strong> ${new Date(submission.submittedAt).toLocaleString('zh-CN')}</p>
            </div>

            <div style="text-align: center; margin-bottom: 20px;">
              <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3002'}/admin/contact-submissions"
                 style="background-color: #007bff; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                🔍 查看详情
              </a>
            </div>

            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
              此邮件由 EdGoing 管理系统自动发送，请勿回复。
            </p>
          </div>
        </div>
      `,
    }

    await transporter.sendMail(mailOptions)
    console.log(`Contact submission notification sent successfully to: ${notificationEmails.join(', ')}`)
    return true
  } catch (error) {
    console.error('Error sending contact submission notification:', error)
    return false
  }
}

export async function sendNewsletterSubscriptionNotification(subscription: any): Promise<boolean> {
  try {
    const config = await getEmailConfig()
    if (!config || !config.newsletterEnabled) {
      console.log('Newsletter subscription notification disabled or no email config found')
      return false
    }

    const transporter = await createTransporter(config)

    let notificationEmails: string[] = []
    try {
      notificationEmails = JSON.parse(config.notificationEmails || '[]')
    } catch (error) {
      console.error('Error parsing notification emails:', error)
      notificationEmails = []
    }

    if (notificationEmails.length === 0) {
      console.log('No notification emails configured')
      return false
    }

    const mailOptions = {
      from: `${config.fromName} <${config.fromEmail}>`,
      to: notificationEmails.join(', '),
      subject: '新的邮件订阅 - EdGoing',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-bottom: 20px; border-bottom: 2px solid #28a745; padding-bottom: 10px;">
              📧 新的邮件订阅
            </h2>
            <p style="color: #666; margin-bottom: 25px;">有新用户订阅了 EdGoing 邮件通知。</p>

            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="color: #333; margin-bottom: 15px;">📋 订阅信息</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 8px 0; color: #666;"><strong>邮箱：</strong></td><td style="padding: 8px 0;"><a href="mailto:${subscription.email}" style="color: #007bff;">${subscription.email}</a></td></tr>
                <tr><td style="padding: 8px 0; color: #666;"><strong>姓名：</strong></td><td style="padding: 8px 0;">${subscription.name || '未填写'}</td></tr>
                <tr><td style="padding: 8px 0; color: #666;"><strong>语言：</strong></td><td style="padding: 8px 0;">${subscription.language === 'zh' ? '中文' : '英文'}</td></tr>
              </table>
            </div>

            <div style="background-color: #e8f5e8; padding: 15px; border-radius: 8px; margin-bottom: 25px;">
              <p style="margin: 0; color: #28a745;"><strong>⏰ 订阅时间：</strong> ${new Date(subscription.subscribedAt).toLocaleString('zh-CN')}</p>
            </div>

            <div style="text-align: center; margin-bottom: 20px;">
              <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3002'}/admin/newsletters"
                 style="background-color: #28a745; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                📊 查看详情
              </a>
            </div>

            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
              此邮件由 EdGoing 管理系统自动发送，请勿回复。
            </p>
          </div>
        </div>
      `,
    }

    await transporter.sendMail(mailOptions)
    console.log(`Newsletter subscription notification sent successfully to: ${notificationEmails.join(', ')}`)
    return true
  } catch (error) {
    console.error('Error sending newsletter subscription notification:', error)
    return false
  }
}
