const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { defineSecret, defineString } = require('firebase-functions/params');
const PROMPTS = require('./prompts');

// Free key from https://aistudio.google.com/apikey, then:
//   firebase functions:secrets:set GEMINI_API_KEY
const GEMINI_API_KEY = defineSecret('GEMINI_API_KEY');
// Change in functions/.env (GEMINI_MODEL=...) if Google retires this model.
const GEMINI_MODEL = defineString('GEMINI_MODEL', { default: 'gemini-2.5-flash' });

const MAX_MESSAGES = 30;
const MAX_CHARS = 8000;

const LANGUAGE_NOTES = {
  zh: '\n\nAlways reply in Simplified Chinese (简体中文), keeping £ for prices and English for UK brand and app names.',
};

exports.chat = onCall({ secrets: [GEMINI_API_KEY] }, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Sign in to use the assistant.');
  }

  const { bot, messages, lang } = request.data || {};
  const prompt = PROMPTS[bot];
  if (!prompt) {
    throw new HttpsError('invalid-argument', 'Unknown assistant.');
  }

  const valid = Array.isArray(messages) &&
    messages.length > 0 &&
    messages.every(m =>
      (m?.role === 'user' || m?.role === 'assistant') &&
      typeof m.content === 'string' &&
      m.content.length > 0 &&
      m.content.length <= MAX_CHARS);
  if (!valid) {
    throw new HttpsError('invalid-argument', 'Invalid conversation.');
  }

  // Keep only the most recent turns, starting on a user message.
  let recent = messages.slice(-MAX_MESSAGES);
  while (recent.length && recent[0].role !== 'user') recent = recent.slice(1);

  const model = GEMINI_MODEL.value();
  const generationConfig = { maxOutputTokens: 1500 };
  // 2.5 models "think" by default, which is slower and eats the output budget.
  if (model.startsWith('gemini-2.5')) generationConfig.thinkingConfig = { thinkingBudget: 0 };

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': GEMINI_API_KEY.value(),
        },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: prompt + (LANGUAGE_NOTES[lang] || '') }] },
          contents: recent.map(m => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }],
          })),
          generationConfig,
        }),
      },
    );
    const body = await res.json();
    if (!res.ok) {
      console.error('Gemini error:', res.status, body?.error?.message);
      // 429 = free-tier quota used up for now.
      throw new HttpsError(res.status === 429 ? 'resource-exhausted' : 'internal',
        'The assistant is unavailable right now.');
    }
    const text = body.candidates?.[0]?.content?.parts
      ?.map(p => p.text || '')
      .join('')
      .trim();
    return { reply: text || null };
  } catch (err) {
    if (err instanceof HttpsError) throw err;
    console.error('Gemini request failed:', err.message);
    throw new HttpsError('internal', 'The assistant is unavailable right now.');
  }
});
