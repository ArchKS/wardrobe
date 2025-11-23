import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'
import sharp from 'sharp'
import cliProgress from 'cli-progress'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const IMAGES_DIR = path.join(__dirname, '../public/images')
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.heic', '.heif']
const MAX_SIZE_BYTES = 1 * 1024 * 1024 // 1MB

console.log('\n╔════════════════════════════════════════╗')
console.log('║   图片转换为 WebP 工具 v1.0          ║')
console.log('╚════════════════════════════════════════╝\n')

// 确保目录存在
if (!fs.existsSync(IMAGES_DIR)) {
  console.error('❌ 图片目录不存在:', IMAGES_DIR)
  process.exit(1)
}

// 获取图片的内容创建时间（使用 macOS mdls 命令）
function getImageContentCreateDate(filePath) {
  if (process.platform !== 'darwin') {
    // 非 macOS 系统，使用文件创建时间
    const stats = fs.statSync(filePath)
    return stats.birthtime || stats.ctime || stats.mtime
  }

  try {
    const mdlsOutput = execSync(`mdls -name kMDItemContentCreationDate "${filePath}"`, { encoding: 'utf-8' })
    const match = mdlsOutput.match(/kMDItemContentCreationDate\s*=\s*(.+)/)

    if (match && match[1] && match[1].trim() !== '(null)') {
      const dateStr = match[1].trim()
      return new Date(dateStr)
    }
  } catch (err) {
    // mdls 失败，使用文件创建时间
  }

  const stats = fs.statSync(filePath)
  return stats.birthtime || stats.ctime || stats.mtime
}

// 格式化日期为 yyyyMMdd
function formatDate(date) {
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  return `${year}${month}${day}`
}

// 生成唯一 ID
function generateId() {
  return Math.random().toString(36).substring(2, 8)
}

// 使用 sips 转换任何格式为 JPEG（备用方案）
function convertWithSips(inputPath) {
  const tempJpegPath = inputPath.replace(/\.[^.]+$/, '_temp.jpg')

  try {
    execSync(`sips -s format jpeg "${inputPath}" --out "${tempJpegPath}" -s formatOptions 90`, {
      stdio: 'pipe'
    })
    return tempJpegPath
  } catch (err) {
    throw new Error(`sips 转换失败: ${err.message}`)
  }
}

// 转换图片为 webp
async function convertToWebp(inputPath, outputPath, maxSizeBytes) {
  let actualInputPath = inputPath
  let tempFile = null
  let usedSipsFallback = false

  try {
    // 尝试直接用 Sharp 转换
    let quality = 90
    let buffer

    try {
      while (quality > 10) {
        buffer = await sharp(actualInputPath)
          .rotate() // 自动根据 EXIF 旋转
          .webp({ quality, effort: 6 })
          .toBuffer()

        if (buffer.length <= maxSizeBytes) {
          break
        }

        quality -= 10
      }

      // 如果还是太大，尝试缩小尺寸
      if (buffer.length > maxSizeBytes) {
        const metadata = await sharp(actualInputPath).metadata()
        let scale = Math.sqrt(maxSizeBytes / buffer.length)

        buffer = await sharp(actualInputPath)
          .rotate()
          .resize({
            width: Math.floor(metadata.width * scale),
            height: Math.floor(metadata.height * scale),
            fit: 'inside'
          })
          .webp({ quality: 80, effort: 6 })
          .toBuffer()
      }
    } catch (sharpError) {
      // Sharp 失败，尝试使用 sips 作为备用方案（仅限 macOS）
      if (process.platform === 'darwin') {
        console.log(`\n  ⚙️  Sharp 失败，尝试使用 sips 命令...`)
        tempFile = convertWithSips(inputPath)
        actualInputPath = tempFile
        usedSipsFallback = true

        // 使用 sips 转换后的 JPEG 再试一次
        quality = 90
        while (quality > 10) {
          buffer = await sharp(actualInputPath)
            .rotate()
            .webp({ quality, effort: 6 })
            .toBuffer()

          if (buffer.length <= maxSizeBytes) {
            break
          }

          quality -= 10
        }

        if (buffer.length > maxSizeBytes) {
          const metadata = await sharp(actualInputPath).metadata()
          let scale = Math.sqrt(maxSizeBytes / buffer.length)

          buffer = await sharp(actualInputPath)
            .rotate()
            .resize({
              width: Math.floor(metadata.width * scale),
              height: Math.floor(metadata.height * scale),
              fit: 'inside'
            })
            .webp({ quality: 80, effort: 6 })
            .toBuffer()
        }
      } else {
        throw sharpError
      }
    }

    await fs.promises.writeFile(outputPath, buffer)

    // 删除临时文件
    if (tempFile && fs.existsSync(tempFile)) {
      fs.unlinkSync(tempFile)
    }

    return { size: buffer.length, usedFallback: usedSipsFallback }
  } catch (err) {
    // 删除临时文件
    if (tempFile && fs.existsSync(tempFile)) {
      fs.unlinkSync(tempFile)
    }
    throw err
  }
}

// 扫描所有需要转换的图片
const imageFiles = fs.readdirSync(IMAGES_DIR)
  .filter(file => {
    const ext = path.extname(file).toLowerCase()
    // 排除已经是 webp 且符合命名规范的文件
    if (ext === '.webp' && /_\w+_\d{8}\.webp$/.test(file)) {
      return false
    }
    return IMAGE_EXTENSIONS.includes(ext)
  })

if (imageFiles.length === 0) {
  console.log('✅ 没有需要转换的图片\n')
  process.exit(0)
}

console.log(`📁 找到 ${imageFiles.length} 张图片需要转换\n`)

// 创建进度条
const progressBar = new cliProgress.SingleBar({
  format: '转换进度 |{bar}| {percentage}% | {value}/{total} 张 | {filename}',
  barCompleteChar: '\u2588',
  barIncompleteChar: '\u2591',
  hideCursor: true
})

progressBar.start(imageFiles.length, 0, { filename: '' })

let convertedCount = 0
let errorCount = 0
const errors = []

// 转换每张图片
for (let i = 0; i < imageFiles.length; i++) {
  const imageFile = imageFiles[i]
  const inputPath = path.join(IMAGES_DIR, imageFile)
  const basename = path.basename(imageFile, path.extname(imageFile))

  progressBar.update(i, { filename: basename.substring(0, 30) })

  try {
    // 获取内容创建日期
    const createDate = getImageContentCreateDate(inputPath)
    const dateStr = formatDate(createDate)

    // 生成唯一 ID
    const id = generateId()

    // 生成新文件名：basename_id_yyyyMMdd.webp
    const newFilename = `${basename}_${id}_${dateStr}.webp`
    const outputPath = path.join(IMAGES_DIR, newFilename)

    // 转换为 webp
    const result = await convertToWebp(inputPath, outputPath, MAX_SIZE_BYTES)

    // 只在转换成功后删除原文件
    if (fs.existsSync(outputPath)) {
      fs.unlinkSync(inputPath)
      convertedCount++

      // 如果使用了备用方案，记录下来
      if (result.usedFallback) {
        console.log(`  ✓ 使用 sips 成功恢复`)
      }
    } else {
      throw new Error('输出文件未生成')
    }
  } catch (err) {
    errorCount++
    const errorMsg = err.message || String(err)
    errors.push({ file: imageFile, error: errorMsg })

    // 对于损坏的 HEIC 文件，尝试保留原文件
    console.log(`\n⚠️  跳过: ${imageFile} (${errorMsg})`)
  }

  progressBar.update(i + 1, { filename: basename.substring(0, 30) })
}

progressBar.stop()

console.log('\n╔════════════════════════════════════════╗')
console.log('║            转换完成                    ║')
console.log('╚════════════════════════════════════════╝')
console.log(`✅ 成功转换: ${convertedCount} 张`)
if (errorCount > 0) {
  console.log(`❌ 失败: ${errorCount} 张`)
  console.log('\n失败的文件:')
  errors.forEach(({ file, error }) => {
    console.log(`  - ${file}`)
    console.log(`    错误: ${error}`)
  })

  console.log('\n💡 解决方案:')
  console.log('  1. 在 Mac 照片应用中重新导出这些文件（文件 → 导出）')
  console.log('  2. 使用在线工具转换（如 cloudconvert.com）')
  console.log('  3. 删除损坏的文件（如果不重要）')
  console.log('  4. 失败的文件已保留在原位，修复后可重新运行 npm run convert-webp')
}
console.log('')
