import { useMemo } from 'react'
import { ClothingItem, ViewMode } from '../types'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import ClothingCard from './ClothingCard'

// 计算平均星级并返回星星显示
function getStarRating(items: ClothingItem[]): string {
  if (items.length === 0) return ''
  const avgSatisfaction = items.reduce((sum, item) => sum + item.satisfaction, 0) / items.length
  const roundedRating = Math.round(avgSatisfaction)
  return '⭐'.repeat(roundedRating)
}

interface GalleryProps {
  items: ClothingItem[]
  viewMode: ViewMode
  onUpdateItem: (item: ClothingItem) => void
  onMergeItems: (sourceId: string, targetId: string) => void
  onDeleteItem: (id: string) => void
}

export default function Gallery({ items, viewMode, onUpdateItem, onMergeItems, onDeleteItem }: GalleryProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">没有找到符合条件的衣服</p>
      </div>
    )
  }

  if (viewMode === 'grid') {
    return <GridView items={items} onUpdateItem={onUpdateItem} onMergeItems={onMergeItems} onDeleteItem={onDeleteItem} />
  } else if (viewMode === 'timeline') {
    return <TimelineView items={items} onUpdateItem={onUpdateItem} onMergeItems={onMergeItems} onDeleteItem={onDeleteItem} />
  } else if (viewMode === 'category') {
    return <CategoryView items={items} onUpdateItem={onUpdateItem} onMergeItems={onMergeItems} onDeleteItem={onDeleteItem} />
  } else if (viewMode === 'brand') {
    return <BrandView items={items} onUpdateItem={onUpdateItem} onMergeItems={onMergeItems} onDeleteItem={onDeleteItem} />
  } else if (viewMode === 'size') {
    return <PartView items={items} onUpdateItem={onUpdateItem} onMergeItems={onMergeItems} onDeleteItem={onDeleteItem} />
  } else if (viewMode === 'material') {
    return <MaterialView items={items} onUpdateItem={onUpdateItem} onMergeItems={onMergeItems} onDeleteItem={onDeleteItem} />
  } else if (viewMode === 'style') {
    return <StyleView items={items} onUpdateItem={onUpdateItem} onMergeItems={onMergeItems} onDeleteItem={onDeleteItem} />
  } else {
    return <LocationView items={items} onUpdateItem={onUpdateItem} onMergeItems={onMergeItems} onDeleteItem={onDeleteItem} />
  }
}

function GridView({ items, onUpdateItem, onMergeItems, onDeleteItem }: { items: ClothingItem[], onUpdateItem: (item: ClothingItem) => void, onMergeItems: (sourceId: string, targetId: string) => void, onDeleteItem: (id: string) => void }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {items.map(item => (
        <ClothingCard key={item.id} item={item} onUpdate={onUpdateItem} onMerge={onMergeItems} onDelete={onDeleteItem} />
      ))}
    </div>
  )
}

function TimelineView({ items, onUpdateItem, onMergeItems, onDeleteItem }: { items: ClothingItem[], onUpdateItem: (item: ClothingItem) => void, onMergeItems: (sourceId: string, targetId: string) => void, onDeleteItem: (id: string) => void }) {
  const groupedByDate = useMemo(() => {
    const groups: Record<string, ClothingItem[]> = {}
    items.forEach(item => {
      const date = item.time
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(item)
    })
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]))
  }, [items])

  return (
    <div className="space-y-6">
      {groupedByDate.map(([date, dateItems]) => (
        <div key={date} className="relative">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-3 h-3 rounded-full bg-blue-600"></div>
            <h3 className="text-lg font-semibold text-gray-900">
              {format(new Date(date), 'yyyy年MM月dd日 EEEE', { locale: zhCN })} ({dateItems.length}) {getStarRating(dateItems)}
            </h3>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>
          <div className="ml-7 relative">
            <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-200"></div>
            <div className="overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              <div className="flex gap-4 min-w-max pl-6">
                {dateItems.map(item => (
                  <div key={item.id} className="w-64 flex-shrink-0">
                    <ClothingCard item={item} onUpdate={onUpdateItem} onMerge={onMergeItems} onDelete={onDeleteItem} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function CategoryView({ items, onUpdateItem, onMergeItems, onDeleteItem }: { items: ClothingItem[], onUpdateItem: (item: ClothingItem) => void, onMergeItems: (sourceId: string, targetId: string) => void, onDeleteItem: (id: string) => void }) {
  const groupedByCategory = useMemo(() => {
    const groups: Record<string, ClothingItem[]> = {}
    items.forEach(item => {
      const categories = item.category && item.category.length > 0 ? item.category : ['未分类']
      categories.forEach(category => {
        if (!groups[category]) {
          groups[category] = []
        }
        groups[category].push(item)
      })
    })
    return Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0]))
  }, [items])

  return (
    <div className="space-y-8">
      {groupedByCategory.map(([category, categoryItems]) => (
        <div key={category}>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 sticky top-0 bg-gray-50 py-2 z-10">
            {category} ({categoryItems.length}) {getStarRating(categoryItems)}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {categoryItems.map(item => (
              <ClothingCard key={item.id} item={item} onUpdate={onUpdateItem} onMerge={onMergeItems} onDelete={onDeleteItem} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function BrandView({ items, onUpdateItem, onMergeItems, onDeleteItem }: { items: ClothingItem[], onUpdateItem: (item: ClothingItem) => void, onMergeItems: (sourceId: string, targetId: string) => void, onDeleteItem: (id: string) => void }) {
  const groupedByBrand = useMemo(() => {
    const groups: Record<string, ClothingItem[]> = {}
    items.forEach(item => {
      const brands = item.brand && item.brand.length > 0 ? item.brand : ['未知品牌']
      brands.forEach(brand => {
        if (!groups[brand]) {
          groups[brand] = []
        }
        groups[brand].push(item)
      })
    })
    return Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0]))
  }, [items])

  return (
    <div className="space-y-6">
      {groupedByBrand.map(([brand, brandItems]) => (
        <div key={brand} className="relative">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-3 h-3 rounded-full bg-blue-600"></div>
            <h3 className="text-lg font-semibold text-gray-900">
              {brand} ({brandItems.length}) {getStarRating(brandItems)}
            </h3>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>
          <div className="ml-7 relative">
            <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-200"></div>
            <div className="overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              <div className="flex gap-4 min-w-max pl-6">
                {brandItems.map(item => (
                  <div key={item.id} className="w-64 flex-shrink-0">
                    <ClothingCard item={item} onUpdate={onUpdateItem} onMerge={onMergeItems} onDelete={onDeleteItem} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function PartView({ items, onUpdateItem, onMergeItems, onDeleteItem }: { items: ClothingItem[], onUpdateItem: (item: ClothingItem) => void, onMergeItems: (sourceId: string, targetId: string) => void, onDeleteItem: (id: string) => void }) {
  const groupedByPart = useMemo(() => {
    const groups: Record<string, ClothingItem[]> = {}
    items.forEach(item => {
      const size = item.size || '其他'
      if (!groups[size]) {
        groups[size] = []
      }
      groups[size].push(item)
    })
    return Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0]))
  }, [items])

  return (
    <div className="space-y-6">
      {groupedByPart.map(([size, partItems]) => (
        <div key={size} className="relative">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-3 h-3 rounded-full bg-blue-600"></div>
            <h3 className="text-lg font-semibold text-gray-900">
              {size} ({partItems.length}) {getStarRating(partItems)}
            </h3>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>
          <div className="ml-7 relative">
            <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-200"></div>
            <div className="overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              <div className="flex gap-4 min-w-max pl-6">
                {partItems.map(item => (
                  <div key={item.id} className="w-64 flex-shrink-0">
                    <ClothingCard item={item} onUpdate={onUpdateItem} onMerge={onMergeItems} onDelete={onDeleteItem} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function MaterialView({ items, onUpdateItem, onMergeItems, onDeleteItem }: { items: ClothingItem[], onUpdateItem: (item: ClothingItem) => void, onMergeItems: (sourceId: string, targetId: string) => void, onDeleteItem: (id: string) => void }) {
  const groupedByMaterial = useMemo(() => {
    const groups: Record<string, ClothingItem[]> = {}
    items.forEach(item => {
      const material = item.material || '未知材质'
      if (!groups[material]) {
        groups[material] = []
      }
      groups[material].push(item)
    })
    return Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0]))
  }, [items])

  return (
    <div className="space-y-6">
      {groupedByMaterial.map(([material, materialItems]) => (
        <div key={material} className="relative">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-3 h-3 rounded-full bg-blue-600"></div>
            <h3 className="text-lg font-semibold text-gray-900">
              {material} ({materialItems.length}) {getStarRating(materialItems)}
            </h3>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>
          <div className="ml-7 relative">
            <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-200"></div>
            <div className="overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              <div className="flex gap-4 min-w-max pl-6">
                {materialItems.map(item => (
                  <div key={item.id} className="w-64 flex-shrink-0">
                    <ClothingCard item={item} onUpdate={onUpdateItem} onMerge={onMergeItems} onDelete={onDeleteItem} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function StyleView({ items, onUpdateItem, onMergeItems, onDeleteItem }: { items: ClothingItem[], onUpdateItem: (item: ClothingItem) => void, onMergeItems: (sourceId: string, targetId: string) => void, onDeleteItem: (id: string) => void }) {
  const groupedByStyle = useMemo(() => {
    const groups: Record<string, ClothingItem[]> = {}
    items.forEach(item => {
      // 风格是数组，需要为每个风格都添加一次
      if (item.style && item.style.length > 0) {
        item.style.forEach(style => {
          if (style) {
            if (!groups[style]) {
              groups[style] = []
            }
            groups[style].push(item)
          }
        })
      } else {
        // 没有风格的归类到"未分类"
        if (!groups['未分类']) {
          groups['未分类'] = []
        }
        groups['未分类'].push(item)
      }
    })
    return Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0]))
  }, [items])

  return (
    <div className="space-y-6">
      {groupedByStyle.map(([style, styleItems]) => (
        <div key={style} className="relative">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-3 h-3 rounded-full bg-blue-600"></div>
            <h3 className="text-lg font-semibold text-gray-900">
              {style} ({styleItems.length}) {getStarRating(styleItems)}
            </h3>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>
          <div className="ml-7 relative">
            <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-200"></div>
            <div className="overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              <div className="flex gap-4 min-w-max pl-6">
                {styleItems.map(item => (
                  <div key={item.id} className="w-64 flex-shrink-0">
                    <ClothingCard item={item} onUpdate={onUpdateItem} onMerge={onMergeItems} onDelete={onDeleteItem} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function LocationView({ items, onUpdateItem, onMergeItems, onDeleteItem }: { items: ClothingItem[], onUpdateItem: (item: ClothingItem) => void, onMergeItems: (sourceId: string, targetId: string) => void, onDeleteItem: (id: string) => void }) {
  const groupedByLocation = useMemo(() => {
    const groups: Record<string, ClothingItem[]> = {}
    items.forEach(item => {
      const location = item.location || '未知地点'
      if (!groups[location]) {
        groups[location] = []
      }
      groups[location].push(item)
    })
    return Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0]))
  }, [items])

  return (
    <div className="space-y-6">
      {groupedByLocation.map(([location, locationItems]) => (
        <div key={location} className="relative">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-3 h-3 rounded-full bg-blue-600"></div>
            <h3 className="text-lg font-semibold text-gray-900">
              {location} ({locationItems.length}) {getStarRating(locationItems)}
            </h3>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>
          <div className="ml-7 relative">
            <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-200"></div>
            <div className="overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              <div className="flex gap-4 min-w-max pl-6">
                {locationItems.map(item => (
                  <div key={item.id} className="w-64 flex-shrink-0">
                    <ClothingCard item={item} onUpdate={onUpdateItem} onMerge={onMergeItems} onDelete={onDeleteItem} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
