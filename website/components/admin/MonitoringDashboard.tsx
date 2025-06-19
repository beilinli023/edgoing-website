/**
 * 安全的监控仪表板组件
 * 显示系统性能指标，只允许管理员访问
 */

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Activity, 
  Database, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react'

interface SystemOverview {
  totalQueries: number
  slowQueries: number
  errorQueries: number
  avgMemoryUsage: number
  monitoringStatus: 'healthy' | 'warning' | 'critical'
}

interface MemoryInfo {
  heapUsed: number
  heapTotal: number
  external: number
  rss: number
}

interface QueryStats {
  [queryName: string]: {
    queryName: string
    count: number
    avgDuration: number
    maxDuration: number
    minDuration: number
    errorRate: number
    lastExecuted: number
  }
}

interface MonitoringData {
  timestamp: string
  system: SystemOverview
  memory: MemoryInfo
  uptime: number
  nodeVersion: string
  platform: string
}

export default function MonitoringDashboard() {
  const [data, setData] = useState<MonitoringData | null>(null)
  const [queryStats, setQueryStats] = useState<QueryStats>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  const fetchMonitoringData = async () => {
    try {
      setError(null)
      
      // 获取系统概览
      const overviewResponse = await fetch('/api/admin/monitoring?type=overview')
      if (!overviewResponse.ok) {
        throw new Error(`HTTP ${overviewResponse.status}: ${overviewResponse.statusText}`)
      }
      
      const overviewData = await overviewResponse.json()
      setData(overviewData)
      
      // 获取查询统计
      const queryResponse = await fetch('/api/admin/monitoring?type=queries')
      if (queryResponse.ok) {
        const queryData = await queryResponse.json()
        setQueryStats(queryData.queries || {})
      }
      
      setLastUpdate(new Date())
    } catch (err) {
      console.error('Failed to fetch monitoring data:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch monitoring data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMonitoringData()
    
    // 每30秒自动刷新
    const interval = setInterval(fetchMonitoringData, 30000)
    return () => clearInterval(interval)
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      case 'critical':
        return <XCircle className="w-5 h-5 text-red-500" />
      default:
        return <Minus className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-500/20 text-green-300 border-green-500/30'
      case 'warning':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
      case 'critical':
        return 'bg-red-500/20 text-red-300 border-red-500/30'
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30'
    }
  }

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    
    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`
    } else {
      return `${minutes}m`
    }
  }

  const formatBytes = (bytes: number) => {
    return `${bytes} MB`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-6 h-6 animate-spin text-blue-500 mr-2" />
        <span className="text-white">Loading monitoring data...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="bg-red-500/10 border-red-500/30">
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <XCircle className="w-6 h-6 text-red-500 mr-2" />
              <h3 className="text-lg font-semibold text-red-300">Monitoring Error</h3>
            </div>
            <p className="text-red-200 mb-4">{error}</p>
            <Button 
              onClick={fetchMonitoringData}
              variant="outline"
              className="bg-red-500/20 border-red-500/30 text-red-300 hover:bg-red-500/30"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="p-6 text-center text-gray-400">
        No monitoring data available
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">System Monitoring</h2>
          <p className="text-slate-300">
            Last updated: {lastUpdate?.toLocaleTimeString() || 'Never'}
          </p>
        </div>
        <Button 
          onClick={fetchMonitoringData}
          variant="outline"
          className="bg-white/10 border-white/20 text-white hover:bg-white/20"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* System Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">System Status</p>
                <div className="flex items-center mt-2">
                  {getStatusIcon(data.system.monitoringStatus)}
                  <Badge className={`ml-2 ${getStatusColor(data.system.monitoringStatus)}`}>
                    {data.system.monitoringStatus.toUpperCase()}
                  </Badge>
                </div>
              </div>
              <Activity className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total Queries</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {data.system.totalQueries.toLocaleString()}
                </p>
              </div>
              <Database className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Slow Queries</p>
                <p className="text-2xl font-bold text-yellow-400 mt-1">
                  {data.system.slowQueries}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Memory Usage</p>
                <p className="text-2xl font-bold text-purple-400 mt-1">
                  {formatBytes(data.memory.heapUsed)}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Information */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-white/10">
          <TabsTrigger value="overview" className="data-[state=active]:bg-white/20">
            Overview
          </TabsTrigger>
          <TabsTrigger value="queries" className="data-[state=active]:bg-white/20">
            Query Performance
          </TabsTrigger>
          <TabsTrigger value="system" className="data-[state=active]:bg-white/20">
            System Info
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Performance Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-300">Error Rate:</span>
                    <span className={`font-semibold ${
                      data.system.errorQueries > 5 ? 'text-red-400' : 'text-green-400'
                    }`}>
                      {data.system.totalQueries > 0 
                        ? ((data.system.errorQueries / data.system.totalQueries) * 100).toFixed(1)
                        : 0}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Slow Query Rate:</span>
                    <span className={`font-semibold ${
                      data.system.slowQueries > 10 ? 'text-yellow-400' : 'text-green-400'
                    }`}>
                      {data.system.totalQueries > 0 
                        ? ((data.system.slowQueries / data.system.totalQueries) * 100).toFixed(1)
                        : 0}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Uptime:</span>
                    <span className="text-green-400 font-semibold">
                      {formatUptime(data.uptime)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Memory Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-300">Heap Used:</span>
                    <span className="text-white font-semibold">
                      {formatBytes(data.memory.heapUsed)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Heap Total:</span>
                    <span className="text-slate-300">
                      {formatBytes(data.memory.heapTotal)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">External:</span>
                    <span className="text-slate-300">
                      {formatBytes(data.memory.external)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">RSS:</span>
                    <span className="text-slate-300">
                      {formatBytes(data.memory.rss)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="queries" className="space-y-4">
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Query Performance</CardTitle>
              <CardDescription className="text-slate-300">
                Performance statistics for database queries
              </CardDescription>
            </CardHeader>
            <CardContent>
              {Object.keys(queryStats).length === 0 ? (
                <p className="text-slate-400 text-center py-4">
                  No query statistics available yet
                </p>
              ) : (
                <div className="space-y-3">
                  {Object.values(queryStats)
                    .sort((a, b) => b.avgDuration - a.avgDuration)
                    .slice(0, 10)
                    .map((query) => (
                      <div key={query.queryName} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div className="flex-1">
                          <p className="text-white font-medium">{query.queryName}</p>
                          <p className="text-sm text-slate-400">
                            {query.count} executions • {query.errorRate}% error rate
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`font-semibold ${
                            query.avgDuration > 200 ? 'text-red-400' : 
                            query.avgDuration > 100 ? 'text-yellow-400' : 'text-green-400'
                          }`}>
                            {query.avgDuration}ms avg
                          </p>
                          <p className="text-sm text-slate-400">
                            max: {query.maxDuration}ms
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">System Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-300">Node.js Version:</span>
                    <span className="text-white font-semibold">{data.nodeVersion}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Platform:</span>
                    <span className="text-white font-semibold">{data.platform}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Uptime:</span>
                    <span className="text-white font-semibold">{formatUptime(data.uptime)}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-300">Last Update:</span>
                    <span className="text-white font-semibold">
                      {new Date(data.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Environment:</span>
                    <span className="text-white font-semibold">
                      {process.env.NODE_ENV || 'unknown'}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
