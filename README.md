# AI Web Browser

A desktop browser app with an AI-powered search sidebar and browser view.

## Features
- Browser-like interface with back, forward, reload, and address bar
- Search using Google, DuckDuckGo, or Bing
- AI result panel that uses the DuckDuckGo instant answer API
- Electron desktop app structure for Windows packaging

## Run locally

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the app:
   ```bash
   npm start
   ```

## Package for Windows (.exe)

From a Windows machine or environment with Electron Builder configured:

```bash
npm run dist
```

This will generate a Windows installer in the `dist` folder.

## Notes
- The AI feature uses the public DuckDuckGo instant answer API for fast answers and summaries.
- For advanced AI features with your own model or API key, you can extend the app to call OpenAI, Gemini, or a custom backend.
