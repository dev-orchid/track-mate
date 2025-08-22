// utils/generateCompanyId.ts
import { customAlphabet } from 'nanoid'

const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 5)

export function generateCompanyId() {
  return `TM-${nanoid()}`
}