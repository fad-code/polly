

import OpenAI from 'openai';

async function parseJSONBody(req) {
  if (req.body) return req.body;
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  try {
    const raw = Buffer.concat(chunks).toString('utf8');
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

// Naive offline dictionary-based translator for demo purposes.
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

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { text, targetLang } = await parseJSONBody(req);
    if (!text || !targetLang) {
      res.status(400).json({ error: 'Missing text/targetLang' });
      return;
    }

    
    const apiKey = process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_GPT || process.env.NEXT_PUBLIC_OPENAI_API_KEY;
    if (!apiKey) {
      const translation = simpleOfflineTranslate(text, targetLang);
      res.status(200).json({
        translation,
        mode: 'offline',
        note: 'Offline dictionary-based translation (demo). Add OPENAI_API_KEY in Vercel to enable AI mode.'
      });
      return;
    }

    // Online mode (OpenAI Responses API)
    const openai = new OpenAI({ apiKey });
    const prompt = `Translate the following text to ${targetLang}.
- Be natural and idiomatic.
- Keep punctuation and tone.
- Return only the translation.

Text: ${text}`;

    const response = await openai.responses.create({
      model: 'gpt-4o-mini',
      input: prompt,
    });

    const translation = (response && (response.output_text || '').trim()) || '';
    if (!translation) {
      throw new Error('No translation received from model.');
    }

    res.status(200).json({ translation, mode: 'online' });
  } catch (err) {
 
    try {
      const { text, targetLang } = await parseJSONBody(req);
      const translation = simpleOfflineTranslate(text || '', targetLang || 'French');
      res.status(200).json({
        translation,
        mode: 'offline-fallback',
        note: 'AI call failed; used offline dictionary-based translation.'
      });
    } catch {
      res.status(500).json({ error: 'Translation failed.' });
    }
  }
}
