// Talks to our own /api/chat serverless function (never to Groq directly —
// that would expose the API key in the browser bundle).
export async function fetchLlmReply(message, { signal } = {}) {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
    signal,
  });

  if (!res.ok) {
    throw new Error(`Chat API responded with ${res.status}`);
  }

  const data = await res.json();
  if (!data.reply) {
    throw new Error('Chat API returned an empty reply');
  }

  return data.reply;
}
