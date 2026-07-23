import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// Runs the real api/chat.js serverless function in-process during `vite dev`,
// so local testing exercises the exact same code Vercel runs in production —
// no `vercel login`/CLI/account needed just to try the chat locally.
function localApiPlugin() {
  return {
    name: 'local-api-chat',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url !== '/api/chat' || req.method !== 'POST') return next();

        const chunks = [];
        for await (const chunk of req) chunks.push(chunk);

        let body;
        try {
          body = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
        } catch {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Invalid JSON' }));
          return;
        }
        req.body = body;

        const wrappedRes = {
          status(code) { res.statusCode = code; return this; },
          json(obj) {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(obj));
          },
        };

        try {
          // ssrLoadModule (not a plain import()) so edits to api/chat.js AND
          // anything it imports (src/data/responses.js, etc.) are picked up
          // immediately via Vite's own file watcher — a raw dynamic import
          // only busts the cache for the entry file itself, not its deps.
          const { default: handler } = await server.ssrLoadModule('/api/chat.js');
          await handler(req, wrappedRes);
        } catch (err) {
          console.error('Local /api/chat error:', err);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Internal error' }));
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  // Empty prefix loads all vars from .env/.env.local (not just VITE_-prefixed
  // ones) so GROQ_API_KEY reaches process.env for the plugin above.
  Object.assign(process.env, loadEnv(mode, process.cwd(), ''));

  return {
    plugins: [react({ include: ['**/*.js', '**/*.jsx'] }), localApiPlugin()],
    publicDir: false,
    server: {
      port: 3000,
      open: true,
    },
    build: {
      outDir: 'build',
    },
  };
});
