# PollyGlot — Vercel-ready (Online + Offline)

This app translates short phrases to **French, Spanish, or Japanese**.  
It works in two modes:

- **Online AI mode** (recommended): Uses OpenAI if `OPENAI_API_KEY` is set.
- **Offline demo mode**: If no key is set, falls back to a tiny dictionary-based translator so it still works for a demo.

## Local dev

```bash
npm i
npm run dev          # Vite dev server (http://localhost:5173)
npm run api          # (optional) Local API at http://localhost:4321
```
When running locally without Vercel, the frontend calls `/api/translate`.  
Either run `npm run api` to start the local Express API, or use `vercel dev` which serves `api/translate.mjs` automatically.

## Deploy to Vercel

1. Push this folder to a Git repo and import it in Vercel.
2. Vercel will run `npm run build` and publish `dist/`.
3. The route `/api/translate` is handled by `api/translate.mjs` (serverless function).
4. (Optional) In **Project Settings → Environment Variables**, add:
   - `OPENAI_API_KEY = <your key>`

If no key is provided, the API will **still work** using the offline dictionary.

## Notes

- The offline dictionary is intentionally small (demo quality).
- To extend languages/quality, either set an API key or expand `dictionaries` in `api/translate.mjs` and `server.js`.
