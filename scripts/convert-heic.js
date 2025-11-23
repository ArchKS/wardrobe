import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const IMAGES_DIR = path.join(__dirname, '../public/images')

// 确保目录存在
if (!fs.existsSync(IMAGES_DIR)) {
  console.error('Error: Images directory does not exist:', IMAGES_DIR)
  process.exit(1)
}

// 检查是否是macOS并且有sips命令
const isMacOS = process.platform === 'darwin'
let hasSips = false
let hasSetFile = false
if (isMacOS) {
  try {
    execSync('which sips', { stdio: 'ignore' })
    hasSips = true
  } catch (err) {
    // sips not found
  }

  try {
    execSync('which SetFile', { stdio: 'ignore' })
    hasSetFile = true
  } catch (err) {
    // SetFile not found
  }
}

// 扫描所有HEIC文件
const heicFiles = fs.readdirSync(IMAGES_DIR)
  .filter(file => {
    const ext = path.extname(file).toLowerCase()
    return ext === '.heic' || ext === '.heif'
  })

if (heicFiles.length === 0) {
  console.log('No HEIC files found in', IMAGES_DIR)
  process.exit(0)
}

console.log(`Found ${heicFiles.length} HEIC files to convert to JPEG:\n`)
if (hasSips) {
  console.log('Using macOS sips command for conversion (quality: 90)')
  if (hasSetFile) {
    console.log('SetFile available - will preserve creation date')
  } else {
    console.log('Note: SetFile not found - creation date may not be fully preserved')
    console.log('Install Xcode Command Line Tools for full timestamp preservation')
  }
  console.log('')
} else {
  console.log('Note: For best results on macOS, use the sips command')
  console.log('Falling back to basic conversion method\n')
}

let convertedCount = 0
let errorCount = 0
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

// 转换每个HEIC文件为JPEG
for (const heicFile of heicFiles) {
  processedCount++

  drawProgressBar(processedCount, heicFiles.length, heicFile)

  const heicPath = path.join(IMAGES_DIR, heicFile)
  const basename = path.basename(heicFile, path.extname(heicFile))
  const jpegPath = path.join(IMAGES_DIR, `${basename}.jpg`)

  try {
    // 读取原始文件的时间信息
    const originalStats = fs.statSync(heicPath)
    const originalBirthtime = originalStats.birthtime
    const originalMtime = originalStats.mtime

    if (hasSips) {
      // 使用 macOS 的 sips 命令转换为JPEG
      execSync(`sips -s format jpeg "${heicPath}" --out "${jpegPath}" -s formatOptions 90`, {
        stdio: 'pipe'
      })
    } else {
      errorCount++
      continue
    }

    // 格式化时间为不同命令需要的格式
    const formatTimeForTouch = (date) => {
      const year = date.getFullYear().toString()
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const day = date.getDate().toString().padStart(2, '0')
      const hours = date.getHours().toString().padStart(2, '0')
      const minutes = date.getMinutes().toString().padStart(2, '0')
      const seconds = date.getSeconds().toString().padStart(2, '0')
      return `${year}${month}${day}${hours}${minutes}.${seconds}`
    }

    const formatTimeForSetFile = (date) => {
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const day = date.getDate().toString().padStart(2, '0')
      const year = date.getFullYear().toString()
      const hours = date.getHours().toString().padStart(2, '0')
      const minutes = date.getMinutes().toString().padStart(2, '0')
      const seconds = date.getSeconds().toString().padStart(2, '0')
      return `${month}/${day}/${year} ${hours}:${minutes}:${seconds}`
    }

    // 使用 touch 命令设置修改时间
    const mtimeStr = formatTimeForTouch(originalMtime)
    execSync(`touch -mt ${mtimeStr} "${jpegPath}"`, { stdio: 'pipe' })

    // 如果有 SetFile，使用它来设置创建日期
    if (hasSetFile) {
      const birthtimeStr = formatTimeForSetFile(originalBirthtime)
      execSync(`SetFile -d "${birthtimeStr}" "${jpegPath}"`, { stdio: 'pipe' })
    }

    // 删除原始HEIC文件
    fs.unlinkSync(heicPath)

    convertedCount++
  } catch (err) {
    errorCount++
  }
}

console.log(`\n========================================`)
console.log(`Conversion complete!`)
console.log(`✅ Successfully converted: ${convertedCount}`)
if (errorCount > 0) {
  console.log(`❌ Failed: ${errorCount}`)
}
console.log(`========================================\n`)
