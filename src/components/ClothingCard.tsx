import { useState, useEffect } from 'react'
import { ClothingItem } from '../types'
import { ChevronLeft, ChevronRight, Star, Edit2, MapPin, Calendar, GripVertical, Trash2, X } from 'lucide-react'
import EditModal from './EditModal'
import LazyImage from './LazyImage'

interface ClothingCardProps {
  item: ClothingItem
  onUpdate: (item: ClothingItem) => void
  onMerge: (sourceId: string, targetId: string) => void
  onDelete: (id: string) => void
}

export default function ClothingCard({ item, onUpdate, onMerge, onDelete }: ClothingCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(item.primaryImageIndex || 0)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false)

  // 当主图索引改变时，更新当前显示的图片
  useEffect(() => {
    setCurrentImageIndex(item.primaryImageIndex || 0)
  }, [item.primaryImageIndex])

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentImageIndex((prev) => (prev + 1) % item.images.length)
  }

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentImageIndex((prev) => (prev - 1 + item.images.length) % item.images.length)
  }

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', item.id)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setIsDragOver(true)
  }

  const handleDragLeave = () => {
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    const sourceId = e.dataTransfer.getData('text/plain')
    if (sourceId && sourceId !== item.id) {
      // 确认合并
      onMerge(sourceId, item.id)
      // if (window.confirm('确定要合并这两个衣服的图片吗？源衣服将被删除。')) {
      // }
    }
  }

  const handleDelete = () => {
    if (window.confirm('确定要删除这件衣服吗？此操作无法撤销。')) {
      onDelete(item.id)
    }
  }

  return (
    <>
      <div
        draggable
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all cursor-move ${isDragOver ? 'ring-4 ring-blue-500 scale-105' : ''
          }`}
      >
        <div className="relative group">
          <div
            className="aspect-[3/4] bg-gray-200 cursor-pointer"
            onDoubleClick={() => setIsImagePreviewOpen(true)}
          >
            <LazyImage
              src={item.images[currentImageIndex]}
              alt={`${item.brand.join(', ')} ${item.category.join(', ')}`}
              className="w-full h-full object-cover"
            />
          </div>

          {item.images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                {item.images.map((_, index) => (
                  <div
                    key={index}
                    className={`w-1.5 h-1.5 rounded-full ${index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                      }`}
                  />
                ))}
              </div>
            </>
          )}

          <button
            onClick={() => setIsEditModalOpen(true)}
            className="absolute top-2 right-2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
          >
            <Edit2 className="w-4 h-4" />
          </button>

          <button
            onClick={handleDelete}
            className="absolute top-14 right-2 bg-red-500/80 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <div className="absolute top-2 left-2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
            <GripVertical className="w-4 h-4" />
          </div>

          {item.images.length > 1 && (
            <div className="absolute bottom-16 right-2 bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-semibold">
              {item.images.length} 张
            </div>
          )}
        </div>

        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{item.brand.join(', ') || '未知品牌'}</h3>
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${i < item.satisfaction ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                    }`}
                />
              ))}
            </div>
          </div>

          <p className="text-sm text-gray-600 mb-2">{item.category.join(', ') || '未分类'}</p>

          {
            item.style && item.style.filter(v=>v.trim()!="").length ? <div className="flex flex-wrap gap-1 mb-3">
              {item.style.map(style => (
                <span key={style} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                  {style}
                </span>
              ))}
            </div> : null
          }


          <div className="space-y-1 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{item.time}</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              <span>{item.location}</span>
            </div>
          </div>

          {item.price && (
            <p className="mt-2 text-sm font-semibold text-gray-900">¥{item.price}</p>
          )}
        </div>
      </div>

      {isEditModalOpen && (
        <EditModal
          item={item}
          onClose={() => setIsEditModalOpen(false)}
          onSave={(updatedItem) => {
            onUpdate(updatedItem)
            setIsEditModalOpen(false)
          }}
        />
      )}

      {isImagePreviewOpen && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
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
              src={item.images[currentImageIndex]}
              alt={`${item.brand.join(', ')} ${item.category.join(', ')}`}
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />

            {item.images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setCurrentImageIndex((prev) => (prev - 1 + item.images.length) % item.images.length)
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-colors"
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setCurrentImageIndex((prev) => (prev + 1) % item.images.length)
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-colors"
                >
                  <ChevronRight className="w-8 h-8" />
                </button>

                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {item.images.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full transition-all ${index === currentImageIndex ? 'bg-white w-8' : 'bg-white/50'
                        }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
