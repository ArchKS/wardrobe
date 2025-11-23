import { useMemo } from 'react'
import { ClothingItem } from '../types'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface AnalyticsProps {
  items: ClothingItem[]
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316']

export default function Analytics({ items }: AnalyticsProps) {
  const brandData = useMemo(() => {
    const brandCounts: Record<string, number> = {}
    items.forEach(item => {
      item.brand.forEach(brand => {
        brandCounts[brand] = (brandCounts[brand] || 0) + 1
      })
    })
    return Object.entries(brandCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [items])

  const categoryData = useMemo(() => {
    const categoryCounts: Record<string, number> = {}
    items.forEach(item => {
      item.category.forEach(category => {
        categoryCounts[category] = (categoryCounts[category] || 0) + 1
      })
    })
    return Object.entries(categoryCounts).map(([name, value]) => ({ name, value }))
  }, [items])

  const styleData = useMemo(() => {
    const styleCounts: Record<string, number> = {}
    items.forEach(item => {
      item.style.forEach(style => {
        styleCounts[style] = (styleCounts[style] || 0) + 1
      })
    })
    return Object.entries(styleCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [items])

  const satisfactionData = useMemo(() => {
    const satisfactionCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    items.forEach(item => {
      satisfactionCounts[item.satisfaction] = (satisfactionCounts[item.satisfaction] || 0) + 1
    })
    return Object.entries(satisfactionCounts).map(([name, value]) => ({ name: `${name}星`, value }))
  }, [items])

  const monthlyData = useMemo(() => {
    const monthlyCounts: Record<string, number> = {}
    items.forEach(item => {
      const month = item.time.substring(0, 7)
      monthlyCounts[month] = (monthlyCounts[month] || 0) + 1
    })
    return Object.entries(monthlyCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [items])

  const avgSatisfaction = useMemo(() => {
    const total = items.reduce((sum, item) => sum + item.satisfaction, 0)
    return (total / items.length).toFixed(1)
  }, [items])

  const totalPrice = useMemo(() => {
    return items.reduce((sum, item) => sum + (item.price || 0), 0)
  }, [items])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-1">总计衣服</h3>
          <p className="text-3xl font-bold text-gray-900">{items.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-1">平均满意度</h3>
          <p className="text-3xl font-bold text-gray-900">{avgSatisfaction} / 5</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-1">总花费</h3>
          <p className="text-3xl font-bold text-gray-900">¥{totalPrice.toLocaleString()}</p>
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
    </div>
  )
}
