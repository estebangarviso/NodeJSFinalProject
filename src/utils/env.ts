import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'

const NODE_ENV = process.env.NODE_ENV || 'development'

let envFilePath = path.join(__dirname, '../../.env')

if (NODE_ENV === 'development')
  envFilePath = fs.existsSync(path.join(__dirname, '../../.env.local'))
    ? path.join(__dirname, '../../.env.local')
    : envFilePath
else if (NODE_ENV === 'test')
  envFilePath = fs.existsSync(path.join(__dirname, '../../.env.test'))
    ? path.join(__dirname, '../../.env.test')
    : envFilePath

dotenv.config({ path: envFilePath })
