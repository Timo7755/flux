import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { join, extname } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  c as createStartHandler,
  d as defaultStreamHandler,
  createServerEntry,
} from './dist/server/server.js'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const clientDir = join(__dirname, 'dist/client')

const mimeTypes = {
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
}

const fetchHandler = createStartHandler(defaultStreamHandler)
const server = createServerEntry({ fetch: fetchHandler })

const port = process.env.PORT || 3009

createServer(async (req, res) => {
  const filePath = join(clientDir, req.url.split('?')[0])
  try {
    const s = await stat(filePath)
    if (s.isFile()) {
      const ext = extname(filePath)
      const content = await readFile(filePath)
      res.writeHead(200, {
        'Content-Type': mimeTypes[ext] ?? 'application/octet-stream',
      })
      res.end(content)
      return
    }
  } catch {}

  const url = `http://${req.headers.host}${req.url}`
  const body = await new Promise((resolve) => {
    const chunks = []
    req.on('data', (chunk) => chunks.push(chunk))
    req.on('end', () => resolve(Buffer.concat(chunks)))
  })

  const request = new Request(url, {
    method: req.method,
    headers: req.headers,
    body: ['GET', 'HEAD'].includes(req.method) ? undefined : body,
  })

  const response = await server.fetch(request)

  res.writeHead(response.status, Object.fromEntries(response.headers))

  if (!response.body) {
    res.end()
    return
  }

  const reader = response.body.getReader()
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    res.write(value)
  }
  res.end()
}).listen(port, () => {
  console.log(`Flux running on port ${port}`)
})
