'use client'
import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'

const FEATURES = [
  {
    icon: '💬',
    title: 'Natürliche Konversation',
    desc: 'Clara spricht warm und natürlich – niemals roboterhaft. Sie erinnert sich an alles Geteilte und fragt mit echter Fürsorge nach.',
  },
  {
    icon: '🧠',
    title: 'Gesprächsgedächtnis',
    desc: 'Der Kontext wird während des gesamten Gesprächs bewahrt. Clara erinnert sich an frühere Details und verwebt sie in einfühlsame Antworten.',
  },
  {
    icon: '📡',
    title: 'Wohlbefindenserkennung',
    desc: 'Clara überwacht still auf Anzeichen von Einsamkeit, Schmerzen, Schlafproblemen, Medikamentenproblemen, Angst und mehr.',
  },
  {
    icon: '📋',
    title: 'Strukturierte Zusammenfassungen',
    desc: 'Jedes Gespräch wird in eine klare, maschinenlesbare Zusammenfassung destilliert, die Pflegepersonen auf einen Blick überprüfen können.',
  },
  {
    icon: '🚨',
    title: 'Eskalations-Engine',
    desc: 'Regelbasierte Eskalation markiert Bedenken mit niedriger, mittlerer und hoher Priorität – von sanften Hinweisen bis zu sofortigen Warnungen.',
  },
  {
    icon: '📊',
    title: 'Pflegepersonen-Dashboard',
    desc: 'Ein übersichtliches Dashboard gibt Pflegepersonen volle Transparenz: Risikoniveaus, Beobachtungen, Trends und Eskalationswarnungen.',
  },
]

const SIGNALS = [
  'Einsamkeit',
  'Schlafprobleme',
  'Schmerzen',
  'Medikamentenprobleme',
  'Verwirrtheit',
  'Angst',
  'Soziale Isolation',
]

const SIGNAL_DESCRIPTIONS = [
  'Clara bemerkte, dass Margaret Gefühle der Isolation und das Vermissen ihrer Familie ausdrückte. Zur Überprüfung durch Pflegepersonen markiert.',
  'Mehrfache Erwähnung von Einschlafproblemen diese Woche. Schlafmuster-Bedenken wurden protokolliert.',
  'Benutzer erwähnte seit 2 Tagen anhaltende Beinschmerzen. Eskalation mit mittlerer Priorität ausgelöst.',
  'Erwähnte, die morgendliche Medikation vergessen zu haben. Hohe Priorität an Pflegeperson gesendet.',
  'Anzeichen von Orientierungslosigkeit beobachtet. Pflegeperson zur Kontrolle benachrichtigt.',
  'Sorgen über Gesundheit und finanzielle Situation geäußert. Emotionale Unterstützung geleistet, markiert.',
  'Hat seit 5 Sitzungen keine sozialen Aktivitäten mehr erwähnt. Isolationstrend erkannt.',
]

const SIGNAL_PRIORITIES = [
  'Mittlere Priorität',
  'Niedrige Priorität',
  'Mittlere Priorität',
  'Hohe Priorität',
  'Mittlere Priorität',
  'Niedrige Priorität',
  'Mittlere Priorität',
]

const SIGNAL_PRIORITY_CLASSES = [
  'risk-medium', 'risk-low', 'risk-medium', 'risk-high',
  'risk-medium', 'risk-low', 'risk-medium',
]

const DEMO_CHAT = [
  { role: 'assistant' as const, content: 'Hallo Margaret! Wie schön, dass wir uns heute unterhalten. Wie geht es Ihnen?' },
  { role: 'user' as const, content: 'Ich habe letzte Nacht nicht gut geschlafen. Mein Bein hat mich gestört.' },
  { role: 'assistant' as const, content: 'Das tut mir leid, Margaret. Schlechte Nächte können wirklich zermürbend sein. Haben Sie noch Schmerzen im Bein, oder hat es sich heute Morgen gebessert?' },
]

export default function HomePage() {
  const [activeSignal, setActiveSignal] = useState(0)
  const [visibleCount, setVisibleCount] = useState(0)
  const [showTyping, setShowTyping] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Animated chat preview — loops through demo messages
  useEffect(() => {
    const schedule = (fn: () => void, ms: number) => {
      timerRef.current = setTimeout(fn, ms)
    }

    function runSequence() {
      setVisibleCount(0)
      setShowTyping(false)

      schedule(() => setVisibleCount(1), 600)
      schedule(() => setShowTyping(true), 1800)
      schedule(() => { setShowTyping(false); setVisibleCount(2) }, 3000)
      schedule(() => setShowTyping(true), 4200)
      schedule(() => { setShowTyping(false); setVisibleCount(3) }, 6000)
      schedule(runSequence, 10000)
    }

    runSequence()
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [])

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
              Gespräch beginnen
            </Link>
            <Link href="/dashboard" className="text-sm font-medium px-5 py-2 rounded-full text-white transition-opacity hover:opacity-90" style={{ background: 'var(--sage-green)' }}>
              Pflegepersonen-Dashboard
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-24 text-center page-enter">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-8" style={{ background: 'var(--sage-light)', color: 'var(--sage-green)' }}>
          <span className="w-2 h-2 rounded-full bg-sage-500 animate-pulse-soft inline-block"></span>
          KI-gestützte Seniorenbegleitung
        </div>

        <h1 className="font-display text-6xl md:text-7xl font-light leading-tight mb-6" style={{ color: 'var(--text-dark)' }}>
          Eine Begleiterin, die wirklich
          <br />
          <em className="gradient-text not-italic">zuhört & sich kümmert</em>
        </h1>

        <p className="text-xl font-light max-w-2xl mx-auto mb-12" style={{ color: '#5a7060', lineHeight: 1.8 }}>
          ClaraCompanion ist eine einfühlsame KI für ältere Menschen – sie führt warme, natürliche Gespräche auf Deutsch und hält Pflegepersonen diskret über das Wichtigste informiert.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/chat" className="px-8 py-4 rounded-2xl text-white font-medium text-lg transition-all hover:scale-105 hover:shadow-lg shadow-sage-200" style={{ background: 'var(--sage-green)' }}>
            Gespräch starten →
          </Link>
          <Link href="/dashboard" className="px-8 py-4 rounded-2xl font-medium text-lg transition-all hover:scale-105 border-2 border-sage-200" style={{ color: 'var(--text-mid)', background: 'white' }}>
            Pflegepersonen-Dashboard
          </Link>
        </div>

        {/* Animated chat preview */}
        <div className="mt-20 max-w-2xl mx-auto glass rounded-3xl p-6 shadow-xl shadow-sage-100 text-left animate-float">
          <div className="flex items-center gap-2 mb-5 pb-4 border-b border-sage-100">
            <div className="w-3 h-3 rounded-full bg-red-300"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-300"></div>
            <div className="w-3 h-3 rounded-full bg-green-300"></div>
            <span className="ml-2 text-sm font-medium" style={{ color: '#8aaa92' }}>Clara – Begleiterin</span>
            <span className="ml-auto flex items-center gap-1 text-xs" style={{ color: '#8aaa92' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse-soft inline-block"></span>
              Live-Demo
            </span>
          </div>

          <div className="space-y-4 min-h-[140px]">
            {DEMO_CHAT.slice(0, visibleCount).map((msg, i) => (
              <div key={i} className={`flex gap-3 bubble-in ${msg.role === 'user' ? 'justify-end' : ''}`}>
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-sm" style={{ background: 'var(--sage-green)' }}>✦</div>
                )}
                <div
                  className={`px-4 py-3 rounded-2xl text-sm leading-relaxed max-w-xs ${msg.role === 'user' ? 'text-white rounded-tr-sm' : 'rounded-tl-sm'}`}
                  style={msg.role === 'assistant'
                    ? { background: 'var(--sage-light)', color: 'var(--text-dark)' }
                    : { background: 'var(--warm-terra)' }}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {showTyping && (
              <div className="flex gap-3 bubble-in">
                <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-sm" style={{ background: 'var(--sage-green)' }}>✦</div>
                <div className="px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1.5" style={{ background: 'var(--sage-light)' }}>
                  <span className="w-2 h-2 rounded-full typing-dot" style={{ background: 'var(--sage-green)' }}></span>
                  <span className="w-2 h-2 rounded-full typing-dot" style={{ background: 'var(--sage-green)' }}></span>
                  <span className="w-2 h-2 rounded-full typing-dot" style={{ background: 'var(--sage-green)' }}></span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6" style={{ background: 'white' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-5xl font-light mb-4" style={{ color: 'var(--text-dark)' }}>Alles, was Pflegepersonen brauchen</h2>
            <p className="text-lg" style={{ color: '#6b8a70' }}>Mit Einfühlungsvermögen für Senioren und Klarheit für Pflegepersonen entwickelt</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className="card-hover stagger-enter p-8 rounded-2xl border border-sage-100"
                style={{ background: 'var(--bg-main)', animationDelay: `${i * 0.1}s` }}
              >
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="font-display text-xl font-medium mb-2" style={{ color: 'var(--text-dark)' }}>{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#6b8a70' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Signals */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-16">
          <div className="flex-1">
            <h2 className="font-display text-5xl font-light mb-4" style={{ color: 'var(--text-dark)' }}>Wohlbefindenssignale,<br />diskret überwacht</h2>
            <p className="text-base leading-relaxed mb-8" style={{ color: '#6b8a70' }}>
              Clara hört auf das, was wirklich zählt. Jedes Gespräch wird auf Muster analysiert, die Pflegepersonen kennen sollten – klar dargestellt, nie versteckt.
            </p>
            <div className="flex flex-wrap gap-2">
              {SIGNALS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setActiveSignal(i)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeSignal === i ? 'text-white' : 'border border-sage-200'}`}
                  style={activeSignal === i ? { background: 'var(--sage-green)' } : { color: 'var(--text-mid)' }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 glass rounded-3xl p-8 shadow-lg">
            <div className="text-4xl mb-3">
              {['😔', '😴', '🤕', '💊', '🤔', '😰', '🏠'][activeSignal]}
            </div>
            <h4 className="font-display text-2xl mb-2" style={{ color: 'var(--text-dark)' }}>{SIGNALS[activeSignal]} erkannt</h4>
            <p className="text-sm leading-relaxed mb-4" style={{ color: '#6b8a70' }}>
              {SIGNAL_DESCRIPTIONS[activeSignal]}
            </p>
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${SIGNAL_PRIORITY_CLASSES[activeSignal]}`}>
              {SIGNAL_PRIORITIES[activeSignal]}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 text-center" style={{ background: 'var(--sage-green)' }}>
        <h2 className="font-display text-5xl font-light text-white mb-4">Bereit, Clara kennenzulernen?</h2>
        <p className="text-lg mb-10" style={{ color: '#c3d9cc' }}>Beginnen Sie noch heute ein Gespräch mit Ihren Angehörigen.</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/chat" className="px-8 py-4 rounded-2xl font-medium text-lg transition-all hover:scale-105 bg-white" style={{ color: 'var(--sage-green)' }}>
            Gespräch starten →
          </Link>
          <Link href="/dashboard" className="px-8 py-4 rounded-2xl font-medium text-lg transition-all hover:scale-105 border-2 border-white border-opacity-40 text-white">
            Pflegepersonen-Dashboard
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 text-center border-t border-sage-100" style={{ background: 'var(--bg-main)' }}>
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-sm" style={{ background: 'var(--sage-green)' }}>✦</div>
          <span className="font-display text-xl" style={{ color: 'var(--text-dark)' }}>ClaraCompanion</span>
        </div>
        <p className="text-sm" style={{ color: '#8aaa92' }}>Entwickelt mit Sorgfalt · KI-gestützte Seniorenbegleitung</p>
      </footer>
    </main>
  )
}
