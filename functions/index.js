const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');
const Anthropic = require('@anthropic-ai/sdk');
const PROMPTS = require('./prompts');

// Set with: firebase functions:secrets:set ANTHROPIC_API_KEY
const ANTHROPIC_API_KEY = defineSecret('ANTHROPIC_API_KEY');

const MAX_MESSAGES = 30;
const MAX_CHARS = 8000;

exports.chat = onCall({ secrets: [ANTHROPIC_API_KEY] }, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Sign in to use the assistant.');
  }

  const { bot, messages } = request.data || {};
  const system = PROMPTS[bot];
  if (!system) {
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

  const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY.value() });
  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1000,
      system,
      messages: recent.map(m => ({ role: m.role, content: m.content })),
    });
    const text = response.content.find(b => b.type === 'text')?.text;
    return { reply: text ?? null };
  } catch (err) {
    console.error('Anthropic error:', err.message);
    throw new HttpsError('internal', 'The assistant is unavailable right now.');
  }
});
