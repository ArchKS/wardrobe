import { useState, useEffect } from 'react'
import { ClothingItem } from '../types'
import { X, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react'
import config from '../data/config.json'
import SearchableSelect from './SearchableSelect'
import MultiSearchableSelect from './MultiSearchableSelect'
import StarRating from './StarRating'

interface EditModalProps {
  item: ClothingItem
  onClose: () => void
  onSave: (item: ClothingItem) => void
  onCreate: (item: ClothingItem) => void
}

export default function EditModal({ item, onClose, onSave, onCreate }: EditModalProps) {
  const [formData, setFormData] = useState(item)
  const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false)
  const [previewImageIndex, setPreviewImageIndex] = useState(0)

  // 禁止背景滚动
  useEffect(() => {
    // 保存原始的overflow值
    const originalOverflow = document.body.style.overflow
    // 禁止滚动
    document.body.style.overflow = 'hidden'

    // 清理函数：恢复滚动
    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [])

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

  const handleRemoveImage = (index: number, imagePath: string) => {
    // 从文件路径中提取文件名和日期
    const fileName = imagePath.split('/').pop() || ''
    const dateMatch = fileName.match(/(\d{8})/)
    let extractedDate = new Date().toISOString().split('T')[0]

    if (dateMatch) {
      const dateStr = dateMatch[1]
      const year = dateStr.substring(0, 4)
      const month = dateStr.substring(4, 6)
      const day = dateStr.substring(6, 8)
      extractedDate = `${year}-${month}-${day}`
    }

    // 生成新的ID
    const newId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // 创建新的空白项
    const newItem: ClothingItem = {
      id: newId,
      images: [imagePath],
      time: extractedDate,
      location: '',
      brand: [],
      pattern: '',
      size: '',
      category: [],
      style: [],
      material: '',
      satisfaction: 3,
      scene: '',
      notes: `从 ${formData.brand.join(', ')} 分离出来`
    }

    // 从当前项中移除图片
    const newImages = formData.images.filter((_, i) => i !== index)
    const newPrimaryIndex = formData.primaryImageIndex || 0

    if (newImages.length > 0) {
      // 更新当前项
      const updatedFormData = {
        ...formData,
        images: newImages,
        primaryImageIndex: newPrimaryIndex >= newImages.length ? 0 : newPrimaryIndex
      }
      setFormData(updatedFormData)
      onSave(updatedFormData)
    } else {
      // 如果没有图片了，标记为删除
      const updatedFormData = {
        ...formData,
        images: newImages,
        isDelete: 1
      }
      onSave(updatedFormData)
    }

    // 创建新项
    onCreate(newItem)
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

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-0.5">已购入</label>
              <label className="flex items-center h-[34px] px-3 py-1.5 cursor-pointer border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.isPurchased || false}
                  onChange={(e) => setFormData({ ...formData, isPurchased: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">已购入</span>
              </label>
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
              <label className="block text-xs font-medium text-gray-700 mb-1">选择主图（双击预览，点击删除按钮分离）</label>
              <div className="grid grid-cols-6 gap-1.5">
                {formData.images.map((image, index) => (
                  <div
                    key={index}
                    onClick={() => setFormData({ ...formData, primaryImageIndex: index })}
                    onDoubleClick={() => {
                      setPreviewImageIndex(index)
                      setIsImagePreviewOpen(true)
                    }}
                    className={`relative cursor-pointer rounded overflow-hidden border-2 transition-all group ${
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
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRemoveImage(index, image)
                        // if (window.confirm('确定要将此图片分离为新项目吗？')) {
                        // }
                      }}
                      className="absolute bottom-0.5 right-0.5 bg-red-600 hover:bg-red-700 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      title="分离图片"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
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

      {isImagePreviewOpen && (
        <div
          className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-4"
          onClick={() => setIsImagePreviewOpen(false)}
        >
          <button
            onClick={() => setIsImagePreviewOpen(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
          >
            <X className="w-8 h-8" />
          </button>

          <div className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center">
            <img
              src={formData.images[previewImageIndex]}
              alt={`预览 ${previewImageIndex + 1}`}
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />

            {formData.images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setPreviewImageIndex((prev) => (prev - 1 + formData.images.length) % formData.images.length)
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-colors"
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setPreviewImageIndex((prev) => (prev + 1) % formData.images.length)
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-colors"
                >
                  <ChevronRight className="w-8 h-8" />
                </button>

                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {formData.images.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full transition-all ${index === previewImageIndex ? 'bg-white w-8' : 'bg-white/50'}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
