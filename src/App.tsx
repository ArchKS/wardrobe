import { useState, useMemo, useEffect } from 'react'
import { ClothingItem, ViewMode, FilterOptions } from './types'
import wardrobeData from './data/wardrobe.json'
import Gallery from './components/Gallery'
import Filters from './components/Filters'
import Analytics from './components/Analytics'
import Header from './components/Header'
import Toast from './components/Toast'

function App() {
  const [items, setItems] = useState<ClothingItem[]>(wardrobeData.items)
  const [viewMode, setViewMode] = useState<ViewMode>('timeline')
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [filters, setFilters] = useState<FilterOptions>({
    brands: [],
    size: [],
    categories: [],
    styles: [],
    materials: [],
    scenes: [],
    satisfactionMin: 1,
    satisfactionMax: 5,
  })

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // 过滤掉已标记删除的项
      if (item.isDelete === 1) return false
      if (filters.brands.length > 0 && !filters.brands.some(b => item.brand.includes(b))) return false
      if (filters.size.length > 0 && !filters.size.includes(item.size)) return false
      if (filters.categories.length > 0 && !filters.categories.some(c => item.category.includes(c))) return false
      if (filters.styles.length > 0 && !filters.styles.some(s => item.style.includes(s))) return false
      if (filters.materials.length > 0 && !filters.materials.includes(item.material)) return false
      if (filters.scenes.length > 0 && !filters.scenes.includes(item.scene)) return false
      if (item.satisfaction < filters.satisfactionMin || item.satisfaction > filters.satisfactionMax) return false
      if (filters.dateRange) {
        const itemDate = new Date(item.time)
        const start = new Date(filters.dateRange.start)
        const end = new Date(filters.dateRange.end)
        if (itemDate < start || itemDate > end) return false
      }
      return true
    })
  }, [items, filters])

  const handleUpdateItem = (updatedItem: ClothingItem) => {
    setItems(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item))
  }

  const handleMergeItems = (sourceId: string, targetId: string) => {
    setItems(prev => {
      const source = prev.find(item => item.id === sourceId)
      const target = prev.find(item => item.id === targetId)

      if (!source || !target) return prev

      // 合并图片，去重
      const mergedImages = [...new Set([...target.images, ...source.images])]

      // 更新目标项的图片
      const updatedTarget = { ...target, images: mergedImages }

      // 删除源项，更新目标项
      return prev
        .filter(item => item.id !== sourceId)
        .map(item => item.id === targetId ? updatedTarget : item)
    })
  }

  const handleDeleteItem = (id: string) => {
    // 标记删除，不是真正删除
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, isDelete: 1 } : item
    ))
  }

  const handleCreateItem = (newItem: ClothingItem) => {
    setItems(prev => [...prev, newItem])
  }

  const handleExportData = () => {
    const dataStr = JSON.stringify({ items }, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'wardrobe.json'
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleCopyToClipboard = async () => {
    try {
      const dataStr = JSON.stringify({ items }, null, 2)
      await navigator.clipboard.writeText(dataStr)
      setShowToast(true)
    } catch (err) {
      console.error('复制失败:', err)
      alert('复制失败，请重试')
    }
  }

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [showToast])

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        viewMode={viewMode}
        setViewMode={setViewMode}
        showAnalytics={showAnalytics}
        setShowAnalytics={setShowAnalytics}
        onExport={handleExportData}
        onCopyToClipboard={handleCopyToClipboard}
      />

      <Filters
        items={items}
        filters={filters}
        setFilters={setFilters}
        isOpen={showFilters}
        onToggle={() => setShowFilters(!showFilters)}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showAnalytics ? (
          <Analytics items={filteredItems} />
        ) : (
          <Gallery
            items={filteredItems}
            viewMode={viewMode}
            onUpdateItem={handleUpdateItem}
            onMergeItems={handleMergeItems}
            onDeleteItem={handleDeleteItem}
            onCreateItem={handleCreateItem}
          />
        )}
      </div>

      <Toast show={showToast} message="配置已复制到剪贴板！" />
    </div>
  )
}

export default App
