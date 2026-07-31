import fs from "node:fs/promises"
import path from "node:path"

const saveFile = async (file: File) => {
  const uploadPath = path.join('storage', file.name)
  await fs.writeFile(uploadPath, Buffer.from(await file.arrayBuffer()), 'utf-8')
}

export const shareFile = async (file: File) => {
  saveFile(file)
}
