import React, { useMemo, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// --- Client-side offline fallback (tiny dictionary) ---
const OFFLINE_DICT = {
  French: {
    "hello": "bonjour", "hi": "salut", "how": "comment", "are": "êtes",
    "you": "vous", "you?": "vous ?", "i": "je", "am": "suis", "fine": "bien",
    "thank": "merci", "thanks": "merci", "please": "s'il vous plaît",
    "good": "bon", "morning": "matin", "night": "nuit", "love": "amour",
    "cat": "chat", "dog": "chien", "food": "nourriture", "water": "eau",
    "where": "où", "is": "est", "the": "le", "a": "un", "this": "ceci"
  },
  Spanish: {
    "hello": "hola", "hi": "hola", "how": "cómo", "are": "estás",
    "you": "tú", "you?": "tú?", "i": "yo", "am": "estoy", "fine": "bien",
    "thank": "gracias", "thanks": "gracias", "please": "por favor",
    "good": "buen", "morning": "día", "night": "noche", "love": "amor",
    "cat": "gato", "dog": "perro", "food": "comida", "water": "agua",
    "where": "dónde", "is": "está", "the": "el", "a": "un", "this": "esto"
  },
  Japanese: {
    "hello": "こんにちは", "hi": "やあ", "how": "どう", "are": "ですか",
    "you": "あなた", "you?": "あなた？", "i": "わたし", "am": "です", "fine": "元気",
    "thank": "ありがとう", "thanks": "ありがとう", "please": "お願いします",
    "good": "良い", "morning": "朝", "night": "夜", "love": "愛",
    "cat": "猫", "dog": "犬", "food": "食べ物", "water": "水",
    "where": "どこ", "is": "は", "the": "", "a": "", "this": "これ"
  }
}
function clientOfflineTranslate(text, targetLang) {
  const dict = OFFLINE_DICT[targetLang] || {}
  return text.split(/(\b)/).map(tok => {
    const lower = tok.toLowerCase()
    if (dict[lower]) {
      if (/^[A-Z]/.test(tok)) {
        const t = dict[lower]
        return /[a-z]/i.test(t) ? t.charAt(0).toUpperCase() + t.slice(1) : t
      }
      return dict[lower]
    }
    return tok
  }).join('')
}

const LANGS = [
  { id: 'French', code: 'fr', label: 'French', flag: '🇫🇷' },
  { id: 'Spanish', code: 'es', label: 'Spanish', flag: '🇪🇸' },
  { id: 'Japanese', code: 'ja', label: 'Japanese', flag: '🇯🇵' },
]

export default function App() {
  const [text, setText] = useState('How are you?')
  const [lang, setLang] = useState('French')
  const [translated, setTranslated] = useState('')
  const [loading, setLoading] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [toast, setToast] = useState('')
  const selected = useMemo(() => LANGS.find(l => l.id === lang), [lang])

  async function handleTranslate(e) {
    e.preventDefault()
    if (!text.trim()) return
    setLoading(true)
    setTranslated('')
    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, targetLang: selected.label })
      })
      if (!res.ok) throw new Error('Request failed')
      const data = await res.json()
      setTranslated(data.translation)
      setShowResult(true)
      setToast(`Translated to ${selected.label} ${selected.flag}`)
    } catch (err) {
      const fallback = clientOfflineTranslate(text, selected.label)
      setTranslated(fallback || '⚠️ Translation failed. (offline fallback unavailable)')
      setShowResult(true)
      setToast('Offline demo translation')
      console.warn('Using client-side offline translation:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!toast) return
    const id = setTimeout(() => setToast(''), 2000)
    return () => clearTimeout(id)
  }, [toast])

  function reset() {
    setTranslated('')
    setText('How are you?')
    setLang('French')
    setShowResult(false)
  }

  return (
    <div className="min-h-screen">
      {/* banner */}
      <header className="w-full bg-slate-900 text-white">
        <div className="mx-auto max-w-3xl px-4 py-5 flex items-center gap-3">
          <div className="text-3xl">🦜</div>
          <div className="leading-tight">
            <div className="text-2xl font-bold text-emerald-400">PollyGlot</div>
            <div className="text-sm text-slate-300">Perfect Translation Every Time</div>
          </div>
        </div>
      </header>

      {/* single card */}
      <main className="mx-auto max-w-3xl p-4">
        <div className="relative rounded-xl border border-slate-300 bg-white shadow-card p-4 md:p-6 overflow-hidden">
          {/* Toast */}
          <div className="absolute top-3 right-3 z-10">
            <AnimatePresence>
              {toast && (
                <motion.div
                  initial={{ y: -8, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -8, opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  className="rounded-lg bg-emerald-100 text-emerald-900 text-sm px-3 py-2 shadow"
                >
                  {toast}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Views */}
          <div className="relative min-h-[280px]">
            <AnimatePresence initial={false} mode="wait">
              {!showResult ? (
                <motion.section
                  key="input"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                >
                  <h2 className="text-sky-700 font-semibold mb-3">Text to translate <span className="ml-1">👇</span></h2>

                  <textarea
                    className="w-full h-32 rounded-md border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-600 px-3 py-2 text-slate-800"
                    value={text}
                    onChange={e => setText(e.target.value)}
                  />

                  <div className="mt-4">
                    <p className="text-sky-700 font-semibold mb-2">Select language <span className="ml-1">👇</span></p>
                    <div className="space-y-2">
                      {LANGS.map((l) => (
                        <label key={l.id} className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="radio"
                            name="lang"
                            className="accent-brand-700"
                            checked={lang === l.id}
                            onChange={() => setLang(l.id)}
                          />
                          <span className="text-slate-800">{l.label}</span>
                          <span className="text-xl">{l.flag}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleTranslate}
                    disabled={loading}
                    className="mt-5 w-full rounded-md bg-brand-700 text-white font-semibold py-3 disabled:opacity-60 disabled:cursor-not-allowed hover:brightness-110 transition"
                  >
                    {loading ? 'Translating…' : 'Translate'}
                  </button>
                </motion.section>
              ) : (
                <motion.section
                  key="result"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                >
                  <h2 className="text-sky-700 font-semibold mb-3">Original text <span className="ml-1">👇</span></h2>
                  <div className="h-20 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-slate-700 flex items-center">
                    {text}
                  </div>

                  <h2 className="text-sky-700 font-semibold mt-4 mb-3">Your translation <span className="ml-1">👇</span></h2>
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className="min-h-20 rounded-md border border-slate-200 bg-slate-50 px-3 py-3 text-slate-800"
                  >
                    {translated || <span className="text-slate-400">—</span>}
                  </motion.div>

                  <button
                    onClick={reset}
                    className="mt-5 w-full rounded-md bg-slate-800 text-white font-semibold py-3 hover:brightness-110 transition"
                  >
                    Start Over
                  </button>
                </motion.section>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  )
}