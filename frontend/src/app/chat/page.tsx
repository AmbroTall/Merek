'use client'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

type Message = { role: 'user' | 'assistant'; content: string; id: string }

const DEMO_SENIORS = [
  { id: '11111111-1111-1111-1111-111111111111', name: 'Margaret Wilson' },
  { id: '22222222-2222-2222-2222-222222222222', name: 'Robert Thompson' },
]

const SIGNAL_LABELS: Record<string, string> = {
  sleep_issue: 'Schlafproblem',
  loneliness: 'Einsamkeit',
  pain: 'Schmerzen',
  medication_issue: 'Medikamentenproblem',
  anxiety: 'Angst',
}

export default function ChatPage() {
  const [selectedSenior, setSelectedSenior] = useState<{ id: string; name: string } | null>(null)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [ending, setEnding] = useState(false)
  const [summary, setSummary] = useState<any>(null)
  const [ended, setEnded] = useState(false)
  const [starting, setStarting] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [ttsEnabled, setTtsEnabled] = useState(true)
  const [sttAvailable, setSttAvailable] = useState(false)

  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const recognitionRef = useRef<any>(null)
  // ref so speak() always sees the latest value inside async callbacks
  const ttsEnabledRef = useRef(true)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setSttAvailable(!!(
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      ))
    }
    return () => {
      recognitionRef.current?.stop()
      if (typeof window !== 'undefined') window.speechSynthesis?.cancel()
    }
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  function speak(text: string) {
    if (!ttsEnabledRef.current || typeof window === 'undefined' || !window.speechSynthesis) return
    window.speechSynthesis.cancel()

    const doSpeak = () => {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'de-DE'
      utterance.rate = 0.85
      utterance.pitch = 1.0
      utterance.volume = 1.0
      const voices = window.speechSynthesis.getVoices()
      const germanVoice = voices.find(v => v.lang === 'de-DE') || voices.find(v => v.lang.startsWith('de'))
      if (germanVoice) utterance.voice = germanVoice
      window.speechSynthesis.speak(utterance)
    }

    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.addEventListener('voiceschanged', doSpeak, { once: true })
    } else {
      doSpeak()
    }
  }

  function toggleTts() {
    const next = !ttsEnabled
    ttsEnabledRef.current = next
    setTtsEnabled(next)
    if (!next) window.speechSynthesis?.cancel()
  }

  function toggleRecording() {
    if (isRecording) {
      recognitionRef.current?.stop()
      return
    }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) return

    const recognition = new SR()
    recognition.lang = 'de-DE'
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    recognition.onstart = () => setIsRecording(true)
    recognition.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript
      setInput(prev => (prev ? prev + ' ' : '') + transcript)
    }
    recognition.onerror = () => setIsRecording(false)
    recognition.onend = () => setIsRecording(false)

    recognitionRef.current = recognition
    recognition.start()
  }

  async function startConversation(senior: { id: string; name: string }) {
    setStarting(true)
    setSelectedSenior(senior)
    try {
      const res = await fetch(`${API}/api/conversations/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senior_id: senior.id }),
      })
      const data = await res.json()
      setConversationId(data.conversation_id)
      setMessages([{ role: 'assistant', content: data.greeting, id: 'init' }])
      speak(data.greeting)
    } catch {
      const fallback = `Hallo ${senior.name}! Wie schön, dass wir uns heute unterhalten. Wie geht es Ihnen?`
      setMessages([{ role: 'assistant', content: fallback, id: 'init' }])
      speak(fallback)
    }
    setStarting(false)
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  async function sendMessage() {
    if (!input.trim() || loading || !selectedSenior) return
    const text = input.trim()
    setInput('')
    const userMsg: Message = { role: 'user', content: text, id: Date.now().toString() }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    try {
      const res = await fetch(`${API}/api/conversations/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation_id: conversationId,
          senior_id: selectedSenior.id,
          content: text,
        }),
      })
      const data = await res.json()
      if (!conversationId && data.conversation_id) setConversationId(data.conversation_id)
      const response: string = data.response
      setMessages(prev => [...prev, { role: 'assistant', content: response, id: Date.now().toString() + 'a' }])
      speak(response)
    } catch {
      const errText = 'Es tut mir leid, ich habe gerade kleine Schwierigkeiten. Könnten Sie es in einem Moment nochmal versuchen?'
      setMessages(prev => [...prev, { role: 'assistant', content: errText, id: 'err' }])
      speak(errText)
    }
    setLoading(false)
  }

  async function endConversation() {
    if (!conversationId) return
    window.speechSynthesis?.cancel()
    setEnding(true)
    try {
      const res = await fetch(`${API}/api/conversations/end`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversation_id: conversationId }),
      })
      const data = await res.json()
      setSummary(data.summary)
    } catch {
      setSummary(null)
    }
    setEnded(true)
    setEnding(false)
  }

  function reset() {
    window.speechSynthesis?.cancel()
    setSelectedSenior(null)
    setConversationId(null)
    setMessages([])
    setInput('')
    setSummary(null)
    setEnded(false)
  }

  const riskColor: Record<string, string> = { low: '#1a6b3c', medium: '#7d5a00', high: '#9c2d12' }
  const riskBg: Record<string, string> = { low: '#dcf4e4', medium: '#fef3cd', high: '#ffe0d9' }
  const riskLabel: Record<string, string> = { low: 'Niedriges Risiko', medium: 'Mittleres Risiko', high: 'Hohes Risiko' }

  // ── Senior selection ──────────────────────────────────────────────────────
  if (!selectedSenior) {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-main)' }}>
        <nav className="glass border-b border-sage-100 px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white" style={{ background: 'var(--sage-green)' }}>✦</div>
            <span className="font-display text-xl font-medium" style={{ color: 'var(--text-dark)' }}>ClaraCompanion</span>
          </Link>
          <Link href="/dashboard" className="text-sm font-medium px-4 py-2 rounded-full border border-sage-200" style={{ color: 'var(--text-mid)' }}>
            Pflegepersonen-Dashboard →
          </Link>
        </nav>

        <div className="flex-1 flex flex-col items-center justify-center px-6 page-enter">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl mb-6" style={{ background: 'var(--sage-green)' }}>✦</div>
          <h1 className="font-display text-4xl font-light mb-2 text-center" style={{ color: 'var(--text-dark)' }}>Mit wem spreche ich heute?</h1>
          <p className="text-base mb-10 text-center" style={{ color: '#6b8a70' }}>Wählen Sie eine Person aus, um ein einfühlsames Gespräch mit Clara zu beginnen.</p>

          <div className="grid sm:grid-cols-2 gap-4 w-full max-w-lg">
            {DEMO_SENIORS.map(s => (
              <button
                key={s.id}
                onClick={() => startConversation(s)}
                disabled={starting}
                className="card-hover glass rounded-2xl p-6 text-left border border-sage-100 disabled:opacity-50"
              >
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg mb-3" style={{ background: 'var(--sage-green)' }}>
                  {s.name.charAt(0)}
                </div>
                <div className="font-display text-xl font-medium" style={{ color: 'var(--text-dark)' }}>{s.name}</div>
                <div className="text-sm mt-1" style={{ color: '#8aaa92' }}>Gespräch beginnen →</div>
              </button>
            ))}
          </div>
          {starting && <p className="mt-6 text-sm animate-pulse" style={{ color: '#8aaa92' }}>Gespräch wird gestartet…</p>}
        </div>
      </div>
    )
  }

  // ── Summary screen ────────────────────────────────────────────────────────
  if (ended) {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-main)' }}>
        <nav className="glass border-b border-sage-100 px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white" style={{ background: 'var(--sage-green)' }}>✦</div>
            <span className="font-display text-xl font-medium" style={{ color: 'var(--text-dark)' }}>ClaraCompanion</span>
          </Link>
        </nav>
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 page-enter">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mb-6 bg-sage-100">✅</div>
          <h2 className="font-display text-4xl font-light mb-2 text-center" style={{ color: 'var(--text-dark)' }}>Gespräch abgeschlossen</h2>
          <p className="text-base mb-10 text-center" style={{ color: '#6b8a70' }}>Die Zusammenfassung wurde gespeichert und ist im Pflegepersonen-Dashboard verfügbar.</p>

          {summary && (
            <div className="glass rounded-3xl p-8 w-full max-w-xl shadow-lg mb-8">
              <h3 className="font-display text-xl font-medium mb-4" style={{ color: 'var(--text-dark)' }}>Gesprächszusammenfassung</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center py-2 border-b border-sage-100">
                  <span style={{ color: '#6b8a70' }}>Stimmung</span>
                  <span className="font-medium capitalize" style={{ color: 'var(--text-dark)' }}>{summary.mood?.replace(/_/g, ' ')}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-sage-100">
                  <span style={{ color: '#6b8a70' }}>Risikoniveau</span>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ background: riskBg[summary.risk_level] || '#e0ece5', color: riskColor[summary.risk_level] || '#3a6750' }}>
                    {riskLabel[summary.risk_level] || summary.risk_level}
                  </span>
                </div>
                {Object.keys(SIGNAL_LABELS).map(k =>
                  summary[k] ? (
                    <div key={k} className="flex items-center gap-2 py-1">
                      <span className="w-2 h-2 rounded-full" style={{ background: 'var(--warm-terra)' }}></span>
                      <span style={{ color: '#5a7060' }}>{SIGNAL_LABELS[k]} erkannt</span>
                    </div>
                  ) : null
                )}
                {summary.summary_text && (
                  <div className="pt-3 text-sm leading-relaxed" style={{ color: '#5a7060' }}>
                    <strong className="block mb-1">Zusammenfassung:</strong>
                    {summary.summary_text}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={reset} className="px-6 py-3 rounded-xl font-medium text-white" style={{ background: 'var(--sage-green)' }}>
              Neues Gespräch
            </button>
            <Link href="/dashboard" className="px-6 py-3 rounded-xl font-medium border border-sage-200" style={{ color: 'var(--text-mid)' }}>
              Dashboard öffnen →
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // ── Main chat UI ──────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-main)' }}>
      <header className="glass border-b border-sage-100 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white" style={{ background: 'var(--sage-green)' }}>✦</div>
          <span className="font-display text-xl font-medium" style={{ color: 'var(--text-dark)' }}>ClaraCompanion</span>
        </Link>
        <div className="flex items-center gap-3">
          <div className="text-center hidden sm:block">
            <div className="text-sm font-medium" style={{ color: 'var(--text-dark)' }}>{selectedSenior.name}</div>
            <div className="text-xs flex items-center gap-1" style={{ color: '#8aaa92' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block"></span> Aktive Sitzung
            </div>
          </div>

          {/* TTS toggle */}
          <button
            onClick={toggleTts}
            title={ttsEnabled ? 'Sprachausgabe deaktivieren' : 'Sprachausgabe aktivieren'}
            className="w-9 h-9 rounded-xl flex items-center justify-center border border-sage-200 transition-all hover:bg-sage-50"
            style={{ color: ttsEnabled ? 'var(--sage-green)' : '#aabdab', background: 'white' }}
          >
            {ttsEnabled ? (
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
              </svg>
            ) : (
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                <line x1="23" y1="9" x2="17" y2="15"/>
                <line x1="17" y1="9" x2="23" y2="15"/>
              </svg>
            )}
          </button>

          <button
            onClick={endConversation}
            disabled={ending || messages.length < 2}
            className="px-4 py-2 rounded-xl text-sm font-medium border border-sage-200 transition-all hover:bg-sage-50 disabled:opacity-40"
            style={{ color: 'var(--text-mid)' }}
          >
            {ending ? 'Wird gespeichert…' : 'Beenden & Zusammenfassen'}
          </button>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-8 space-y-4" style={{ maxHeight: 'calc(100vh - 140px)' }}>
        <div className="max-w-2xl mx-auto space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex items-end gap-3 bubble-in ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              {msg.role === 'assistant' && (
                <div className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-white text-sm" style={{ background: 'var(--sage-green)' }}>✦</div>
              )}
              <div
                className={`px-4 py-3 rounded-2xl text-sm leading-relaxed max-w-sm shadow-sm ${msg.role === 'assistant' ? 'rounded-bl-sm' : 'rounded-br-sm text-white'}`}
                style={msg.role === 'assistant'
                  ? { background: 'white', color: 'var(--text-dark)', border: '1px solid #e8f0e9' }
                  : { background: 'var(--warm-terra)' }}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-end gap-3 bubble-in">
              <div className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-white text-sm" style={{ background: 'var(--sage-green)' }}>✦</div>
              <div className="px-4 py-3 rounded-2xl rounded-bl-sm bg-white border border-sage-100 shadow-sm flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-sage-300 typing-dot"></span>
                <span className="w-2 h-2 rounded-full bg-sage-300 typing-dot"></span>
                <span className="w-2 h-2 rounded-full bg-sage-300 typing-dot"></span>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <div className="glass border-t border-sage-100 px-4 py-4 sticky bottom-0">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          {/* Microphone button — only shown when STT is available */}
          {sttAvailable && (
            <button
              onClick={toggleRecording}
              title={isRecording ? 'Aufnahme stoppen' : 'Spracheingabe (Deutsch)'}
              className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all flex-shrink-0 border ${isRecording ? 'animate-pulse' : 'hover:bg-sage-50'}`}
              style={{
                color: isRecording ? '#ef4444' : '#6b8a70',
                background: isRecording ? '#ffe0d9' : 'white',
                borderColor: isRecording ? '#fca5a5' : '#d1e4d8',
              }}
            >
              <svg width="18" height="18" fill={isRecording ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <rect x="9" y="2" width="6" height="11" rx="3"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                <line x1="12" y1="19" x2="12" y2="22"/>
                <line x1="8" y1="22" x2="16" y2="22"/>
              </svg>
            </button>
          )}

          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder={isRecording ? 'Ich höre zu…' : 'Nachricht eingeben…'}
            disabled={loading}
            className="flex-1 px-5 py-3 rounded-2xl text-sm outline-none border border-sage-200 focus:border-sage-400 transition-colors disabled:opacity-50"
            style={{ background: 'white', color: 'var(--text-dark)' }}
          />

          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="w-11 h-11 rounded-xl flex items-center justify-center text-white transition-all hover:scale-105 disabled:opacity-40"
            style={{ background: 'var(--sage-green)' }}
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {sttAvailable && (
          <p className="text-center text-xs mt-2" style={{ color: '#aabdab' }}>
            {isRecording
              ? '● Aufnahme läuft – erneut klicken zum Stoppen'
              : 'Mikrofon für deutsche Spracheingabe · Lautsprecher-Symbol für Stimmausgabe'}
          </p>
        )}
      </div>
    </div>
  )
}
