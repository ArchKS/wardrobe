import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const IMAGES_DIR = path.join(__dirname, '../public/images')
const DATA_FILE = path.join(__dirname, '../src/data/wardrobe.json')

// 读取数据
let wardrobeData = { items: [] }
if (fs.existsSync(DATA_FILE)) {
  const content = fs.readFileSync(DATA_FILE, 'utf-8')
  if (content.trim() !== "") {
    wardrobeData = JSON.parse(content)
  }
}

console.log(`Found ${wardrobeData.items.length} items to process\n`)
console.log('========================================\n')

// 清理文件名中的非法字符
function sanitizeFilename(str) {
  return str
    .replace(/[\/\\:*?"<>|]/g, '') // 移除非法字符
    .replace(/\s+/g, '') // 移除空格
    .trim()
}

// 格式化日期为 YYYYMMDD
function formatDate(dateStr) {
  return dateStr.replace(/-/g, '')
}

let renamedCount = 0
let skippedCount = 0
let errorCount = 0

// 处理每个条目
wardrobeData.items.forEach((item, index) => {
  // 跳过已删除的项
  if (item.isDelete === 1) {
    return
  }

  // 如果没有图片，跳过
  if (!item.images || item.images.length === 0) {
    return
  }

  // 准备基础文件名组成部分
  const brand = sanitizeFilename((item.brand && item.brand.length > 0 ? item.brand[0] : 'Unknown'))
  const pattern = sanitizeFilename(item.pattern || 'NoPattern')
  const date = formatDate(item.time || '00000000')

  const newImagePaths = []

  item.images.forEach((imagePath, imgIndex) => {
    try {
      // 获取原始文件路径和扩展名
      const oldPath = path.join(IMAGES_DIR, path.basename(imagePath))

      // 检查文件是否存在
      if (!fs.existsSync(oldPath)) {
        console.log(`⚠️  File not found: ${imagePath}`)
        errorCount++
        newImagePaths.push(imagePath) // 保留原路径
        return
      }

      const ext = path.extname(imagePath)

      // 生成新文件名
      const imageId = imgIndex + 1
      const newFilename = `${brand}_${pattern}_${date}_${imageId}${ext}`
      const newPath = path.join(IMAGES_DIR, newFilename)
      const newImagePath = `/images/${newFilename}`

      // 如果新旧路径相同，跳过
      if (oldPath === newPath) {
        console.log(`  ✓ Already named correctly: ${newFilename}`)
        newImagePaths.push(newImagePath)
        skippedCount++
        return
      }

      // 如果目标文件已存在，添加后缀避免冲突
      let finalPath = newPath
      let finalFilename = newFilename
      let suffix = 1
      while (fs.existsSync(finalPath)) {
        const nameWithoutExt = newFilename.replace(ext, '')
        finalFilename = `${nameWithoutExt}_${suffix}${ext}`
        finalPath = path.join(IMAGES_DIR, finalFilename)
        suffix++
      }

      // 重命名文件
      fs.renameSync(oldPath, finalPath)
      console.log(`  ✓ Renamed: ${path.basename(imagePath)} → ${finalFilename}`)

      newImagePaths.push(`/images/${finalFilename}`)
      renamedCount++
    } catch (err) {
      console.error(`  ✗ Error renaming ${imagePath}:`, err.message)
      newImagePaths.push(imagePath) // 保留原路径
      errorCount++
    }
  })

  // 更新条目中的图片路径
  item.images = newImagePaths
})

// 保存更新后的数据
fs.writeFileSync(DATA_FILE, JSON.stringify(wardrobeData, null, 2), 'utf-8')

console.log('\n========================================')
console.log('Rename complete!\n')
console.log(`📊 Statistics:`)
console.log(`  ✓ Renamed: ${renamedCount}`)
console.log(`  → Skipped (already correct): ${skippedCount}`)
if (errorCount > 0) {
  console.log(`  ✗ Errors: ${errorCount}`)
}
console.log('\n✅ Updated wardrobe.json with new paths')
console.log('========================================\n')
