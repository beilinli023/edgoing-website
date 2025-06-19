/**
 * 🛡️ 安全的错误边界组件
 * 
 * 功能:
 * - 捕获React组件错误
 * - 抑制浏览器扩展错误
 * - 提供用户友好的错误界面
 * - 开发环境详细错误信息
 */

'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    // 更新state以显示错误UI
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // 记录错误信息
    this.setState({ errorInfo })
    
    // 调用自定义错误处理器
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // 过滤浏览器扩展错误
    if (this.isBrowserExtensionError(error)) {
      console.warn('🔌 Browser extension error suppressed:', error.message)
      return
    }

    // 记录应用错误
    console.error('🚨 Application Error:', error)
    console.error('Error Info:', errorInfo)
  }

  /**
   * 检测是否为浏览器扩展错误
   */
  private isBrowserExtensionError(error: Error): boolean {
    const extensionPatterns = [
      'runtime.lastError',
      'message port closed',
      'Extension context invalidated',
      'chrome-extension://',
      'moz-extension://',
      'safari-extension://',
    ]

    const errorMessage = error.message?.toLowerCase() || ''
    const errorStack = error.stack?.toLowerCase() || ''

    return extensionPatterns.some(pattern => 
      errorMessage.includes(pattern.toLowerCase()) || 
      errorStack.includes(pattern.toLowerCase())
    )
  }

  /**
   * 重置错误状态
   */
  private resetError = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  render() {
    if (this.state.hasError) {
      // 如果是浏览器扩展错误，不显示错误界面
      if (this.state.error && this.isBrowserExtensionError(this.state.error)) {
        return this.props.children
      }

      // 自定义错误界面
      if (this.props.fallback) {
        return this.props.fallback
      }

      // 默认错误界面
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
              <svg
                className="w-6 h-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            
            <div className="mt-4 text-center">
              <h3 className="text-lg font-medium text-gray-900">
                出现了一些问题
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                页面遇到了错误，请尝试刷新页面或联系技术支持。
              </p>
              
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-4 text-left">
                  <summary className="cursor-pointer text-sm font-medium text-gray-700">
                    错误详情 (开发模式)
                  </summary>
                  <div className="mt-2 p-3 bg-gray-100 rounded text-xs font-mono text-gray-800 overflow-auto max-h-40">
                    <div className="font-bold">错误信息:</div>
                    <div className="mb-2">{this.state.error.message}</div>
                    {this.state.error.stack && (
                      <>
                        <div className="font-bold">堆栈跟踪:</div>
                        <pre className="whitespace-pre-wrap">
                          {this.state.error.stack}
                        </pre>
                      </>
                    )}
                  </div>
                </details>
              )}
            </div>
            
            <div className="mt-6 flex space-x-3">
              <button
                onClick={this.resetError}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                重试
              </button>
              <button
                onClick={() => window.location.reload()}
                className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                刷新页面
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * 全局错误处理器
 */
export function setupGlobalErrorHandlers() {
  // 处理未捕获的Promise拒绝
  window.addEventListener('unhandledrejection', (event) => {
    const error = event.reason
    
    // 抑制浏览器扩展错误
    if (error?.message?.includes('runtime.lastError') || 
        error?.message?.includes('message port closed')) {
      console.warn('🔌 Browser extension error suppressed:', error.message)
      event.preventDefault()
      return
    }

    console.error('🚨 Unhandled Promise Rejection:', error)
  })

  // 处理全局错误
  window.addEventListener('error', (event) => {
    const error = event.error
    
    // 抑制浏览器扩展错误
    if (error?.message?.includes('runtime.lastError') || 
        error?.message?.includes('message port closed')) {
      console.warn('🔌 Browser extension error suppressed:', error.message)
      event.preventDefault()
      return
    }

    console.error('🚨 Global Error:', error)
  })
}

/**
 * 错误边界Hook
 */
export function useErrorHandler() {
  const handleError = (error: Error, context: string = 'Component') => {
    // 检查是否为浏览器扩展错误
    if (error?.message?.includes('runtime.lastError') || 
        error?.message?.includes('message port closed')) {
      console.warn(`🔌 Browser extension error in ${context}:`, error.message)
      return
    }

    console.error(`🚨 Error in ${context}:`, error)
  }

  return { handleError }
}
