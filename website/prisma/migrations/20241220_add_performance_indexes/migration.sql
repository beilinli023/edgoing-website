-- 🚀 性能优化索引 - 安全添加关键索引以提升查询性能
-- 创建时间: 2024-12-20
-- 目的: 基于查询模式分析，添加最需要的索引

-- ==========================================
-- 1. 博客相关索引 (高频查询)
-- ==========================================

-- 博客状态和语言查询 (blogs API 主要查询)
CREATE INDEX IF NOT EXISTS "idx_blogs_status_language" ON "blogs" ("status", "language");

-- 博客排序优化 (order, publishedAt, createdAt) - 注意order是保留字需要引号
CREATE INDEX IF NOT EXISTS "idx_blogs_order_published" ON "blogs" ("order" ASC, "publishedAt" DESC);
CREATE INDEX IF NOT EXISTS "idx_blogs_order_created" ON "blogs" ("order" ASC, "createdAt" DESC);

-- 博客slug查询优化 (已有unique索引，但添加复合索引)
CREATE INDEX IF NOT EXISTS "idx_blogs_slug_status" ON "blogs" ("slug", "status");

-- 博客翻译查询优化
CREATE INDEX IF NOT EXISTS "idx_blog_translations_blogid_language" ON "blog_translations" ("blogId", "language");

-- 博客轮播图排序优化
CREATE INDEX IF NOT EXISTS "idx_blog_carousels_blogid_order" ON "blog_carousels" ("blogId", "order");

-- ==========================================
-- 2. 国际项目相关索引 (高频查询)
-- ==========================================

-- 国际项目状态和语言查询
CREATE INDEX IF NOT EXISTS "idx_international_programs_status_language" ON "international_programs" ("status", "language");

-- 国际项目slug查询优化
CREATE INDEX IF NOT EXISTS "idx_international_programs_slug_status" ON "international_programs" ("slug", "status");

-- 国际项目排序优化
CREATE INDEX IF NOT EXISTS "idx_international_programs_created" ON "international_programs" ("createdAt" DESC);

-- 国际项目翻译查询优化
CREATE INDEX IF NOT EXISTS "idx_international_program_translations_programid_language" ON "international_program_translations" ("programId", "language");

-- 国际项目城市关联优化
CREATE INDEX IF NOT EXISTS "idx_international_programs_cityid" ON "international_programs" ("cityId");

-- ==========================================
-- 3. 中国项目相关索引 (高频查询)
-- ==========================================

-- 中国项目状态和语言查询
CREATE INDEX IF NOT EXISTS "idx_china_programs_status_language" ON "china_programs" ("status", "language");

-- 中国项目slug查询优化
CREATE INDEX IF NOT EXISTS "idx_china_programs_slug_status" ON "china_programs" ("slug", "status");

-- 中国项目排序优化
CREATE INDEX IF NOT EXISTS "idx_china_programs_created" ON "china_programs" ("createdAt" DESC);

-- 中国项目翻译查询优化
CREATE INDEX IF NOT EXISTS "idx_china_program_translations_programid_language" ON "china_program_translations" ("programId", "language");

-- 中国项目城市关联优化
CREATE INDEX IF NOT EXISTS "idx_china_programs_cityid" ON "china_programs" ("cityId");

-- ==========================================
-- 4. 用户和认证相关索引
-- ==========================================

-- 用户邮箱查询 (已有unique索引)
-- 用户名查询 (已有unique索引)

-- 会话token查询 (已有unique索引)
-- 会话过期时间查询优化
CREATE INDEX IF NOT EXISTS "idx_sessions_expires_at" ON "sessions" ("expiresAt");

-- 会话用户ID查询优化
CREATE INDEX IF NOT EXISTS "idx_sessions_userid" ON "sessions" ("userId");

-- ==========================================
-- 5. 申请相关索引
-- ==========================================

-- 国际项目申请查询优化
CREATE INDEX IF NOT EXISTS "idx_international_applications_programid" ON "international_applications" ("programId");
CREATE INDEX IF NOT EXISTS "idx_international_applications_status" ON "international_applications" ("status");
CREATE INDEX IF NOT EXISTS "idx_international_applications_submitted" ON "international_applications" ("submittedAt" DESC);

-- 中国项目申请查询优化
CREATE INDEX IF NOT EXISTS "idx_china_applications_programid" ON "china_applications" ("programId");
CREATE INDEX IF NOT EXISTS "idx_china_applications_status" ON "china_applications" ("status");
CREATE INDEX IF NOT EXISTS "idx_china_applications_submitted" ON "china_applications" ("submittedAt" DESC);

-- 通用申请查询优化
CREATE INDEX IF NOT EXISTS "idx_applications_programid" ON "applications" ("programId");
CREATE INDEX IF NOT EXISTS "idx_applications_status" ON "applications" ("status");
CREATE INDEX IF NOT EXISTS "idx_applications_submitted" ON "applications" ("submittedAt" DESC);

-- ==========================================
-- 6. 媒体相关索引
-- ==========================================

-- 媒体上传者查询优化
CREATE INDEX IF NOT EXISTS "idx_media_uploaded_by" ON "media" ("uploadedBy");

-- 媒体排序优化
CREATE INDEX IF NOT EXISTS "idx_media_order_created" ON "media" ("order" ASC, "createdAt" DESC);

-- ==========================================
-- 7. 学员故事相关索引
-- ==========================================

-- 学员故事状态和语言查询
CREATE INDEX IF NOT EXISTS "idx_testimonials_status_language" ON "testimonials" ("status", "language");

-- 学员故事排序优化
CREATE INDEX IF NOT EXISTS "idx_testimonials_order_created" ON "testimonials" ("order" ASC, "createdAt" DESC);

-- 学员故事翻译查询优化
CREATE INDEX IF NOT EXISTS "idx_testimonial_translations_testimonialid_language" ON "testimonial_translations" ("testimonialId", "language");

-- ==========================================
-- 8. 视频相关索引
-- ==========================================

-- 视频发布状态查询
CREATE INDEX IF NOT EXISTS "idx_videos_published" ON "videos" ("isPublished");

-- 视频排序优化
CREATE INDEX IF NOT EXISTS "idx_videos_order_created" ON "videos" ("order" ASC, "createdAt" DESC);

-- 视频slug查询 (已有unique索引)

-- ==========================================
-- 9. 地理位置相关索引
-- ==========================================

-- 城市国家关联查询优化
CREATE INDEX IF NOT EXISTS "idx_cities_countryid_active" ON "cities" ("countryId", "isActive");

-- 城市排序优化
CREATE INDEX IF NOT EXISTS "idx_cities_order" ON "cities" ("order" ASC);

-- 国家排序优化
CREATE INDEX IF NOT EXISTS "idx_countries_order_active" ON "countries" ("order" ASC, "isActive");

-- 中国省份排序优化
CREATE INDEX IF NOT EXISTS "idx_china_provinces_order" ON "china_provinces" ("order" ASC);

-- 中国城市省份关联优化
CREATE INDEX IF NOT EXISTS "idx_china_cities_provinceid_order" ON "china_cities" ("provinceId", "order");

-- ==========================================
-- 10. 其他常用索引
-- ==========================================

-- FAQ相关索引
CREATE INDEX IF NOT EXISTS "idx_faqs_active_order" ON "faqs" ("isActive", "order");
CREATE INDEX IF NOT EXISTS "idx_faq_translations_faqid_language" ON "faq_translations" ("faqId", "language");

-- 合作伙伴logo索引
CREATE INDEX IF NOT EXISTS "idx_partner_logos_active_order" ON "partner_logos" ("isActive", "order");

-- 首页展示索引
CREATE INDEX IF NOT EXISTS "idx_homepage_showcases_active_order" ON "homepage_showcases" ("isActive", "order");

-- 英雄页面索引
CREATE INDEX IF NOT EXISTS "idx_hero_pages_active_order" ON "hero_pages" ("isActive", "order");

-- 联系表单提交索引
CREATE INDEX IF NOT EXISTS "idx_contact_submissions_status_submitted" ON "contact_submissions" ("status", "submittedAt" DESC);

-- 新闻订阅索引
CREATE INDEX IF NOT EXISTS "idx_newsletters_active_subscribed" ON "newsletters" ("isActive", "subscribedAt" DESC);

-- 设置查询优化
CREATE INDEX IF NOT EXISTS "idx_settings_key_language" ON "settings" ("key", "language");
CREATE INDEX IF NOT EXISTS "idx_setting_translations_settingid_language" ON "setting_translations" ("settingId", "language");

-- ==========================================
-- 索引创建完成
-- ==========================================

-- 注意事项:
-- 1. 所有索引都使用 IF NOT EXISTS 确保安全性
-- 2. 索引基于实际查询模式设计
-- 3. 复合索引的字段顺序经过优化
-- 4. 避免了过度索引，只添加真正需要的索引
-- 5. 考虑了排序和过滤的常见组合
