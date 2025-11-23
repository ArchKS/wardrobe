import { ViewMode } from '../types'
import { Grid, Calendar, BarChart3, Download, Tag, MapPin, Sparkles, Shirt, Package } from 'lucide-react'

interface HeaderProps {
  viewMode: ViewMode
  setViewMode: (mode: ViewMode) => void
  showAnalytics: boolean
  setShowAnalytics: (show: boolean) => void
  onExport: () => void
}

export default function Header({ viewMode, setViewMode, showAnalytics, setShowAnalytics, onExport }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">穿搭数据库</h1>

          <div className="flex items-center gap-4">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setShowAnalytics(false)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  !showAnalytics ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowAnalytics(true)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  showAnalytics ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
              </button>
            </div>

            {!showAnalytics && (
              <div className="flex bg-gray-100 rounded-lg p-1 gap-0.5">
                {/* <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'grid' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                  }`}
                  title="网格"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button> */}
                <button
                  onClick={() => setViewMode('timeline')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'timeline' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                  }`}
                  title="时间线"
                >
                  <Calendar className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('category')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'category' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                  }`}
                  title="类别"
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('brand')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'brand' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                  }`}
                  title="品牌"
                >
                  <Tag className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('part')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'part' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                  }`}
                  title="尺码"
                >
                  <Shirt className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('material')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'material' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                  }`}
                  title="材质"
                >
                  <Package className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('style')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'style' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                  }`}
                  title="风格"
                >
                  <Sparkles className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('location')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'location' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                  }`}
                  title="地点"
                >
                  <MapPin className="w-4 h-4" />
                </button>
              </div>
            )}

            <button
              onClick={onExport}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              导出数据
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
