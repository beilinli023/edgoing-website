"use client"

import { useState } from 'react'

interface ScanResult {
  totalRecords: number
  validFiles: number
  issues: number
  issueDetails: Array<{
    id: string
    filename: string
    url?: string
    issue: string
    type: string
    expectedPath?: string
  }>
  validFileDetails: Array<{
    id: string
    filename: string
    url: string
    exists: boolean
  }>
}

interface CleanupResult {
  message: string
  deletedRecords: number
  deletedIds: string[]
}

/**
 * 🧹 媒体文件清理页面
 */
export default function MediaCleanupPage() {
  const [scanResult, setScanResult] = useState<ScanResult | null>(null)
  const [cleanupResult, setCleanupResult] = useState<CleanupResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleScan = async () => {
    setLoading(true)
    setError('')
    setScanResult(null)
    setCleanupResult(null)

    try {
      const response = await fetch('/api/debug/cleanup-media', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'scan' })
      })

      if (response.ok) {
        const data = await response.json()
        setScanResult(data)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Scan failed')
      }
    } catch (error) {
      setError('Network error during scan')
    } finally {
      setLoading(false)
    }
  }

  const handleCleanup = async () => {
    if (!scanResult || scanResult.issues === 0) {
      setError('No issues found to cleanup')
      return
    }

    if (!confirm(`确定要删除 ${scanResult.issues} 个无效的媒体记录吗？此操作不可撤销。`)) {
      return
    }

    setLoading(true)
    setError('')
    setCleanupResult(null)

    try {
      const response = await fetch('/api/debug/cleanup-media', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'cleanup' })
      })

      if (response.ok) {
        const data = await response.json()
        setCleanupResult(data)
        // 重新扫描以更新结果
        setTimeout(handleScan, 1000)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Cleanup failed')
      }
    } catch (error) {
      setError('Network error during cleanup')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🧹 媒体文件清理工具</h1>

        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">操作面板</h2>
          <div className="flex space-x-4">
            <button
              onClick={handleScan}
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? '扫描中...' : '🔍 扫描无效文件'}
            </button>
            
            {scanResult && scanResult.issues > 0 && (
              <button
                onClick={handleCleanup}
                disabled={loading}
                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? '清理中...' : `🗑️ 清理 ${scanResult.issues} 个无效记录`}
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {cleanupResult && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-green-800 mb-4">✅ 清理完成</h2>
            <p className="text-green-700">{cleanupResult.message}</p>
            <p className="text-green-700">删除了 {cleanupResult.deletedRecords} 个无效记录</p>
            {cleanupResult.deletedIds.length > 0 && (
              <details className="mt-4">
                <summary className="cursor-pointer text-green-700 font-semibold">查看删除的记录ID</summary>
                <div className="mt-2 p-2 bg-green-100 rounded text-xs">
                  {cleanupResult.deletedIds.join(', ')}
                </div>
              </details>
            )}
          </div>
        )}

        {scanResult && (
          <div className="space-y-6">
            {/* 统计信息 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-2">总记录数</h3>
                <p className="text-3xl font-bold text-blue-600">{scanResult.totalRecords}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-2">有效文件</h3>
                <p className="text-3xl font-bold text-green-600">{scanResult.validFiles}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-2">问题文件</h3>
                <p className="text-3xl font-bold text-red-600">{scanResult.issues}</p>
              </div>
            </div>

            {/* 问题详情 */}
            {scanResult.issues > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-red-800 mb-4">🚨 发现的问题</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full table-auto">
                    <thead>
                      <tr className="bg-red-50">
                        <th className="px-4 py-2 text-left">文件名</th>
                        <th className="px-4 py-2 text-left">URL</th>
                        <th className="px-4 py-2 text-left">问题类型</th>
                        <th className="px-4 py-2 text-left">问题描述</th>
                      </tr>
                    </thead>
                    <tbody>
                      {scanResult.issueDetails.map((issue, index) => (
                        <tr key={issue.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                          <td className="px-4 py-2 text-sm">{issue.filename}</td>
                          <td className="px-4 py-2 text-xs">
                            <code className="bg-gray-100 px-1 rounded">{issue.url || 'N/A'}</code>
                          </td>
                          <td className="px-4 py-2">
                            <span className={`px-2 py-1 rounded text-xs ${
                              issue.type === 'missing_file' ? 'bg-red-100 text-red-800' :
                              issue.type === 'empty_url' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {issue.type}
                            </span>
                          </td>
                          <td className="px-4 py-2 text-sm">{issue.issue}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 有效文件示例 */}
            {scanResult.validFiles > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-green-800 mb-4">✅ 有效文件示例</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {scanResult.validFileDetails.map((file) => (
                    <div key={file.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="w-full h-32 bg-gray-100 rounded mb-2 overflow-hidden">
                        <img
                          src={file.url}
                          alt={file.filename}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                            e.currentTarget.nextElementSibling.style.display = 'flex'
                          }}
                        />
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs" style={{display: 'none'}}>
                          预览失败
                        </div>
                      </div>
                      <p className="text-sm font-semibold truncate">{file.filename}</p>
                      <p className="text-xs text-gray-500 truncate">{file.url}</p>
                    </div>
                  ))}
                </div>
                {scanResult.validFiles > 5 && (
                  <p className="text-gray-500 text-sm mt-4">
                    还有 {scanResult.validFiles - 5} 个有效文件未显示...
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
