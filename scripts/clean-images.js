import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const IMAGES_DIR = path.join(__dirname, '../public/images')
const DATA_FILE = path.join(__dirname, '../src/data/wardrobe.json')

console.log('🧹 Starting cleanup...\n')

// 读取现有数据
if (!fs.existsSync(DATA_FILE)) {
  console.error('❌ wardrobe.json not found!')
  process.exit(1)
}

const content = fs.readFileSync(DATA_FILE, 'utf-8')
let wardrobeData = JSON.parse(content)

// 1. 删除 isDelete=1 的项
const itemsToDelete = wardrobeData.items.filter(item => item.isDelete === 1)
if (itemsToDelete.length > 0) {
  console.log(`📋 Found ${itemsToDelete.length} items marked for deletion`)

  let deletedImagesCount = 0
  itemsToDelete.forEach(item => {
    item.images.forEach(imagePath => {
      if (imagePath.startsWith('/images/')) {
        const fullPath = path.join(IMAGES_DIR, path.basename(imagePath))
        if (fs.existsSync(fullPath)) {
          try {
            fs.unlinkSync(fullPath)
            console.log(`  🗑️  Deleted: ${imagePath}`)
            deletedImagesCount++
          } catch (err) {
            console.error(`  ❌ Failed to delete ${imagePath}:`, err.message)
          }
        }
      }
    })
  })

  wardrobeData.items = wardrobeData.items.filter(item => item.isDelete !== 1)
  console.log(`✅ Deleted ${deletedImagesCount} images and ${itemsToDelete.length} items from JSON\n`)
} else {
  console.log('✓ No items marked for deletion\n')
}

// 2. 收集所有在 JSON 中使用的图片
const usedImages = new Set()
wardrobeData.items.forEach(item => {
  item.images.forEach(imagePath => {
    if (imagePath.startsWith('/images/')) {
      usedImages.add(path.basename(imagePath))
    }
  })
})

console.log(`📊 Found ${usedImages.size} images in use`)

// 3. 扫描 public/images 目录，删除未使用的图片
if (!fs.existsSync(IMAGES_DIR)) {
  console.log('✓ Images directory does not exist, nothing to clean')
} else {
  const allImageFiles = fs.readdirSync(IMAGES_DIR)
  const unusedImages = allImageFiles.filter(file => {
    // 跳过 .DS_Store 等隐藏文件
    if (file.startsWith('.')) return false
    return !usedImages.has(file)
  })

  if (unusedImages.length > 0) {
    console.log(`\n📋 Found ${unusedImages.length} unused images:`)
    let deletedCount = 0

    unusedImages.forEach(file => {
      const fullPath = path.join(IMAGES_DIR, file)
      try {
        fs.unlinkSync(fullPath)
        console.log(`  🗑️  Deleted: ${file}`)
        deletedCount++
      } catch (err) {
        console.error(`  ❌ Failed to delete ${file}:`, err.message)
      }
    })

    console.log(`\n✅ Deleted ${deletedCount} unused images`)
  } else {
    console.log('\n✓ No unused images found')
  }
}

// 保存更新后的 JSON
fs.writeFileSync(DATA_FILE, JSON.stringify(wardrobeData, null, 2), 'utf-8')
console.log('\n✅ Cleanup completed!')
console.log(`📊 Final count: ${wardrobeData.items.length} items in wardrobe.json`)
