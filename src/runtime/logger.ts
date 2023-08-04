import { defineEventHandler } from 'h3'
import { sendLog } from '../core/logger'

export default defineEventHandler((event) => {
  sendLog(event)
})
