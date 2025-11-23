import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import exifr from 'exifr'
import cliProgress from 'cli-progress'


const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 读取配置文件
const CONFIG_FILE = path.join(__dirname, '../src/data/config.json')
const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'))

const IMAGES_DIR = path.join(__dirname, '../public/images')
const DATA_FILE = path.join(__dirname, '../src/data/wardrobe.json')
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif', '.heic']

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

// 转换 HEIC 文件为 JPEG
const convertHeicToJpeg = async (heicPath) => {
  // const ext = path.extname(heicPath).toLowerCase()
  // if (ext !== '.heic' && ext !== '.heif') {
  //   return heicPath // 不是 HEIC 文件，直接返回
  // }
  return heicPath // 不是 HEIC 文件，直接返回

  // try {
  //   const basename = path.basename(heicPath, ext)
  //   const jpegPath = `/images/${basename}.jpg`
  //   const fullHeicPath = path.join(IMAGES_DIR, path.basename(heicPath))
  //   const fullJpegPath = path.join(IMAGES_DIR, `${basename}.jpg`)

  //   console.log(`  🔄 Converting HEIC to JPEG: ${heicPath} -> ${jpegPath}`)

  //   await sharp(fullHeicPath)
  //     .rotate() // 自动根据EXIF方向信息旋转图片
  //     .jpeg({ quality: 90 })
  //     .toFile(fullJpegPath)

  //   console.log(`  ✅ Converted successfully`)

  //   // 删除原始 HEIC 文件
  //   fs.unlinkSync(fullHeicPath)
  //   console.log(`  🗑️  Deleted original HEIC file`)

  //   return jpegPath
  // } catch (err) {
  //   console.error(`  ❌ Failed to convert ${heicPath}:`, err.message)
  //   return heicPath // 转换失败，返回原始路径
  // }
}


async function getImageContentCreateTime(filePath) {
  try {
    // console.log(`\n========== 图片信息: ${path.basename(filePath)} ==========`);

    // 方法1: 使用 macOS mdls 命令获取内容创建时间
    if (process.platform === 'darwin') {
      // console.log('\n🍎 使用 macOS mdls 命令获取元数据...');
      try {
        const { execSync } = await import('child_process');
        const mdlsOutput = execSync(`mdls -name kMDItemContentCreationDate "${filePath}"`, { encoding: 'utf-8' });
        // console.log('mdls 输出:', mdlsOutput);

        // 解析输出: kMDItemContentCreationDate = 2025-11-01 14:15:00 +0000
        const match = mdlsOutput.match(/kMDItemContentCreationDate\s*=\s*(.+)/);
        if (match && match[1] && match[1].trim() !== '(null)') {
          const dateStr = match[1].trim();
          // console.log(`  ✅ 从 mdls 获取到内容创建时间: ${dateStr}`);
          const date = new Date(dateStr);
          if (!isNaN(date.getTime())) {
            // 只返回年月日部分
            return date.toISOString().split('T')[0];
          }
        }
      } catch (mdlsErr) {
        console.log('  ⚠️  mdls 命令执行失败:', mdlsErr.message);
      }
    }

    // 方法2: 使用 exifr 解析 EXIF 数据
    console.log('\n📋 尝试使用 exifr 解析 EXIF 数据...');
    const meta = await exifr.parse(filePath);

    if (meta) {
      console.log('EXIF 数据:');
      console.log(JSON.stringify(meta, null, 2));

      // 列出所有可能的日期字段
      console.log('\n📅 日期相关字段:');
      const allKeys = Object.keys(meta);
      const dateRelatedKeys = allKeys.filter(key =>
        key.toLowerCase().includes('date') ||
        key.toLowerCase().includes('time') ||
        key.toLowerCase().includes('created')
      );

      if (dateRelatedKeys.length > 0) {
        dateRelatedKeys.forEach(key => {
          console.log(`  ${key}: ${meta[key]}`);
        });
      }

      // 优先级：DateTimeOriginal (拍摄时间) > CreateDate > DateTime > ModifyDate
      const exifDate = meta?.DateTimeOriginal
                    || meta?.CreateDate
                    || meta?.DateTime
                    || meta?.ModifyDate
                    || meta?.DateCreated
                    || meta?.DateTimeDigitized;

      if (exifDate) {
        console.log(`  ✅ 使用 EXIF 拍摄时间: ${exifDate}`);
        // 只返回年月日部分
        return new Date(exifDate).toISOString().split('T')[0];
      }
    }

    console.log('===============================================\n');

    // 如果没有找到任何日期，使用文件系统创建时间作为后备
    console.log(`  ⚠️  未找到内容创建日期，使用文件系统时间`);
    const stats = fs.statSync(filePath);
    const createTime = stats.birthtime || stats.ctime || stats.mtime;
    console.log(`  📁 文件系统时间: ${createTime.toISOString()}`);
    // 只返回年月日部分
    return createTime.toISOString().split('T')[0];
  } catch (err) {
    console.error(`  ❌ 解析失败 ${filePath}:`, err.message);
    // 如果解析失败，使用文件系统创建时间
    const stats = fs.statSync(filePath);
    const createTime = stats.birthtime || stats.ctime || stats.mtime;
    // 只返回年月日部分
    return createTime.toISOString().split('T')[0];
  }
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
    const filename = path.basename(imagePath, path.extname(imagePath))

    addBar.update(i, { filename: filename.substring(0, 30) })

    // 如果是 HEIC 文件，先转换为 JPEG
    const finalImagePath = await convertHeicToJpeg(imagePath)
    // 生成唯一 ID
    const timestamp = Date.now()
    const random = Math.floor(Math.random() * 1000)
    const id = `${timestamp}-${random}`

    // 从文件名提取可能的信息
    const fullImagePath = path.join(IMAGES_DIR, path.basename(finalImagePath))
    const orgTime = await getImageContentCreateTime(fullImagePath)

    // 创建新条目
    const newItem = {
      id: id,
      images: [finalImagePath],
      time: orgTime, // 创建时间
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
