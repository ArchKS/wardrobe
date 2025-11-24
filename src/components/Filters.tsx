import { useMemo } from 'react'
import { ClothingItem, FilterOptions } from '../types'
import { X, Filter, Star } from 'lucide-react'

interface FiltersProps {
  items: ClothingItem[]
  filters: FilterOptions
  setFilters: (filters: FilterOptions) => void
  isOpen: boolean
  onToggle: () => void
}

export default function Filters({ items, filters, setFilters, isOpen, onToggle }: FiltersProps) {
  const allBrands = useMemo(() => [...new Set(items.flatMap(item => item.brand))].sort(), [items])
  const allParts = useMemo(() => [...new Set(items.map(item => item.size))].sort(), [items])
  const allCategories = useMemo(() => [...new Set(items.flatMap(item => item.category))].sort(), [items])
  const allStyles = useMemo(() => [...new Set(items.flatMap(item => item.style))].sort(), [items])
  const allMaterials = useMemo(() => [...new Set(items.map(item => item.material))].sort(), [items])
  const allScenes = useMemo(() => [...new Set(items.map(item => item.scene))].sort(), [items])

  const toggleFilter = (type: keyof Pick<FilterOptions, 'brands' | 'size' | 'categories' | 'styles' | 'materials' | 'scenes'>, value: string) => {
    setFilters({
      ...filters,
      [type]: filters[type].includes(value)
        ? filters[type].filter(v => v !== value)
        : [...filters[type], value]
    })
  }

  const toggleSatisfaction = (value: number) => {
    // 检查当前是否选中了这个满意度
    const isCurrentlyFiltered = filters.satisfactionMin <= value && filters.satisfactionMax >= value

    if (isCurrentlyFiltered && filters.satisfactionMin === value && filters.satisfactionMax === value) {
      // 如果只选中了这一个，点击后重置为全选
      setFilters({ ...filters, satisfactionMin: 1, satisfactionMax: 5 })
    } else {
      // 否则只筛选这一个等级
      setFilters({ ...filters, satisfactionMin: value, satisfactionMax: value })
    }
  }

  const clearAllFilters = () => {
    setFilters({
      brands: [],
      size: [],
      categories: [],
      styles: [],
      materials: [],
      scenes: [],
      satisfactionMin: 1,
      satisfactionMax: 5,
    })
  }

  const hasActiveFilters =
    filters.brands.length > 0 ||
    filters.size.length > 0 ||
    filters.categories.length > 0 ||
    filters.styles.length > 0 ||
    filters.materials.length > 0 ||
    filters.scenes.length > 0 ||
    filters.satisfactionMin > 1 ||
    filters.satisfactionMax < 5

  return (
    <>
      {/* 右下角悬浮按钮 */}
      <button
        onClick={onToggle}
        className={`fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all z-40 ${
          isOpen
            ? 'bg-gray-600 text-white hover:bg-gray-700'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Filter className="w-6 h-6" />}
      </button>

      {/* 侧边栏 */}
      {isOpen && (
        <div className="fixed right-0 top-0 bottom-0 w-full sm:w-96 bg-white shadow-2xl z-50 overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">筛选</h2>
          </div>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
              >
                <X className="w-4 h-4" />
                清除所有
              </button>
            )}
            <button
              onClick={onToggle}
              className="ml-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">品牌</label>
          <div className="flex flex-wrap gap-2">
            {allBrands.map(brand => (
              <button
                key={brand}
                onClick={() => toggleFilter('brands', brand)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  filters.brands.includes(brand)
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {brand}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">尺码</label>
          <div className="flex flex-wrap gap-2">
            {allParts.map(size => (
              <button
                key={size}
                onClick={() => toggleFilter('size', size)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  filters.size.includes(size)
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">类别</label>
          <div className="flex flex-wrap gap-2">
            {allCategories.map(category => (
              <button
                key={category}
                onClick={() => toggleFilter('categories', category)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  filters.categories.includes(category)
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">风格</label>
          <div className="flex flex-wrap gap-2">
            {allStyles.map(style => (
              <button
                key={style}
                onClick={() => toggleFilter('styles', style)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  filters.styles.includes(style)
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {style}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">材质</label>
          <div className="flex flex-wrap gap-2">
            {allMaterials.map(material => (
              <button
                key={material}
                onClick={() => toggleFilter('materials', material)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  filters.materials.includes(material)
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {material}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">场景</label>
          <div className="flex flex-wrap gap-2">
            {allScenes.map(scene => (
              <button
                key={scene}
                onClick={() => toggleFilter('scenes', scene)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  filters.scenes.includes(scene)
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {scene}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-3">满意度</label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map(num => {
              const isSelected = filters.satisfactionMin <= num && filters.satisfactionMax >= num
              return (
                <button
                  key={num}
                  onClick={() => toggleSatisfaction(num)}
                  className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isSelected
                      ? 'bg-yellow-50 text-yellow-700 border-2 border-yellow-400'
                      : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
                  }`}
                >
                  <Star className={`w-4 h-4 ${isSelected ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                  <span>{num}</span>
                </button>
              )
            })}
          </div>
        </div>
          </div>
        </div>
        </div>
      )}
    </>
  )
}
