'use client'
import Link from 'next/link'
import { useState } from 'react'

const FEATURES = [
  {
    icon: '💬',
    title: 'Natural Conversation',
    desc: 'Clara speaks warmly and naturally — never robotic. She remembers everything shared and follows up with genuine care.',
  },
  {
    icon: '🧠',
    title: 'Session Memory',
    desc: 'Context is preserved throughout every conversation. Clara recalls earlier details and weaves them into thoughtful responses.',
  },
  {
    icon: '📡',
    title: 'Wellbeing Signal Detection',
    desc: 'Clara quietly monitors for signs of loneliness, pain, poor sleep, medication issues, anxiety, and more.',
  },
  {
    icon: '📋',
    title: 'Structured Summaries',
    desc: 'Every conversation is distilled into a clear, machine-readable summary caregivers can review at a glance.',
  },
  {
    icon: '🚨',
    title: 'Escalation Engine',
    desc: 'Rule-based escalation flags low, medium, and high-priority concerns — from gentle reminders to immediate alerts.',
  },
  {
    icon: '📊',
    title: 'Caregiver Dashboard',
    desc: 'A beautiful dashboard gives caregivers full visibility: risk levels, observations, trends, and escalation alerts.',
  },
]

const SIGNALS = ['Loneliness', 'Poor Sleep', 'Pain', 'Medication Issues', 'Confusion', 'Anxiety', 'Social Isolation']

export default function HomePage() {
  const [activeSignal, setActiveSignal] = useState(0)

  return (
    <main className="min-h-screen" style={{ background: 'var(--bg-main)' }}>
      {/* Nav */}
      <nav className="glass sticky top-0 z-50 border-b border-sage-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-lg" style={{ background: 'var(--sage-green)' }}>✦</div>
            <span className="font-display text-2xl font-semibold" style={{ color: 'var(--text-dark)' }}>ClaraCompanion</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/chat" className="text-sm font-medium px-4 py-2 rounded-full transition-colors hover:bg-sage-100" style={{ color: 'var(--text-mid)' }}>
              Start a Conversation
            </Link>
            <Link href="/dashboard" className="text-sm font-medium px-5 py-2 rounded-full text-white transition-opacity hover:opacity-90" style={{ background: 'var(--sage-green)' }}>
              Caregiver Dashboard
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-24 text-center page-enter">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-8" style={{ background: 'var(--sage-light)', color: 'var(--sage-green)' }}>
          <span className="w-2 h-2 rounded-full bg-sage-500 animate-pulse-soft inline-block"></span>
          AI-Powered Elderly Care Companion
        </div>

        <h1 className="font-display text-6xl md:text-7xl font-light leading-tight mb-6" style={{ color: 'var(--text-dark)' }}>
          A companion who truly
          <br />
          <em className="gradient-text not-italic">listens & cares</em>
        </h1>

        <p className="text-xl font-light max-w-2xl mx-auto mb-12" style={{ color: '#5a7060', lineHeight: 1.8 }}>
          ClaraCompanion is an empathetic AI designed for elderly users — holding warm, natural conversations while quietly keeping caregivers informed of what matters most.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/chat" className="px-8 py-4 rounded-2xl text-white font-medium text-lg transition-all hover:scale-105 hover:shadow-lg shadow-sage-200" style={{ background: 'var(--sage-green)' }}>
            Begin a Conversation →
          </Link>
          <Link href="/dashboard" className="px-8 py-4 rounded-2xl font-medium text-lg transition-all hover:scale-105 border-2 border-sage-200" style={{ color: 'var(--text-mid)', background: 'white' }}>
            View Caregiver Dashboard
          </Link>
        </div>

        {/* Chat preview */}
        <div className="mt-20 max-w-2xl mx-auto glass rounded-3xl p-6 shadow-xl shadow-sage-100 text-left">
          <div className="flex items-center gap-2 mb-5 pb-4 border-b border-sage-100">
            <div className="w-3 h-3 rounded-full bg-red-300"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-300"></div>
            <div className="w-3 h-3 rounded-full bg-green-300"></div>
            <span className="ml-2 text-sm font-medium" style={{ color: '#8aaa92' }}>Clara – Companion Chat</span>
          </div>
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-sm" style={{ background: 'var(--sage-green)' }}>✦</div>
              <div className="px-4 py-3 rounded-2xl rounded-tl-sm text-sm leading-relaxed max-w-xs" style={{ background: 'var(--sage-light)', color: 'var(--text-dark)' }}>
                Hello Margaret! It's so lovely to chat with you today. How are you feeling?
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <div className="px-4 py-3 rounded-2xl rounded-tr-sm text-sm leading-relaxed max-w-xs text-white" style={{ background: 'var(--warm-terra)' }}>
                I didn't sleep very well last night. My leg was bothering me.
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-sm" style={{ background: 'var(--sage-green)' }}>✦</div>
              <div className="px-4 py-3 rounded-2xl rounded-tl-sm text-sm leading-relaxed max-w-xs" style={{ background: 'var(--sage-light)', color: 'var(--text-dark)' }}>
                I'm sorry to hear that, Margaret. Restless nights can be really draining. Is the pain in your leg still there now, or did it ease up this morning?
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6" style={{ background: 'white' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-5xl font-light mb-4" style={{ color: 'var(--text-dark)' }}>Everything caregivers need</h2>
            <p className="text-lg" style={{ color: '#6b8a70' }}>Built with compassion for seniors and clarity for caregivers</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <div key={i} className="card-hover p-8 rounded-2xl border border-sage-100" style={{ background: 'var(--bg-main)' }}>
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="font-display text-xl font-medium mb-2" style={{ color: 'var(--text-dark)' }}>{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#6b8a70' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Signals section */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-16">
          <div className="flex-1">
            <h2 className="font-display text-5xl font-light mb-4" style={{ color: 'var(--text-dark)' }}>Wellbeing signals,<br />quietly monitored</h2>
            <p className="text-base leading-relaxed mb-8" style={{ color: '#6b8a70' }}>
              Clara listens for the things that matter. Every conversation is analyzed for patterns that caregivers should know about — surfaced clearly, never buried.
            </p>
            <div className="flex flex-wrap gap-2">
              {SIGNALS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setActiveSignal(i)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeSignal === i ? 'text-white' : 'border border-sage-200'}`}
                  style={activeSignal === i ? { background: 'var(--sage-green)', color: 'white' } : { color: 'var(--text-mid)' }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 glass rounded-3xl p-8 shadow-lg">
            <div className="text-4xl mb-3">
              {['😔','😴','🤕','💊','🤔','😰','🏠'][activeSignal]}
            </div>
            <h4 className="font-display text-2xl mb-2" style={{ color: 'var(--text-dark)' }}>{SIGNALS[activeSignal]} Detected</h4>
            <p className="text-sm leading-relaxed mb-4" style={{ color: '#6b8a70' }}>
              {[
                'Clara noticed Margaret expressed feelings of isolation and missing family. Flagged for caregiver review.',
                'Multiple mentions of difficulty sleeping this week. Sleep pattern concern logged.',
                'User mentioned leg pain persisting over 2 days. Medium priority escalation triggered.',
                'Mentioned forgetting morning medication. High priority alert sent to caregiver.',
                'Signs of disorientation noted. Caregiver notified to check in.',
                'Expressed worry about health and finances. Emotional support provided, flagged.',
                'Has not mentioned social activities in 5 sessions. Isolation trend detected.',
              ][activeSignal]}
            </p>
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${['risk-medium','risk-low','risk-medium','risk-high','risk-medium','risk-low','risk-medium'][activeSignal]}`}>
              {['Medium Priority','Low Priority','Medium Priority','High Priority','Medium Priority','Low Priority','Medium Priority'][activeSignal]}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 text-center" style={{ background: 'var(--sage-green)' }}>
        <h2 className="font-display text-5xl font-light text-white mb-4">Ready to meet Clara?</h2>
        <p className="text-lg mb-10" style={{ color: '#c3d9cc' }}>Start a conversation with your elderly loved one today.</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/chat" className="px-8 py-4 rounded-2xl font-medium text-lg transition-all hover:scale-105 bg-white" style={{ color: 'var(--sage-green)' }}>
            Start Conversation →
          </Link>
          <Link href="/dashboard" className="px-8 py-4 rounded-2xl font-medium text-lg transition-all hover:scale-105 border-2 border-white border-opacity-40 text-white">
            Caregiver Dashboard
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 text-center border-t border-sage-100" style={{ background: 'var(--bg-main)' }}>
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-sm" style={{ background: 'var(--sage-green)' }}>✦</div>
          <span className="font-display text-xl" style={{ color: 'var(--text-dark)' }}>ClaraCompanion</span>
        </div>
        <p className="text-sm" style={{ color: '#8aaa92' }}>Built with care · Healthcare AI MVP</p>
      </footer>
    </main>
  )
}
