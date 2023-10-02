/* eslint-disable */
import dotenv from 'dotenv'
import { LogLevelDesc } from 'loglevel'
import path from 'path'
import fs from 'fs'
if (process.env.NODE_ENV === 'test')
  dotenv.config({ path: path.resolve(__dirname, './../../.env.test') })
else if (fs.existsSync(path.resolve(__dirname, './../../.env.local')))
  dotenv.config({ path: path.resolve(__dirname, './../../.env.local') })
else dotenv.config({ path: path.resolve(__dirname, './../../.env') })

export const NODE_ENV = process.env.NODE_ENV
export const MONGO_URI = process.env.MONGO_URI
export const PORT = process.env.PORT
export const SECRET = process.env.SECRET
export const LOG_LEVEL = (process.env.LOG_LEVEL! || 'info') as LogLevelDesc
export const FOREX_API_KEY = process.env.FOREX_API_KEY
export const FOREX_API_ENDPOINT_LATEST =
  process.env.FOREX_API_ENDPOINT_LATEST ??
  'https://openexchangerates.org/api/latest.json'
export const DOMAIN = process.env.DOMAIN ?? 'localhost'
export const FORCE_HTTPS = process.env.FORCE_HTTPS === 'true'
export const URL = `http${FORCE_HTTPS ? 's' : ''}://${DOMAIN}:${PORT}`

import './console'
import './axios'
