import { matchTopic } from '../src/data/responses.js';

const CORRECTION_MODEL = 'llama-3.1-8b-instant';
const MAX_MESSAGE_LENGTH = 1000;

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 20;
// Best-effort only: resets whenever the serverless instance cold-starts and
// isn't shared across regions/instances. Good enough to blunt a casual script
// kiddie on a personal-traffic site without paying for external infra.
const requestLog = new Map();

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length) return forwarded.split(',')[0].trim();
  return req.socket?.remoteAddress || 'unknown';
}

function isRateLimited(ip) {
  const now = Date.now();
  const recent = (requestLog.get(ip) || []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  recent.push(now);
  requestLog.set(ip, recent);
  return recent.length > RATE_LIMIT_MAX_REQUESTS;
}

// Cheap, tiny-output call whose only job is to clean up typos/odd phrasing so
// the local keyword matcher has a better shot at finding the right topic.
// Its output is NEVER sent back to the visitor — it only ever feeds into
// matchTopic(), which can only return one of our own hardcoded answers. So
// even a fully "jailbroken" reply here can't leak arbitrary generated text,
// code, or anything else to the user.
async function correctQuery(message, apiKey) {
  const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: CORRECTION_MODEL,
      messages: [
        {
          role: 'system',
          content:
            "Rewrite the user's message as a single, short, clearly-worded question about a person named Hardik Kothari's professional background (career, skills, projects, education, contact info). Fix typos and grammar. Do not answer the question. Do not add commentary. Output only the rewritten question, nothing else.",
        },
        { role: 'user', content: message },
      ],
      temperature: 0.2,
      max_tokens: 60,
    }),
  });

  if (!groqRes.ok) {
    throw new Error(`Groq correction call failed: ${groqRes.status}`);
  }

  const data = await groqRes.json();
  return data.choices?.[0]?.message?.content?.trim() || message;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (isRateLimited(getClientIp(req))) {
    res.status(429).json({ error: 'Too many requests, please slow down' });
    return;
  }

  const { message } = req.body || {};
  if (typeof message !== 'string' || !message.trim()) {
    res.status(400).json({ error: 'Message is required' });
    return;
  }
  if (message.length > MAX_MESSAGE_LENGTH) {
    res.status(400).json({ error: 'Message is too long' });
    return;
  }

  // Pass 1: try the raw message against the local topic list — free, instant,
  // no LLM involved at all. Most well-formed questions resolve right here.
  const rawMatch = matchTopic(message);
  if (rawMatch.matched) {
    console.log(`[chat] local match, no Groq call — "${message}"`);
    res.status(200).json({ reply: rawMatch.answer });
    return;
  }

  // Pass 2: nothing matched locally — ask a small, cheap model to clean up
  // typos/phrasing, then try the local matcher again. Only reached for
  // ambiguous input, so the vast majority of traffic never calls Groq.
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.log('[chat] no GROQ_API_KEY set — using fallback without calling Groq');
    res.status(200).json({ reply: rawMatch.answer });
    return;
  }

  try {
    console.log(`[chat] no local match, calling Groq to correct — "${message}"`);
    const corrected = await correctQuery(message.trim(), apiKey);
    const finalMatch = matchTopic(corrected);
    console.log(`[chat] Groq corrected to "${corrected}" — matched: ${finalMatch.matched}`);
    res.status(200).json({ reply: finalMatch.answer });
  } catch (err) {
    console.error('[chat] Groq correction call failed, using fallback:', err.message);
    res.status(200).json({ reply: rawMatch.answer });
  }
}
