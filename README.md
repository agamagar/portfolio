# Portfolio

Vite + React portfolio site with [Agentation](https://www.agentation.com/) wired in for visual feedback during development.

## Setup

```bash
npm install
```

## Run

```bash
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`). The Agentation toolbar appears in dev only — click the icon bottom-right to start annotating.

## Build

```bash
npm run build
```

## Agentation MCP (recommended)

For real-time sync between annotations and your coding agent (Claude Code, Cursor, etc.), add the MCP server:

```bash
npx add-mcp "npx -y agentation-mcp server"
```

Then start the server in a separate terminal:

```bash
npx agentation-mcp server
```

It runs on port 4747 (matches the `endpoint` in `src/App.jsx`).

Verify the setup:

```bash
npx agentation-mcp doctor
```
