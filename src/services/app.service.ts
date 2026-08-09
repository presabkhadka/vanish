import fs from "node:fs/promises"
import path from "node:path"
import { redis } from "../database/redis.database.ts"
import { randomUUID } from "node:crypto"

interface mime {
  originalFilename: string,
  storedFilename: string,
  mimeType: string,
  size: number,
  path: string,
  createdAt: number,
  expiresAt: number
}

export const saveAndShareFile = async (file: File) => {
  const TTL = 60 * 60 * 1000
  const storedFilename = randomUUID() + path.extname(file.name)
  const uploadPath = path.join('storage', storedFilename)
  await fs.writeFile(uploadPath, Buffer.from(await file.arrayBuffer()))

  const fileDetails: mime = {
    originalFilename: file.name,
    storedFilename,
    mimeType: file.type,
    size: file.size,
    path: uploadPath,
    createdAt: Date.now(),
    expiresAt: Date.now() + TTL
  }

  const uuid = randomUUID()

  await redis.set(`file:${uuid}`, JSON.stringify(fileDetails), { expiration: { type: "EX", value: TTL } })

  return {
    cacheKey: `file:${uuid}`
  }
}

export const downloaadFile = async (fileKeys: string) => {
  if (!fileKeys) throw new Error('Filekey is required')

  const value = await redis.get(fileKeys)

  if (!value) throw new Error('Invalid cache key')

  const parsedValue: mime = JSON.parse(value)

  const filePath = path.join("storage", parsedValue.storedFilename)
  try {
    return await fs.readFile(filePath)
  } catch {
    throw new Error("Stored file no longer exists")
  }
}
