'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

type Senior = {
  id: string
  name: string
  email: string
  latest_interaction: string | null
  risk_level: string
  mood: string | null
  pending_escalations: number
  escalations: Escalation[]
}

type Escalation = {
  id: string
  priority: string
  reason: string
  action_required: string
  created_at: string
}

type SeniorDetail = {
  senior: { id: string; name: string; email: string }
  summaries: Summary[]
  observations: Observation[]
  escalations: EscalationDetail[]
}

type Summary = {
  id: string
  date: string
  mood: string
  sleep_issue: boolean
  loneliness: boolean
  pain: boolean
  medication_issue: boolean
  anxiety: boolean
  risk_level: string
  summary_text: string
}

type Observation = {
  id: string
  signal_type: string
  severity: string
  description: string
  detected_at: string
}

type EscalationDetail = Escalation & { acknowledged: boolean }

const RISK_CONFIG: Record<string, { label: string; bg: string; color: string; dot: string }> = {
  low: { label: 'Low Risk', bg: '#dcf4e4', color: '#1a6b3c', dot: '#22c55e' },
  medium: { label: 'Medium Risk', bg: '#fef3cd', color: '#7d5a00', dot: '#f59e0b' },
  high: { label: 'High Risk', bg: '#ffe0d9', color: '#9c2d12', dot: '#ef4444' },
  unknown: { label: 'No Data', bg: '#f1ede6', color: '#8aaa92', dot: '#aaa' },
}

const SIGNAL_ICONS: Record<string, string> = {
  loneliness: '😔', poor_sleep: '😴', pain: '🤕', medication_issue: '💊',
  confusion: '🤔', anxiety: '😰', social_isolation: '🏠', fall: '⚠️',
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export default function DashboardPage() {
  const [seniors, setSeniors] = useState<Senior[]>([])
  const [selected, setSelected] = useState<SeniorDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [detailLoading, setDetailLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'observations' | 'escalations'>('overview')

  useEffect(() => {
    fetchSeniors()
    const interval = setInterval(fetchSeniors, 30000)
    return () => clearInterval(interval)
  }, [])

  async function fetchSeniors() {
    try {
      const res = await fetch(`${API}/api/dashboard/seniors`)
      const data = await res.json()
      setSeniors(data)
    } catch {
      // Show demo data if backend not available
      setSeniors([
        { id: '11111111-1111-1111-1111-111111111111', name: 'Margaret Wilson', email: 'margaret@example.com', latest_interaction: new Date().toISOString(), risk_level: 'medium', mood: 'slightly_negative', pending_escalations: 1, escalations: [{ id: '1', priority: 'medium', reason: 'Reported poor sleep and loneliness', action_required: 'Caregiver review recommended within 24 hours', created_at: new Date().toISOString() }] },
        { id: '22222222-2222-2222-2222-222222222222', name: 'Robert Thompson', email: 'robert@example.com', latest_interaction: new Date(Date.now() - 86400000 * 2).toISOString(), risk_level: 'low', mood: 'neutral', pending_escalations: 0, escalations: [] },
      ])
    }
    setLoading(false)
  }

  async function fetchDetail(id: string) {
    setDetailLoading(true)
    try {
      const res = await fetch(`${API}/api/dashboard/senior/${id}`)
      const data = await res.json()
      setSelected(data)
    } catch {
      setSelected(null)
    }
    setDetailLoading(false)
  }

  async function acknowledge(escId: string) {
    try {
      await fetch(`${API}/api/dashboard/escalations/${escId}/acknowledge`, { method: 'POST' })
      fetchSeniors()
      if (selected) fetchDetail(selected.senior.id)
    } catch {}
  }

  const highRiskCount = seniors.filter(s => s.risk_level === 'high').length
  const pendingAlerts = seniors.reduce((a, s) => a + s.pending_escalations, 0)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-main)' }}>
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-2 border-sage-200 border-t-sage-500 animate-spin mx-auto mb-4"></div>
          <p className="text-sm" style={{ color: '#8aaa92' }}>Loading dashboard…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-main)' }}>
      {/* Nav */}
      <nav className="glass border-b border-sage-100 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm" style={{ background: 'var(--sage-green)' }}>✦</div>
          <span className="font-display text-xl font-medium" style={{ color: 'var(--text-dark)' }}>ClaraCompanion</span>
        </Link>
        <div className="flex items-center gap-3">
          {pendingAlerts > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium" style={{ background: '#ffe0d9', color: '#9c2d12' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse inline-block"></span>
              {pendingAlerts} alert{pendingAlerts > 1 ? 's' : ''} pending
            </div>
          )}
          <Link href="/chat" className="px-4 py-2 rounded-xl text-sm font-medium text-white" style={{ background: 'var(--sage-green)' }}>
            + New Conversation
          </Link>
        </div>
      </nav>

      <div className="flex min-h-[calc(100vh-65px)]">
        {/* Sidebar */}
        <aside className="w-80 border-r border-sage-100 bg-white flex-shrink-0 flex flex-col">
          {/* Stats */}
          <div className="p-5 border-b border-sage-100 grid grid-cols-3 gap-3">
            <div className="text-center p-3 rounded-xl" style={{ background: 'var(--bg-main)' }}>
              <div className="font-display text-2xl font-medium" style={{ color: 'var(--text-dark)' }}>{seniors.length}</div>
              <div className="text-xs mt-0.5" style={{ color: '#8aaa92' }}>Seniors</div>
            </div>
            <div className="text-center p-3 rounded-xl" style={{ background: highRiskCount > 0 ? '#ffe0d9' : 'var(--bg-main)' }}>
              <div className="font-display text-2xl font-medium" style={{ color: highRiskCount > 0 ? '#9c2d12' : 'var(--text-dark)' }}>{highRiskCount}</div>
              <div className="text-xs mt-0.5" style={{ color: highRiskCount > 0 ? '#c0402a' : '#8aaa92' }}>High Risk</div>
            </div>
            <div className="text-center p-3 rounded-xl" style={{ background: pendingAlerts > 0 ? '#fef3cd' : 'var(--bg-main)' }}>
              <div className="font-display text-2xl font-medium" style={{ color: pendingAlerts > 0 ? '#7d5a00' : 'var(--text-dark)' }}>{pendingAlerts}</div>
              <div className="text-xs mt-0.5" style={{ color: pendingAlerts > 0 ? '#9a7000' : '#8aaa92' }}>Alerts</div>
            </div>
          </div>

          {/* Senior list */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider px-2 py-2" style={{ color: '#aabdab' }}>Your Seniors</h3>
            {seniors.map(s => {
              const rc = RISK_CONFIG[s.risk_level] || RISK_CONFIG.unknown
              const isActive = selected?.senior.id === s.id
              return (
                <button
                  key={s.id}
                  onClick={() => { fetchDetail(s.id); setActiveTab('overview') }}
                  className={`w-full text-left p-4 rounded-2xl transition-all border ${isActive ? 'border-sage-300 shadow-sm' : 'border-transparent hover:border-sage-100 hover:bg-sage-50'}`}
                  style={{ background: isActive ? 'var(--sage-light)' : 'transparent' }}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium flex-shrink-0" style={{ background: 'var(--sage-green)' }}>
                      {s.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm truncate" style={{ color: 'var(--text-dark)' }}>{s.name}</span>
                        {s.pending_escalations > 0 && (
                          <span className="w-5 h-5 rounded-full text-xs flex items-center justify-center text-white flex-shrink-0" style={{ background: '#ef4444' }}>{s.pending_escalations}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: rc.dot }}></span>
                        <span className="text-xs" style={{ color: rc.color }}>{rc.label}</span>
                      </div>
                      {s.latest_interaction && (
                        <div className="text-xs mt-0.5" style={{ color: '#aabdab' }}>{timeAgo(s.latest_interaction)}</div>
                      )}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </aside>

        {/* Main panel */}
        <main className="flex-1 overflow-y-auto">
          {detailLoading && (
            <div className="flex items-center justify-center h-full">
              <div className="w-8 h-8 rounded-full border-2 border-sage-200 border-t-sage-500 animate-spin"></div>
            </div>
          )}

          {!selected && !detailLoading && (
            <div className="flex flex-col items-center justify-center h-full text-center px-8 page-enter">
              <div className="text-5xl mb-4">📊</div>
              <h2 className="font-display text-3xl font-light mb-2" style={{ color: 'var(--text-dark)' }}>Select a senior</h2>
              <p className="text-base" style={{ color: '#8aaa92' }}>Choose a senior from the list to view their wellbeing details.</p>
            </div>
          )}

          {selected && !detailLoading && (
            <div className="p-8 page-enter max-w-4xl">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-2xl font-display" style={{ background: 'var(--sage-green)' }}>
                    {selected.senior.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="font-display text-3xl font-light" style={{ color: 'var(--text-dark)' }}>{selected.senior.name}</h2>
                    <p className="text-sm" style={{ color: '#8aaa92' }}>{selected.senior.email}</p>
                  </div>
                </div>
                {selected.summaries[0] && (
                  <div className="px-4 py-2 rounded-xl text-sm font-medium capitalize" style={{
                    background: RISK_CONFIG[selected.summaries[0].risk_level]?.bg,
                    color: RISK_CONFIG[selected.summaries[0].risk_level]?.color,
                  }}>
                    {RISK_CONFIG[selected.summaries[0].risk_level]?.label}
                  </div>
                )}
              </div>

              {/* Tabs */}
              <div className="flex gap-1 mb-6 p-1 rounded-xl w-fit" style={{ background: 'white', border: '1px solid #e8f0e9' }}>
                {(['overview', 'observations', 'escalations'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-5 py-2 rounded-lg text-sm font-medium capitalize transition-all ${activeTab === tab ? 'text-white shadow-sm' : ''}`}
                    style={activeTab === tab ? { background: 'var(--sage-green)' } : { color: '#6b8a70' }}
                  >
                    {tab}
                    {tab === 'escalations' && selected.escalations.filter(e => !e.acknowledged).length > 0 && (
                      <span className="ml-1.5 w-4 h-4 rounded-full text-xs inline-flex items-center justify-center bg-red-400 text-white">
                        {selected.escalations.filter(e => !e.acknowledged).length}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-4">
                  {selected.summaries.length === 0 && (
                    <div className="glass rounded-2xl p-8 text-center">
                      <p className="text-base" style={{ color: '#8aaa92' }}>No conversations recorded yet.</p>
                    </div>
                  )}
                  {selected.summaries.map(s => {
                    const rc = RISK_CONFIG[s.risk_level] || RISK_CONFIG.unknown
                    const flags = [
                      s.sleep_issue && 'Poor Sleep', s.loneliness && 'Loneliness',
                      s.pain && 'Pain', s.medication_issue && 'Medication Issue', s.anxiety && 'Anxiety'
                    ].filter(Boolean)
                    return (
                      <div key={s.id} className="glass rounded-2xl p-6 border border-sage-100 card-hover">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="text-sm font-medium" style={{ color: 'var(--text-dark)' }}>{new Date(s.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</div>
                            <div className="text-xs mt-0.5 capitalize" style={{ color: '#8aaa92' }}>Mood: {s.mood?.replace(/_/g, ' ')}</div>
                          </div>
                          <span className="px-3 py-1 rounded-full text-xs font-semibold capitalize" style={{ background: rc.bg, color: rc.color }}>{rc.label}</span>
                        </div>
                        {flags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {flags.map(f => (
                              <span key={f as string} className="px-2 py-0.5 rounded-full text-xs" style={{ background: '#fff3e0', color: '#9a6200' }}>⚡ {f}</span>
                            ))}
                          </div>
                        )}
                        {s.summary_text && <p className="text-sm leading-relaxed" style={{ color: '#5a7060' }}>{s.summary_text}</p>}
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Observations Tab */}
              {activeTab === 'observations' && (
                <div className="space-y-3">
                  {selected.observations.length === 0 && (
                    <div className="glass rounded-2xl p-8 text-center">
                      <p style={{ color: '#8aaa92' }}>No observations recorded yet.</p>
                    </div>
                  )}
                  {selected.observations.map(o => (
                    <div key={o.id} className="glass rounded-xl p-5 flex items-start gap-4 border border-sage-100">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl bg-sage-50 flex-shrink-0">
                        {SIGNAL_ICONS[o.signal_type] || '📌'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm capitalize" style={{ color: 'var(--text-dark)' }}>{o.signal_type.replace(/_/g, ' ')}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize risk-${o.severity}`}>{o.severity}</span>
                        </div>
                        {o.description && <p className="text-sm" style={{ color: '#5a7060' }}>{o.description}</p>}
                        <p className="text-xs mt-1" style={{ color: '#aabdab' }}>{timeAgo(o.detected_at)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Escalations Tab */}
              {activeTab === 'escalations' && (
                <div className="space-y-3">
                  {selected.escalations.length === 0 && (
                    <div className="glass rounded-2xl p-8 text-center">
                      <p style={{ color: '#8aaa92' }}>No escalations recorded.</p>
                    </div>
                  )}
                  {selected.escalations.map(e => {
                    const rc = RISK_CONFIG[e.priority] || RISK_CONFIG.low
                    return (
                      <div key={e.id} className={`rounded-xl p-5 border ${e.acknowledged ? 'opacity-60' : ''}`} style={{ background: e.acknowledged ? 'var(--bg-main)' : rc.bg, borderColor: e.acknowledged ? '#e8f0e9' : rc.color + '44' }}>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="px-2 py-0.5 rounded-full text-xs font-semibold capitalize" style={{ background: rc.bg, color: rc.color, border: `1px solid ${rc.color}44` }}>{e.priority} priority</span>
                              {e.acknowledged && <span className="text-xs" style={{ color: '#8aaa92' }}>✓ Acknowledged</span>}
                            </div>
                            <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-dark)' }}>{e.reason}</p>
                            <p className="text-sm" style={{ color: '#5a7060' }}>Action: {e.action_required}</p>
                            <p className="text-xs mt-2" style={{ color: '#aabdab' }}>{timeAgo(e.created_at)}</p>
                          </div>
                          {!e.acknowledged && (
                            <button
                              onClick={() => acknowledge(e.id)}
                              className="px-3 py-1.5 rounded-lg text-xs font-medium text-white flex-shrink-0"
                              style={{ background: 'var(--sage-green)' }}
                            >
                              Acknowledge
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
