import React, { useEffect, useMemo, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'

const STORAGE_KEY = 'green-api-telegram-settings-v1'

const initialSettings = {
  apiUrl: 'https://api.greenapi.com',
  idInstance: '',
  apiTokenInstance: ''
}

function Icon({ name, size = 20 }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }
  const paths = {
    settings: <><path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-1.8 1.8-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.56V20H12.5v-.1a1.7 1.7 0 0 0-1.03-1.56 1.7 1.7 0 0 0-1.88.34l-.06.06-1.8-1.8.06-.06A1.7 1.7 0 0 0 8.1 15a1.7 1.7 0 0 0-1.56-1.03H6v-2.55h.1A1.7 1.7 0 0 0 7.66 10a1.7 1.7 0 0 0-.34-1.88l-.06-.06 1.8-1.8.06.06A1.7 1.7 0 0 0 11 6.1a1.7 1.7 0 0 0 1.03-1.56V4h2.55v.1A1.7 1.7 0 0 0 15.6 5.66a1.7 1.7 0 0 0 1.88-.34l.06-.06 1.8 1.8-.06.06A1.7 1.7 0 0 0 18.94 9a1.7 1.7 0 0 0 1.56 1.03h.1v2.55h-.1A1.7 1.7 0 0 0 19.4 15Z"/></>,
    plus: <><path d="M12 5v14M5 12h14"/></>,
    search: <><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/></>,
    send: <><path d="m21 3-7.5 18-3.2-7.3L3 10.5 21 3Z"/><path d="M10.3 13.7 15 9"/></>,
    back: <><path d="m15 18-6-6 6-6"/></>,
    check: <><path d="m5 12 4 4L19 6"/></>,
    loader: <><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1"/></>,
    close: <><path d="M6 6l12 12M18 6 6 18"/></>,
    telegram: <><path d="M21.5 4.5 18 20c-.2.9-.8 1.1-1.5.7l-4.5-3.3-2.2 2.1c-.3.3-.5.5-1 .5l.3-4.6 8.4-7.6c.4-.3-.1-.5-.6-.2L6.5 14 2 12.6c-1-.3-1-1 .2-1.5L20 4.2c.8-.3 1.8.2 1.5.3Z"/></>
  }
  return <svg {...common}>{paths[name]}</svg>
}

function App() {
  const [settings, setSettings] = useState(() => {
    try { return { ...initialSettings, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') } } catch { return initialSettings }
  })
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [phone, setPhone] = useState('')
  const [chat, setChat] = useState(null)
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [loadingChat, setLoadingChat] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [connection, setConnection] = useState('idle')
  const [search, setSearch] = useState('')
  const inputRef = useRef(null)
  const pollActive = useRef(false)

  const isConfigured = Boolean(settings.idInstance && settings.apiTokenInstance)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  }, [settings])

  const apiBody = useMemo(() => ({ ...settings }), [settings])

  async function api(path, body) {
    const response = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(data.message || 'Ошибка запроса')
    return data
  }

  async function createChat(event) {
    event?.preventDefault()
    setError('')
    if (!isConfigured) {
      setSettingsOpen(true)
      setError('Сначала укажите idInstance и apiTokenInstance в настройках.')
      return
    }
    const cleanPhone = phone.replace(/\D/g, '')
    if (!cleanPhone || cleanPhone.length < 8) {
      setError('Введите номер телефона в международном формате, например 79991234567.')
      return
    }
    setLoadingChat(true)
    try {
      const data = await api('/api/check-account', { ...apiBody, phoneNumber: cleanPhone })
      if (!data.exist || !data.chatId) {
        throw new Error('Telegram-аккаунт не найден по этому номеру или номер скрыт настройками приватности.')
      }
      const name = data.username || cleanPhone
      setChat({ chatId: data.chatId, name: name.startsWith('@') ? name : name, phone: cleanPhone })
      setMessages([])
      setPhone('')
      setConnection('connected')
      setTimeout(() => inputRef.current?.focus(), 50)
    } catch (e) {
      setError(e.message)
      setConnection('error')
    } finally {
      setLoadingChat(false)
    }
  }

  async function sendMessage(event) {
    event?.preventDefault()
    if (!chat || !text.trim() || sending) return
    const messageText = text.trim()
    setText('')
    setSending(true)
    setError('')
    const optimistic = { id: `local-${Date.now()}`, text: messageText, outgoing: true, pending: true, timestamp: Date.now() }
    setMessages(prev => [...prev, optimistic])
    try {
      const data = await api('/api/send-message', { ...apiBody, chatId: chat.chatId, message: messageText })
      setMessages(prev => prev.map(m => m.id === optimistic.id ? { ...m, id: data.idMessage || m.id, pending: false } : m))
    } catch (e) {
      setMessages(prev => prev.map(m => m.id === optimistic.id ? { ...m, pending: false, failed: true } : m))
      setError(e.message)
    } finally {
      setSending(false)
      inputRef.current?.focus()
    }
  }

  useEffect(() => {
    if (!chat || !isConfigured) return undefined
    let cancelled = false

    async function poll() {
      if (cancelled || pollActive.current) return
      pollActive.current = true
      try {
        const data = await api('/api/receive', { ...apiBody, receiveTimeout: 10 })
        if (!cancelled && data?.body) handleNotification(data.body)
        setConnection('connected')
      } catch (e) {
        if (!cancelled) setConnection('error')
      } finally {
        pollActive.current = false
        if (!cancelled) setTimeout(poll, 250)
      }
    }
    poll()
    return () => { cancelled = true }
  }, [chat?.chatId, settings.idInstance, settings.apiTokenInstance, settings.apiUrl])

  function handleNotification(body) {
    if (body?.typeWebhook !== 'incomingMessageReceived') return
    const incomingChatId = body?.senderData?.chatId
    if (!incomingChatId || incomingChatId !== chat?.chatId) return
    const type = body?.messageData?.typeMessage
    if (type !== 'textMessage') return
    const incomingText = body?.messageData?.textMessageData?.textMessage
    if (!incomingText) return
    setMessages(prev => {
      if (prev.some(m => m.id === body.idMessage)) return prev
      return [...prev, {
        id: body.idMessage,
        text: incomingText,
        outgoing: false,
        timestamp: Number(body.timestamp || Date.now() / 1000) * 1000,
        senderName: body.senderData?.senderName || chat.name
      }]
    })
  }

  function saveSettings(event) {
    event.preventDefault()
    setError('')
    setSettingsOpen(false)
    setConnection('idle')
    if (chat) setChat(null)
  }

  function closeChat() {
    setChat(null)
    setMessages([])
    setError('')
    setConnection('idle')
  }

  const visibleMessages = messages.filter(m => !search.trim() || m.text.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-icon"><Icon name="telegram" size={22} /></div>
          <div>
            <div className="brand-name">Telegram Web</div>
            <div className="brand-subtitle">GREEN-API client</div>
          </div>
        </div>
        <button className="icon-button" onClick={() => setSettingsOpen(true)} aria-label="Настройки" title="Настройки">
          <Icon name="settings" />
        </button>
      </header>

      <main className="main">
        {!chat ? (
          <section className="start-card">
            <div className="start-mark"><Icon name="telegram" size={34} /></div>
            <h1>Новый чат</h1>
            <p className="muted">Введите номер телефона получателя, чтобы найти его Telegram-аккаунт.</p>
            <form onSubmit={createChat} className="chat-form">
              <label>Номер телефона</label>
              <div className="phone-row">
                <span className="prefix">+</span>
                <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="7 999 123-45-67" inputMode="tel" autoFocus />
                <button className="primary" type="submit" disabled={loadingChat}>
                  {loadingChat ? <Icon name="loader" size={18} /> : <Icon name="plus" size={18} />}
                  {loadingChat ? 'Поиск…' : 'Создать чат'}
                </button>
              </div>
              <div className="form-hint">Используется метод CheckAccount GREEN-API. Номер передаётся в международном формате.</div>
            </form>
            {error && <div className="error-banner">{error}</div>}
            <button className="settings-link" onClick={() => setSettingsOpen(true)}>
              <Icon name="settings" size={16} /> Настроить GREEN-API
              <span className={isConfigured ? 'status-dot ok' : 'status-dot'} />
            </button>
          </section>
        ) : (
          <section className="chat-window">
            <div className="chat-header">
              <button className="icon-button back" onClick={closeChat} aria-label="Назад"><Icon name="back" /></button>
              <div className="avatar">{(chat.name.replace('@','')[0] || 'T').toUpperCase()}</div>
              <div className="chat-title">
                <div className="chat-name">{chat.name}</div>
                <div className="chat-status"><span className={`status-dot ${connection === 'connected' ? 'ok' : connection === 'error' ? 'bad' : ''}`} /> {connection === 'connected' ? 'в сети' : connection === 'error' ? 'ошибка подключения' : 'подключение…'}</div>
              </div>
              <div className="header-search">
                <Icon name="search" size={18} />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Поиск" />
              </div>
            </div>

            <div className="messages">
              {visibleMessages.length === 0 ? (
                <div className="empty-chat">
                  <div className="empty-bubble"><Icon name="telegram" size={25} /></div>
                  <strong>Начните общение</strong>
                  <span>Отправьте первое сообщение этому контакту.</span>
                </div>
              ) : visibleMessages.map(message => (
                <div key={message.id} className={`message-row ${message.outgoing ? 'outgoing' : 'incoming'}`}>
                  <div className={`message-bubble ${message.failed ? 'failed' : ''}`}>
                    <div>{message.text}</div>
                    <div className="message-meta">
                      {new Date(message.timestamp || Date.now()).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                      {message.outgoing && <span className={message.failed ? 'failed-mark' : ''}>{message.pending ? ' · отправка' : message.failed ? ' · ошибка' : ' ✓'}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {error && <div className="inline-error">{error}<button onClick={() => setError('')}><Icon name="close" size={15} /></button></div>}
            <form className="composer" onSubmit={sendMessage}>
              <input ref={inputRef} value={text} onChange={e => setText(e.target.value)} placeholder="Написать сообщение…" maxLength={4096} />
              <button className="send-button" type="submit" disabled={!text.trim() || sending} aria-label="Отправить" title="Отправить">
                <Icon name="send" size={20} />
              </button>
            </form>
          </section>
        )}
      </main>

      <footer className="footer">React · GREEN-API · только текстовые сообщения</footer>

      {settingsOpen && (
        <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && setSettingsOpen(false)}>
          <div className="modal">
            <div className="modal-head">
              <div><h2>Настройки подключения</h2><p>Данные используются только для запросов из текущего интерфейса.</p></div>
              <button className="icon-button" onClick={() => setSettingsOpen(false)}><Icon name="close" /></button>
            </div>
            <form onSubmit={saveSettings}>
              <label>API URL</label>
              <input value={settings.apiUrl} onChange={e => setSettings(s => ({ ...s, apiUrl: e.target.value }))} placeholder="https://api.greenapi.com" />
              <label>idInstance</label>
              <input value={settings.idInstance} onChange={e => setSettings(s => ({ ...s, idInstance: e.target.value }))} placeholder="4100…" autoComplete="off" />
              <label>apiTokenInstance</label>
              <input type="password" value={settings.apiTokenInstance} onChange={e => setSettings(s => ({ ...s, apiTokenInstance: e.target.value }))} placeholder="Токен GREEN-API" autoComplete="off" />
              <div className="security-note">Токен не хранится в исходном коде и не попадает в репозиторий. Для production лучше вынести API-ключи на backend.</div>
              <button className="primary full" type="submit"><Icon name="check" size={18} /> Сохранить</button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

createRoot(document.getElementById('root')).render(<App />)
