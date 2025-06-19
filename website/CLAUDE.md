# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Essential Commands
```bash
# Development server
npm run dev                    # Standard development mode
npm run dev:turbo             # Turbo mode (faster builds)
npm run dev:performance       # With performance monitoring enabled

# Database operations
npx prisma studio             # Database GUI for viewing/editing data
npx prisma migrate dev        # Run database migrations
npx prisma generate           # Generate Prisma client after schema changes

# Performance & maintenance
npm run build:analyze        # Analyze bundle size

# Production
npm run build                # Production build
npm run start                # Start production server
```

### Database Management
```bash
# Database operations
npx prisma studio                          # Open database browser
npx prisma db push                         # Push schema changes
npx prisma generate                        # Generate Prisma client
```

## Architecture Overview

### Technology Stack
- **Framework**: Next.js 14 (App Router) with TypeScript
- **Database**: SQLite (dev) with Prisma ORM
- **UI**: React 19 + Tailwind CSS + shadcn/ui components
- **Auth**: Custom JWT-based authentication (not NextAuth)
- **i18n**: react-i18next with Chinese/English support

### Key Architectural Patterns

#### Database Structure
- **Multilingual Content**: Separate `*_translations` tables for Chinese/English content
- **Geographic Data**: Hierarchical structure (countries → cities, china_provinces → china_cities)
- **Media Management**: Centralized `media` table with file validation
- **Content Types**: blogs, programs, china_programs, international_programs, testimonials

#### API Design
- **Public APIs**: `/api/blogs`, `/api/programs`, `/api/testimonials` (no auth)
- **Admin APIs**: `/api/admin/*` (requires JWT authentication)
- **Dynamic Routes**: `/api/blogs/[slug]`, `/api/programs/[slug]`
- **Language Support**: APIs accept `language` parameter (zh/en)

#### Component Organization
```
components/
├── ui/              # Base shadcn/ui components
├── (features)/      # Feature-specific components (Hero, ContactForm, etc.)
├── (pages)/         # Page-specific components
└── admin/           # Admin-only components
```

### Authentication System
- **Custom JWT**: Not using NextAuth - custom implementation in `lib/auth.ts`
- **Session Management**: Manual session handling with database
- **Admin Protection**: All `/admin` routes require authentication
- **Role System**: USER, ADMIN, EDITOR roles (though currently only ADMIN used)

### Internationalization
- **Languages**: Chinese (zh) and English (en)
- **Implementation**: Translations stored in `lib/i18n.ts` (not external files)
- **URL Support**: `?lang=en` parameter for language switching
- **Persistence**: Language preference stored in localStorage

## Development Workflows

### Adding New Content Types
1. Update `prisma/schema.prisma` with new model + translations table
2. Run `npx prisma migrate dev` to create migration
3. Create API routes in `app/api/` and `app/api/admin/`
4. Add admin management page in `app/admin/`
5. Create public display components

### Database Changes
1. Edit `prisma/schema.prisma`
2. Run `npx prisma migrate dev --name descriptive_name`
3. Update TypeScript types if needed
4. Test with `npx prisma studio`

### Adding New Pages
- **Public Pages**: Add to `app/` directory (follows Next.js App Router)
- **Admin Pages**: Add to `app/admin/` directory
- **Dynamic Routes**: Use `[slug]` or `[id]` for dynamic segments

### Performance Considerations
- **Query Optimization**: Use `lib/optimization/query-optimizer.ts` for complex queries
- **Monitoring**: Performance monitoring built-in (check `lib/monitoring/`)
- **Caching**: API responses cached automatically with smart invalidation
- **Media**: Files stored in `public/uploads/` with size validation

## Important Implementation Details

### File Upload System
- **Location**: `public/uploads/` directory
- **Validation**: File type, size, and path security checks
- **API**: `/api/admin/media/upload` endpoint
- **Security**: Path traversal protection, filename sanitization

### Language Switching
- **Client-side**: `LanguageSwitcher` component handles UI switching
- **Server-side**: APIs read `language` parameter from request
- **Persistence**: Language stored in localStorage and URL params
- **Fallback**: Defaults to English if translation missing

### Error Handling
- **APIs**: Standardized error responses with proper HTTP codes
- **Frontend**: Error boundaries and safe error handling
- **Security**: No sensitive information in error messages
- **Logging**: Errors logged for debugging (check console in dev mode)

### Key Libraries & Utilities
- **Form Handling**: react-hook-form for all forms
- **UI Components**: shadcn/ui pattern with variant-based props
- **Database**: Prisma with custom monitoring and optimization
- **Security**: Custom middleware for file handling and security headers
- **Performance**: Built-in query performance tracking

## Troubleshooting

### Common Issues
- **Build Errors**: Usually TypeScript issues - check `tsconfig.json`
- **Database Issues**: Run `npx prisma studio` to inspect data
- **Performance Issues**: Check database queries and optimize as needed

### Development Tips
- **Database GUI**: Use Prisma Studio for easy data inspection
- **API Testing**: Use the provided test scripts in `scripts/` directory
- **Performance**: Monitor enabled by default in development
- **Hot Reload**: Next.js Fast Refresh works for most changes

### File Structure Notes
- **Documentation**: Comprehensive docs in `docs/` directory
- **Scripts**: Utility scripts in `scripts/` directory for maintenance
- **Types**: TypeScript definitions in `types/` directory
- **Localization**: Translation content in `lib/i18n.ts`

## Email Notification System

### Overview
The system provides automated email notifications for form submissions and newsletter subscriptions using configurable SMTP settings.

### Features
- **Contact Form Notifications**: Sent when users submit contact forms
- **Newsletter Subscription Notifications**: Sent when users subscribe to newsletters
- **SMTP Configuration**: Supports any SMTP provider (QQ, Gmail, etc.)
- **Multiple Recipients**: Configure multiple notification email addresses
- **Professional Templates**: HTML email templates with proper styling
- **Test Email Function**: Verify SMTP configuration before going live

### Configuration
1. Access `/admin/email-notifications` in the admin panel
2. Configure SMTP settings (host, port, username, password, security)
3. Set sender information (email, name)
4. Add notification recipient email addresses
5. Enable/disable specific notification types
6. Test configuration with test email function

### Technical Implementation
- **Core Logic**: `lib/email.ts` - Email sending functions
- **Admin API**: `app/api/admin/email-notifications/route.ts` - Configuration management
- **Admin UI**: `app/admin/email-notifications/page.tsx` - Configuration interface
- **Database**: `email_notifications` table stores all configuration
- **Integration**: Automatic calls in contact form and newsletter APIs

### Supported SMTP Providers
- QQ Mail: smtp.qq.com (ports 587/465)
- Gmail: smtp.gmail.com (port 587)
- 163 Mail: smtp.163.com (ports 25/465)
- Any standard SMTP service

### Security
- Passwords stored securely in database
- SSL/TLS encryption support
- Error messages don't expose sensitive configuration
- Proper authentication required for admin access