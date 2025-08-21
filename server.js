
import express from 'express'
import dotenv from 'dotenv'
import OpenAI from 'openai'

dotenv.config()
const app = express()
app.use(express.json())

// Naive offline dictionary-based translator for local dev
const dictionaries = {
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
};

function simpleOfflineTranslate(text, targetLang) {
  const dict = dictionaries[targetLang] || {};
  return text.split(/(\b)/).map(tok => {
    const lower = tok.toLowerCase();
    if (dict[lower]) {
      if (/^[A-Z]/.test(tok)) {
        const t = dict[lower];
        return /[a-z]/i.test(t) ? t.charAt(0).toUpperCase() + t.slice(1) : t;
      }
      return dict[lower];
    }
    return tok;
  }).join('');
}

app.post('/api/translate', async (req, res) => {
  const { text, targetLang } = req.body || {}
  if (!text || !targetLang) return res.status(400).json({ error: 'Missing text/targetLang' })
  try {
    const apiKey = process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_GPT || process.env.NEXT_PUBLIC_OPENAI_API_KEY
    if (!apiKey) {
      const translation = simpleOfflineTranslate(text, targetLang);
      return res.json({ translation, mode: 'offline', note: 'No OPENAI_API_KEY set. Using local dictionary.' });
    }

    const openai = new OpenAI({ apiKey })
    const prompt = `Translate the following text to ${targetLang}.
- Be natural and idiomatic.
- Keep punctuation and tone.
- Return only the translation.

Text: ${text}`
    const response = await openai.responses.create({ model: 'gpt-4o-mini', input: prompt })
    const translation = (response && (response.output_text || '').trim()) || ''
    if (!translation) throw new Error('Empty translation')

    res.json({ translation, mode: 'online' })
  } catch (err) {
    // Last resort fallback
    const { text, targetLang } = req.body || {}
    const translation = simpleOfflineTranslate(text || '', targetLang || 'French');
    res.json({ translation, mode: 'offline-fallback' })
  }
})

const PORT = process.env.PORT || 4321
app.listen(PORT, () => console.log(`API server running on http://localhost:${PORT}`))
