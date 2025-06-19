/**
 * 🎨 项目卡片骨架屏组件
 * 
 * 在项目列表加载时显示的占位符组件，提供流畅的加载体验
 */

import React from 'react'

interface ProgramCardSkeletonProps {
  count?: number
}

const ProgramCardSkeleton: React.FC<ProgramCardSkeletonProps> = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="bg-white rounded-xl overflow-hidden shadow-lg border border-gray-100 animate-pulse"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          {/* 图片骨架 */}
          <div className="relative h-48 bg-gray-200">
            <div className="absolute top-3 left-3 flex gap-1">
              <div className="w-16 h-6 bg-gray-300 rounded-full"></div>
              <div className="w-12 h-6 bg-gray-300 rounded-full"></div>
            </div>
            <div className="absolute top-3 right-3 w-8 h-8 bg-gray-300 rounded-full"></div>
          </div>

          {/* 内容骨架 */}
          <div className="p-6">
            {/* 渐变装饰条 */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gray-200"></div>

            {/* 标题骨架 */}
            <div className="mb-4">
              <div className="h-5 bg-gray-300 rounded mb-2"></div>
              <div className="h-5 bg-gray-300 rounded w-3/4"></div>
            </div>

            {/* 信息骨架 */}
            <div className="space-y-3 mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                <div className="h-4 bg-gray-300 rounded w-20"></div>
                <div className="h-4 bg-gray-300 rounded w-24"></div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                <div className="h-4 bg-gray-300 rounded w-16"></div>
                <div className="h-4 bg-gray-300 rounded w-20"></div>
              </div>
            </div>

            {/* 截止日期骨架 */}
            <div className="mt-auto mb-4">
              <div className="bg-gray-100 border border-gray-200 rounded-lg p-3 flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-3 bg-gray-300 rounded mb-1 w-16"></div>
                  <div className="h-4 bg-gray-300 rounded w-24"></div>
                </div>
              </div>
            </div>

            {/* 按钮骨架 */}
            <div className="h-8 bg-gray-300 rounded-lg"></div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default ProgramCardSkeleton
