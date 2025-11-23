import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import cliProgress from 'cli-progress'


const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 读取配置文件
const CONFIG_FILE = path.join(__dirname, '../src/data/config.json')
const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'))

const IMAGES_DIR = path.join(__dirname, '../public/images')
const DATA_FILE = path.join(__dirname, '../src/data/wardrobe.json')
const IMAGE_EXTENSIONS = ['.webp'] // 只处理 webp 格式的图片

console.log('\n╔════════════════════════════════════════╗')
console.log('║   衣橱图片同步工具 v1.0               ║')
console.log('╚════════════════════════════════════════╝')

// 确保目录存在
if (!fs.existsSync(IMAGES_DIR)) {
  fs.mkdirSync(IMAGES_DIR, { recursive: true })
  console.log('Created images directory:', IMAGES_DIR)
}

// 读取现有数据
let wardrobeData = { items: [] }
if (fs.existsSync(DATA_FILE)) {
  const content = fs.readFileSync(DATA_FILE, 'utf-8')
  if (content.trim() != "") {
    wardrobeData = JSON.parse(content)
  }
}

// 处理标记删除的项
const itemsToDelete = wardrobeData.items.filter(item => item.isDelete === 1)
if (itemsToDelete.length > 0) {
  console.log(`\n🗑️  处理 ${itemsToDelete.length} 个标记删除的项...`)

  const deleteBar = new cliProgress.SingleBar({
    format: '删除进度 |{bar}| {percentage}% | {value}/{total} 项',
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    hideCursor: true
  })

  deleteBar.start(itemsToDelete.length, 0)

  let deletedImagesCount = 0
  itemsToDelete.forEach((item, index) => {
    // 删除该项的所有图片文件
    item.images.forEach(imagePath => {
      // 只删除本地文件（以 /images/ 开头的）
      if (imagePath.startsWith('/images/')) {
        const fullPath = path.join(IMAGES_DIR, path.basename(imagePath))
        if (fs.existsSync(fullPath)) {
          try {
            fs.unlinkSync(fullPath)
            deletedImagesCount++
          } catch (err) {
            console.error(`\n❌ Failed to delete ${imagePath}:`, err.message)
          }
        }
      }
    })
    deleteBar.update(index + 1)
  })

  deleteBar.stop()

  // 从数据中移除标记删除的项
  wardrobeData.items = wardrobeData.items.filter(item => item.isDelete !== 1)

  // 保存更新后的数据
  fs.writeFileSync(DATA_FILE, JSON.stringify(wardrobeData, null, 2), 'utf-8')

  console.log(`✅ 已删除 ${deletedImagesCount} 个图片文件和 ${itemsToDelete.length} 个数据项\n`)
}

// 获取所有已存在的图片路径
const existingImages = new Set()
wardrobeData.items.forEach(item => {
  item.images.forEach(img => {
    existingImages.add(img)
  })
})

// 扫描图片目录
const imageFiles = fs.readdirSync(IMAGES_DIR)
  .filter(file => {
    const ext = path.extname(file).toLowerCase()
    return IMAGE_EXTENSIONS.includes(ext)
  })
  .sort()

console.log(`\n📁 扫描图片目录...`)
console.log(`   找到 ${imageFiles.length} 张图片`)

// 找出新图片
const newImages = []
imageFiles.forEach(file => {
  const imagePath = `/images/${file}`
  if (!existingImages.has(imagePath)) {
    newImages.push(imagePath)
  }
})

console.log(`   已记录 ${existingImages.size} 张图片`)
console.log(`   新增图片 ${newImages.length} 张`)

if (newImages.length === 0) {
  console.log('\n✅ 没有新图片需要添加')
}

// 从文件名中提取日期：name_id_yyyyMMdd.webp -> yyyy-MM-dd
function getDateFromFilename(filename) {
  // 匹配格式：xxx_xxx_20231115.webp
  const match = filename.match(/_(\d{8})\.webp$/);

  if (match && match[1]) {
    const dateStr = match[1];
    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);

    // 验证日期是否有效
    const date = new Date(`${year}-${month}-${day}`);
    if (!isNaN(date.getTime())) {
      return `${year}-${month}-${day}`;
    }
  }

  // 如果无法从文件名提取，使用文件系统时间
  console.log(`  ⚠️  无法从文件名提取日期: ${filename}，使用文件系统时间`);
  return null;
}


// 为新图片创建条目
let newItemsCount = 0
if (newImages.length > 0) {
  console.log(`\n📸 处理 ${newImages.length} 张新图片...`)

  const addBar = new cliProgress.SingleBar({
    format: '添加进度 |{bar}| {percentage}% | {value}/{total} 张 | {filename}',
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    hideCursor: true
  })

  addBar.start(newImages.length, 0, { filename: '' })

  for (let i = 0; i < newImages.length; i++) {
    const imagePath = newImages[i]
    const filename = path.basename(imagePath)

    addBar.update(i, { filename: filename.substring(0, 30) })

    // 从文件名中提取日期
    const dateFromFilename = getDateFromFilename(filename)

    // 如果无法从文件名提取日期，使用文件系统时间作为后备
    let itemDate = dateFromFilename
    if (!itemDate) {
      const fullImagePath = path.join(IMAGES_DIR, filename)
      const stats = fs.statSync(fullImagePath)
      const createTime = stats.birthtime || stats.ctime || stats.mtime
      itemDate = createTime.toISOString().split('T')[0]
    }

    // 生成唯一 ID
    const timestamp = Date.now()
    const random = Math.floor(Math.random() * 1000)
    const id = `${timestamp}-${random}`

    // 创建新条目
    const newItem = {
      id: id,
      images: [imagePath],
      time: itemDate, // 从文件名提取的日期
      location: '',
      brand: [], // 品牌（数组）
      pattern: '', // 款式/型号
      part: '', // 默认第一个部位
      category: [], // 类别（数组）
      style: [''],
      material: '', // 默认第一个材质
      satisfaction: 3, // 默认中等满意度
      scene: '试衣', // 默认场景
      color: '',
      tags: [''],
      notes: `自动从图片文件夹添加: ${filename}`
    }

    wardrobeData.items.push(newItem)
    newItemsCount++

    addBar.update(i + 1, { filename: filename.substring(0, 30) })
  }

  addBar.stop()

  // 保存更新后的数据
  fs.writeFileSync(DATA_FILE, JSON.stringify(wardrobeData, null, 2), 'utf-8')

  console.log(`\n✅ 成功添加 ${newItemsCount} 个新项目到 wardrobe.json`)
  console.log(`📝 请在应用中更新这些新项目的详细信息`)
}
