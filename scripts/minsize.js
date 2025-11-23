import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const IMAGES_DIR = path.join(__dirname, '../public/images')
const MAX_SIZE = 2 * 1024 * 1024 // 3MB in bytes
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp']

// 格式化文件大小
function formatSize(bytes) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i]
}

// 确保目录存在
if (!fs.existsSync(IMAGES_DIR)) {
  console.error('Error: Images directory does not exist:', IMAGES_DIR)
  process.exit(1)
}

// 扫描所有图片文件
const imageFiles = fs.readdirSync(IMAGES_DIR)
  .filter(file => {
    const ext = path.extname(file).toLowerCase()
    return IMAGE_EXTENSIONS.includes(ext)
  })

if (imageFiles.length === 0) {
  console.log('No images found in', IMAGES_DIR)
  process.exit(0)
}

console.log(`Found ${imageFiles.length} images in ${IMAGES_DIR}\n`)
console.log(`Target size: ${formatSize(MAX_SIZE)} or less\n`)
console.log('========================================\n')

let compressedCount = 0
let skippedCount = 0
let errorCount = 0
let totalSavedBytes = 0
let processedCount = 0

// 简单的进度条函数
function drawProgressBar(current, total, currentFile = '') {
  const percentage = Math.floor((current / total) * 100)
  const barLength = 30
  const filledLength = Math.floor((current / total) * barLength)
  const bar = '█'.repeat(filledLength) + '░'.repeat(barLength - filledLength)

  // 截断文件名，避免过长
  const displayFile = currentFile.length > 30 ? '...' + currentFile.slice(-27) : currentFile

  process.stdout.write(`\r[${bar}] ${percentage}% (${current}/${total}) ${displayFile}`.padEnd(100))

  if (current === total) {
    process.stdout.write('\n\n')
  }
}

// 压缩单个图片
async function compressImage(filePath, originalSize) {
  const ext = path.extname(filePath).toLowerCase()
  const tempPath = filePath + '.tmp'

  // 根据文件类型选择压缩策略
  let quality = 90
  let success = false

  while (quality >= 60 && !success) {
    try {
      const image = sharp(filePath)
        .rotate() // 自动根据EXIF方向信息旋转图片

      if (ext === '.png') {
        // PNG 使用压缩级别和调色板优化
        await image
          .png({
            quality: quality,
            compressionLevel: 9,
            palette: true
          })
          .toFile(tempPath)
      } else if (ext === '.webp') {
        // WebP 使用质量设置
        await image
          .webp({ quality: quality })
          .toFile(tempPath)
      } else {
        // JPEG 使用质量设置
        await image
          .jpeg({
            quality: quality,
            mozjpeg: true
          })
          .toFile(tempPath)
      }

      const newSize = fs.statSync(tempPath).size

      if (newSize <= MAX_SIZE || quality <= 60) {
        // 替换原文件
        fs.unlinkSync(filePath)
        fs.renameSync(tempPath, filePath)
        success = true
        return newSize
      } else {
        // 文件还是太大，降低质量重试
        fs.unlinkSync(tempPath)
        quality -= 5
      }
    } catch (err) {
      if (fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath)
      }
      throw err
    }
  }

  return null
}

// 处理每个图片
for (const imageFile of imageFiles) {
  processedCount++

  drawProgressBar(processedCount, imageFiles.length, imageFile)

  const imagePath = path.join(IMAGES_DIR, imageFile)
  const stats = fs.statSync(imagePath)
  const originalSize = stats.size

  if (originalSize <= MAX_SIZE) {
    skippedCount++
    continue
  }

  try {
    const newSize = await compressImage(imagePath, originalSize)

    if (newSize) {
      const savedBytes = originalSize - newSize
      totalSavedBytes += savedBytes
      compressedCount++
    } else {
      errorCount++
    }
  } catch (err) {
    errorCount++
  }
}

console.log('========================================')
console.log('Compression complete!\n')
console.log(`📊 Statistics:`)
console.log(`  ✅ Compressed: ${compressedCount}`)
console.log(`  ⏭️  Skipped (already small): ${skippedCount}`)
if (errorCount > 0) {
  console.log(`  ❌ Failed: ${errorCount}`)
}
if (totalSavedBytes > 0) {
  console.log(`\n💾 Total space saved: ${formatSize(totalSavedBytes)}`)
}
console.log('\n========================================\n')
