#!/usr/bin/env node

/**
 * 批量添加字段到 wardrobe.json
 *
 * 使用方法:
 *   node scripts/add-field.js fieldName=value
 *
 * 示例:
 *   node scripts/add-field.js isPurchased=true
 *   node scripts/add-field.js discount=0.8
 *   node scripts/add-field.js note="需要补货"
 */

const fs = require('fs')
const path = require('path')

// 解析命令行参数
function parseArgument(arg) {
  const match = arg.match(/^([^=]+)=(.+)$/)
  if (!match) {
    throw new Error('参数格式错误！应该使用格式: fieldName=value')
  }

  const [, fieldName, rawValue] = match

  // 自动类型转换
  let value = rawValue

  // 布尔值
  if (rawValue === 'true') {
    value = true
  } else if (rawValue === 'false') {
    value = false
  }
  // null
  else if (rawValue === 'null') {
    value = null
  }
  // 数字
  else if (/^-?\d+(\.\d+)?$/.test(rawValue)) {
    value = Number(rawValue)
  }
  // 去掉字符串两端的引号
  else if ((rawValue.startsWith('"') && rawValue.endsWith('"')) ||
           (rawValue.startsWith("'") && rawValue.endsWith("'"))) {
    value = rawValue.slice(1, -1)
  }

  return { fieldName, value }
}

function main() {
  console.log('╔════════════════════════════════════════╗')
  console.log('║   批量添加字段工具 v1.0               ║')
  console.log('╚════════════════════════════════════════╝\n')

  // 检查参数
  if (process.argv.length < 3) {
    console.error('❌ 错误：缺少参数')
    console.log('\n使用方法:')
    console.log('  node scripts/add-field.js fieldName=value')
    console.log('\n示例:')
    console.log('  node scripts/add-field.js isPurchased=true')
    console.log('  node scripts/add-field.js discount=0.8')
    console.log('  node scripts/add-field.js note="需要补货"')
    process.exit(1)
  }

  try {
    // 解析参数
    const { fieldName, value } = parseArgument(process.argv[2])

    console.log(`📝 要添加的字段: ${fieldName}`)
    console.log(`📊 字段值: ${JSON.stringify(value)} (类型: ${typeof value})\n`)

    // 读取 wardrobe.json
    const wardrobeFile = path.join(__dirname, '../src/data/wardrobe.json')
    const rawData = fs.readFileSync(wardrobeFile, 'utf8')
    const data = JSON.parse(rawData)

    if (!data.items || !Array.isArray(data.items)) {
      throw new Error('wardrobe.json 格式错误：缺少 items 数组')
    }

    console.log(`📦 总共 ${data.items.length} 个项目`)

    // 检查是否有项目已经有该字段
    const existingCount = data.items.filter(item => fieldName in item).length
    if (existingCount > 0) {
      console.log(`⚠️  警告：${existingCount} 个项目已经有 ${fieldName} 字段，将被覆盖\n`)
    }

    // 添加字段
    let updatedCount = 0
    data.items.forEach(item => {
      item[fieldName] = value
      updatedCount++
    })

    // 写回文件
    fs.writeFileSync(wardrobeFile, JSON.stringify(data, null, 2), 'utf8')

    console.log(`✅ 成功！已为 ${updatedCount} 个项目添加字段 ${fieldName}`)
    console.log(`💾 文件已保存: ${wardrobeFile}\n`)

  } catch (error) {
    console.error(`\n❌ 错误: ${error.message}\n`)
    process.exit(1)
  }
}

main()
