import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const DATA_FILE = path.join(__dirname, '../src/data/wardrobe.json')

console.log('\n╔════════════════════════════════════════╗')
console.log('║      修复重复 ID 工具 v1.0            ║')
console.log('╚════════════════════════════════════════╝\n')

// 读取数据
let wardrobeData = { items: [] }
if (fs.existsSync(DATA_FILE)) {
  const content = fs.readFileSync(DATA_FILE, 'utf-8')
  if (content.trim() !== "") {
    wardrobeData = JSON.parse(content)
  }
}

console.log(`📊 总共有 ${wardrobeData.items.length} 个项目`)

// 检查重复 ID
const idMap = new Map()
const duplicates = []

wardrobeData.items.forEach((item, index) => {
  if (idMap.has(item.id)) {
    duplicates.push({ index, id: item.id, original: idMap.get(item.id) })
  } else {
    idMap.set(item.id, index)
  }
})

if (duplicates.length === 0) {
  console.log('✅ 没有发现重复的 ID\n')
  process.exit(0)
}

console.log(`⚠️  发现 ${duplicates.length} 个重复的 ID\n`)

// 生成唯一 ID
function generateUniqueId(existingIds) {
  let id
  do {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 9)
    id = `${timestamp}-${random}`
  } while (existingIds.has(id))
  return id
}

// 修复重复的 ID
const existingIds = new Set(wardrobeData.items.map(item => item.id))
let fixedCount = 0

duplicates.forEach(({ index, id }) => {
  const oldId = wardrobeData.items[index].id
  const newId = generateUniqueId(existingIds)

  console.log(`🔧 修复项目 #${index}`)
  console.log(`   旧 ID: ${oldId}`)
  console.log(`   新 ID: ${newId}`)
  console.log(`   图片: ${wardrobeData.items[index].images[0]}\n`)

  wardrobeData.items[index].id = newId
  existingIds.add(newId)
  fixedCount++
})

// 保存修复后的数据
fs.writeFileSync(DATA_FILE, JSON.stringify(wardrobeData, null, 2), 'utf-8')

console.log('╔════════════════════════════════════════╗')
console.log('║            修复完成                    ║')
console.log('╚════════════════════════════════════════╝')
console.log(`✅ 成功修复 ${fixedCount} 个重复的 ID`)
console.log(`📁 已保存到: ${DATA_FILE}\n`)
