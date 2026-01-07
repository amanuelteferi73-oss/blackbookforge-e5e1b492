# FORGE - Personal Execution OS

A private execution system for discipline, identity, and irreversible progress.

## Technology Stack

- React + TypeScript + Vite
- Tailwind CSS
- Lovable Cloud (Backend)

## Local Development

```sh
npm install
npm run dev
```

## Netlify Deployment

1. Connect your GitHub repository to Netlify
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Environment variables needed:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
   - `VITE_SUPABASE_PROJECT_ID`

## Environment Variables

Copy values from your `.env` file to Netlify's environment variables settings.
