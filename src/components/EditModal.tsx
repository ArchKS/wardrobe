import { useState } from 'react'
import { ClothingItem } from '../types'
import { X } from 'lucide-react'
import config from '../data/config.json'
import SearchableSelect from './SearchableSelect'
import MultiSearchableSelect from './MultiSearchableSelect'
import StarRating from './StarRating'

interface EditModalProps {
  item: ClothingItem
  onClose: () => void
  onSave: (item: ClothingItem) => void
}

export default function EditModal({ item, onClose, onSave }: EditModalProps) {
  const [formData, setFormData] = useState(item)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  const handleStyleChange = (style: string) => {
    const newStyles = formData.style.includes(style)
      ? formData.style.filter(s => s !== style)
      : [...formData.style, style]
    setFormData({ ...formData, style: newStyles })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-2.5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">编辑衣服信息</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-0.5">品牌</label>
              <MultiSearchableSelect
                value={formData.brand}
                onChange={(value) => setFormData({ ...formData, brand: value })}
                options={config.brands}
                placeholder="品牌"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-0.5">款式/型号</label>
              <input
                type="text"
                value={formData.pattern || ''}
                onChange={(e) => setFormData({ ...formData, pattern: e.target.value })}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-0.5">尺码</label>
              <SearchableSelect
                value={formData.size}
                onChange={(value) => setFormData({ ...formData, size: value })}
                options={config.size}
                placeholder="尺码"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-0.5">类别</label>
              <MultiSearchableSelect
                value={formData.category}
                onChange={(value) => setFormData({ ...formData, category: value })}
                options={config.categories}
                placeholder="类别"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-0.5">材质</label>
              <SearchableSelect
                value={formData.material}
                onChange={(value) => setFormData({ ...formData, material: value })}
                options={config.materials}
                placeholder="材质"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-0.5">场景</label>
              <SearchableSelect
                value={formData.scene}
                onChange={(value) => setFormData({ ...formData, scene: value })}
                options={config.scenes}
                placeholder="场景"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-0.5">时间</label>
              <input
                type="date"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-0.5">地点</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-0.5">颜色</label>
              <input
                type="text"
                value={formData.color || ''}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-0.5">价格</label>
              <input
                type="number"
                value={formData.price || ''}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-0.5">满意度</label>
              <StarRating
                value={formData.satisfaction}
                onChange={(value) => setFormData({ ...formData, satisfaction: value })}
              />
            </div>
          </div>

          <div className="mt-3">
            <label className="block text-xs font-medium text-gray-700 mb-1">风格</label>
            <div className="flex flex-wrap gap-1.5">
              {config.styles.map(style => (
                <button
                  key={style}
                  type="button"
                  onClick={() => handleStyleChange(style)}
                  className={`px-2.5 py-0.5 rounded-full text-xs transition-colors ${
                    formData.style.includes(style)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          {formData.images.length > 1 && (
            <div className="mt-3">
              <label className="block text-xs font-medium text-gray-700 mb-1">选择主图</label>
              <div className="grid grid-cols-6 gap-1.5">
                {formData.images.map((image, index) => (
                  <div
                    key={index}
                    onClick={() => setFormData({ ...formData, primaryImageIndex: index })}
                    className={`relative cursor-pointer rounded overflow-hidden border-2 transition-all ${
                      (formData.primaryImageIndex || 0) === index
                        ? 'border-blue-600 ring-1 ring-blue-600'
                        : 'border-gray-200 hover:border-blue-400'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${index + 1}`}
                      className="w-full h-16 object-cover"
                    />
                    {(formData.primaryImageIndex || 0) === index && (
                      <div className="absolute top-0.5 right-0.5 bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded">
                        主图
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-3">
            <label className="block text-xs font-medium text-gray-700 mb-0.5">备注</label>
            <textarea
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={2}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
