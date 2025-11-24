import { useMemo, useState } from 'react'
import { ClothingItem } from '../types'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts'

interface AnalyticsProps {
  items: ClothingItem[]
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316']

export default function Analytics({ items }: AnalyticsProps) {
  const [dateRange, setDateRange] = useState<{ start: string; end: string } | null>(null)

  // 根据时间段过滤数据
  const filteredItems = useMemo(() => {
    if (!dateRange) return items
    return items.filter(item => {
      const itemDate = new Date(item.time)
      const start = new Date(dateRange.start)
      const end = new Date(dateRange.end)
      return itemDate >= start && itemDate <= end
    })
  }, [items, dateRange])

  const brandData = useMemo(() => {
    const brandCounts: Record<string, number> = {}
    filteredItems.forEach(item => {
      item.brand.forEach(brand => {
        brandCounts[brand] = (brandCounts[brand] || 0) + 1
      })
    })
    return Object.entries(brandCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [filteredItems])

  const categoryData = useMemo(() => {
    const categoryCounts: Record<string, number> = {}
    filteredItems.forEach(item => {
      item.category.forEach(category => {
        categoryCounts[category] = (categoryCounts[category] || 0) + 1
      })
    })
    return Object.entries(categoryCounts).map(([name, value]) => ({ name, value }))
  }, [filteredItems])

  const styleData = useMemo(() => {
    const styleCounts: Record<string, number> = {}
    filteredItems.forEach(item => {
      item.style.forEach(style => {
        styleCounts[style] = (styleCounts[style] || 0) + 1
      })
    })
    return Object.entries(styleCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [filteredItems])

  const satisfactionData = useMemo(() => {
    const satisfactionCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    filteredItems.forEach(item => {
      satisfactionCounts[item.satisfaction] = (satisfactionCounts[item.satisfaction] || 0) + 1
    })
    return Object.entries(satisfactionCounts).map(([name, value]) => ({ name: `${name}星`, value }))
  }, [filteredItems])

  const monthlyData = useMemo(() => {
    const monthlyCounts: Record<string, number> = {}
    filteredItems.forEach(item => {
      const month = item.time.substring(0, 7)
      monthlyCounts[month] = (monthlyCounts[month] || 0) + 1
    })
    return Object.entries(monthlyCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [filteredItems])

  const avgSatisfaction = useMemo(() => {
    const total = filteredItems.reduce((sum, item) => sum + item.satisfaction, 0)
    return (total / filteredItems.length).toFixed(1)
  }, [filteredItems])

  const totalPrice = useMemo(() => {
    return filteredItems.reduce((sum, item) => sum + (item.price || 0), 0)
  }, [filteredItems])

  // 已购入统计
  const purchasedStats = useMemo(() => {
    const purchased = filteredItems.filter(item => item.isPurchased)
    const totalPurchased = purchased.reduce((sum, item) => sum + (item.price || 0), 0)
    return {
      count: purchased.length,
      total: totalPurchased
    }
  }, [filteredItems])

  // 按年统计已购入金额
  const yearlyPurchasedData = useMemo(() => {
    const yearlySpending: Record<string, number> = {}
    filteredItems.forEach(item => {
      if (item.isPurchased && item.price) {
        const year = item.time.substring(0, 4)
        yearlySpending[year] = (yearlySpending[year] || 0) + item.price
      }
    })
    return Object.entries(yearlySpending)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [filteredItems])

  // 按月统计已购入金额
  const monthlyPurchasedData = useMemo(() => {
    const monthlySpending: Record<string, number> = {}
    filteredItems.forEach(item => {
      if (item.isPurchased && item.price) {
        const month = item.time.substring(0, 7)
        monthlySpending[month] = (monthlySpending[month] || 0) + item.price
      }
    })
    return Object.entries(monthlySpending)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [filteredItems])

  return (
    <div className="space-y-6">
      {/* 时间段选择器 */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">时间段筛选</h3>
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">开始日期</label>
            <input
              type="date"
              value={dateRange?.start || ''}
              onChange={(e) => setDateRange(prev => ({ start: e.target.value, end: prev?.end || e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">结束日期</label>
            <input
              type="date"
              value={dateRange?.end || ''}
              onChange={(e) => setDateRange(prev => ({ start: prev?.start || e.target.value, end: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
          {dateRange && (
            <button
              onClick={() => setDateRange(null)}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md text-sm transition-colors"
            >
              清除筛选
            </button>
          )}
        </div>
      </div>

      {/* 基础统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-1">总计衣服</h3>
          <p className="text-3xl font-bold text-gray-900">{filteredItems.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-1">平均满意度</h3>
          <p className="text-3xl font-bold text-gray-900">{avgSatisfaction} / 5</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-1">总花费</h3>
          <p className="text-3xl font-bold text-gray-900">¥{totalPrice.toLocaleString()}</p>
        </div>
        <div className="bg-green-50 rounded-lg shadow-sm p-6 border-2 border-green-200">
          <h3 className="text-sm font-medium text-green-700 mb-1">已购入数量</h3>
          <p className="text-3xl font-bold text-green-900">{purchasedStats.count}</p>
        </div>
        <div className="bg-green-50 rounded-lg shadow-sm p-6 border-2 border-green-200">
          <h3 className="text-sm font-medium text-green-700 mb-1">已购入金额</h3>
          <p className="text-3xl font-bold text-green-900">¥{purchasedStats.total.toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">品牌分布</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={brandData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {brandData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">类别分布</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">风格统计</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={styleData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={80} />
              <Tooltip />
              <Bar dataKey="value" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">满意度分布</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={satisfactionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#F59E0B" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">月度试穿趋势</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#8B5CF6" name="试穿数量" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 已购入金额统计 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">按年统计已购入金额</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={yearlyPurchasedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value: number) => `¥${value.toLocaleString()}`} />
              <Bar dataKey="value" fill="#10B981" name="已购入金额" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">按月统计已购入金额</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyPurchasedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value: number) => `¥${value.toLocaleString()}`} />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#10B981" strokeWidth={2} name="已购入金额" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
