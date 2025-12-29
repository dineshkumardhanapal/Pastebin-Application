import { kv } from '@vercel/kv'

export { kv }

export function getPasteKey(id: string): string {
  return `paste:${id}`
}

