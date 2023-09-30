const { execSync } = require('child_process')
const { resolve } = require('path')
const { existsSync } = require('fs')

const distPath = resolve(__dirname, '../dist')

if (!existsSync(distPath)) {
  console.log('Building...')
  execSync('pnpm run build')
  process.exit(0)
}
