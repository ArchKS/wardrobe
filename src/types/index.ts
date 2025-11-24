export interface ClothingItem {
  id: string;
  images: string[];
  primaryImageIndex?: number; // 主图索引，默认 0
  time: string; // ISO date format
  location: string;
  brand: string[]; // 品牌（可多选）
  pattern: string; // 款式/型号
  size: string; // 尺码：S、M、L
  category: string[]; // 类别（可多选）
  style: string[]; // 运动、休闲、老钱风等
  material: string;
  satisfaction: number; // 1-5
  scene: string; // 场景：试衣、展示
  color?: string; // 主色调
  price?: number; // 价格
  tags?: string[]; // 其他自定义标签
  notes?: string; // 备注
  isDelete?: number; // 0 或 undefined = 正常，1 = 标记删除
}

export interface WardrobeData {
  items: ClothingItem[];
}

export type ViewMode = 'grid' | 'timeline' | 'category' | 'brand' | 'location' | 'style' | 'material' | 'size';

export interface FilterOptions {
  brands: string[];
  size: string[];
  categories: string[];
  styles: string[];
  materials: string[];
  scenes: string[];
  satisfactionMin: number;
  satisfactionMax: number;
  dateRange?: {
    start: string;
    end: string;
  };
}
