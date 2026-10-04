import express from 'express'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const app = express()
const PORT = Number(process.env.PORT || 3001)

app.use(express.json({ limit: '64kb' }))

function cleanApiUrl(value) {
  const url = String(value || 'https://api.greenapi.com').trim().replace(/\/+$/, '')
  if (!/^https?:\/\//i.test(url)) throw new Error('Некорректный API URL')
  return url
}

function credentials(body) {
  const apiUrl = cleanApiUrl(body.apiUrl)
  const idInstance = String(body.idInstance || '').trim()
  const apiTokenInstance = String(body.apiTokenInstance || '').trim()
  if (!idInstance || !apiTokenInstance) throw new Error('Укажите idInstance и apiTokenInstance')
  return { apiUrl, idInstance, apiTokenInstance }
}

function endpoint(c, method) {
  return `${c.apiUrl}/waInstance${encodeURIComponent(c.idInstance)}/${method}/${encodeURIComponent(c.apiTokenInstance)}`
}

async function greenFetch(url, options = {}) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 70000)
  try {
    const response = await fetch(url, { ...options, signal: controller.signal })
    const raw = await response.text()
    let data
    try { data = raw ? JSON.parse(raw) : null } catch { data = { raw } }
    if (!response.ok) {
      const reason = data?.message || data?.reason || data?.error || raw || response.statusText
      const error = new Error(reason)
      error.status = response.status
      error.data = data
      throw error
    }
    return data
  } finally {
    clearTimeout(timer)
  }
}

app.post('/api/check-account', async (req, res) => {
  try {
    const c = credentials(req.body)
    const phoneNumber = String(req.body.phoneNumber || '').replace(/\D/g, '')
    if (!phoneNumber) return res.status(400).json({ message: 'Введите номер телефона в международном формате' })
    const data = await greenFetch(endpoint(c, 'checkAccount'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber: Number(phoneNumber) })
    })
    res.json(data)
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Ошибка GREEN-API' })
  }
})

app.post('/api/send-message', async (req, res) => {
  try {
    const c = credentials(req.body)
    const chatId = String(req.body.chatId || '').trim()
    const message = String(req.body.message || '')
    if (!chatId) return res.status(400).json({ message: 'Не указан chatId' })
    if (!message.trim()) return res.status(400).json({ message: 'Введите текст сообщения' })
    if (message.length > 4096) return res.status(400).json({ message: 'Telegram ограничивает текст сообщения 4096 символами' })
    const data = await greenFetch(endpoint(c, 'sendMessage'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chatId, message })
    })
    res.json(data)
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Ошибка отправки' })
  }
})

app.post('/api/receive', async (req, res) => {
  try {
    const c = credentials(req.body)
    const timeout = Math.min(60, Math.max(5, Number(req.body.receiveTimeout || 10)))
    const data = await greenFetch(`${endpoint(c, 'receiveNotification')}?receiveTimeout=${timeout}`)

    if (data?.receiptId && data?.body) {
      try {
        await greenFetch(`${endpoint(c, 'deleteNotification')}/${data.receiptId}`, { method: 'DELETE' })
      } catch (deleteError) {
        console.warn('DeleteNotification failed:', deleteError.message)
      }
    }
    res.json(data || null)
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Ошибка получения сообщений' })
  }
})

app.get('/api/health', (_req, res) => res.json({ ok: true }))

const dist = path.join(__dirname, 'dist')
app.use(express.static(dist))
app.use((_req, res) => res.sendFile(path.join(dist, 'index.html')))

app.listen(PORT, () => {
  console.log(`GREEN-API Telegram Chat server listening on http://localhost:${PORT}`)
})
