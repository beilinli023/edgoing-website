import { fileURLToPath } from 'url'
import { dirname } from 'path'

// 🛡️ ES模块中获取 __filename 和 __dirname 的安全方法
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/** @type {import('next').NextConfig} */
const nextConfig = {
  // 🚀 部署支持 - 根据环境选择输出模式
  output: process.env.VERCEL ? undefined : 'standalone',

  // 🚀 开发环境性能优化 - 关闭字体优化加快启动
  ...(process.env.NODE_ENV === 'development' && {
    // swcMinify: false, // 已移除 - SWC minifier 将成为强制选项
    optimizeFonts: false, // 开发环境关闭字体优化
    // 开发环境快速启动
    productionBrowserSourceMaps: false,
    poweredByHeader: false,
  }),

  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
  },

  // 🚀 安全的编译性能优化 (Turbo模式不支持compiler配置)
  ...(process.env.NEXT_TURBO !== 'true' && process.env.NODE_ENV === 'production' && {
    compiler: {
      // 移除console.log (仅生产环境且非Turbo模式)
      removeConsole: {
        exclude: ['error', 'warn']
      },
    },
  }),

  // 🚀 实验性功能 - 安全启用
  experimental: {
    // 🛡️ 禁用CSS优化，避免critters依赖问题（已确认缺少依赖）
    // optimizeCss: false, // 明确禁用，避免构建错误
    // 优化包大小 - 启用部分优化
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons', '@radix-ui/react-toast', '@radix-ui/react-select'],
    // 🚀 开发环境快速刷新优化
    // esmExternals: 'loose', // Turbo模式不支持
    // 🚀 启用turbo模式相关优化
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },

  // 🚀 Webpack优化 - 更激进的开发环境优化
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      // 🚀 开发环境性能优化
      config.watchOptions = {
        poll: false, // 关闭轮询，使用原生文件监听
        aggregateTimeout: 200, // 减少等待时间
        ignored: ['**/node_modules', '**/.git', '**/.next', '**/dist'],
      }

      // 🚀 减少模块解析时间
      config.resolve.symlinks = false
      
      // 🚀 优化模块解析缓存
      config.resolve.cacheWithContext = false

      // 🚀 简化代码分割配置
      if (!isServer) {
        config.optimization.splitChunks = {
          chunks: 'async',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
            },
          },
        }
      }

      // 🚀 安全的缓存配置
      if (config.cache && typeof config.cache === 'object') {
        config.cache = {
          type: 'filesystem',
          allowCollectingMemory: true,
          buildDependencies: {
            config: [__filename],
          },
        }
      }

      // 🚀 跳过不必要的插件在开发环境
      config.plugins = config.plugins.filter(plugin => {
        // 过滤掉一些不必要的开发环境插件
        return !plugin.constructor.name.includes('ForkTsChecker')
      })
    }

    return config
  },
  
  // ✅ 安全的环境变量处理 - 只在开发环境允许认证绕过
  env: {
    NEXT_PUBLIC_DISABLE_AUTH: process.env.NODE_ENV === 'development' ? process.env.DISABLE_AUTH : 'false',
  },
  
  // ✅ 添加安全头 - 防止常见的Web攻击
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ]
  },
}

export default nextConfig
