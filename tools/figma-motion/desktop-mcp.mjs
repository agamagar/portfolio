// Minimal Streamable-HTTP MCP client for the Figma DESKTOP app's local server
// (http://127.0.0.1:3845/mcp). Same transport notes as fetch-motion.mjs: the
// app answers either bare JSON or SSE-framed `data:` lines; both are handled.
//
//   import { connect } from "./desktop-mcp.mjs";
//   const mcp = await connect();
//   const tools = await mcp.listTools();
//   const out = await mcp.call("use_figma", { code: "return 1" });

const PORTS = [3845, 3846, 12006];

function unwrap(text) {
  if (text.trimStart().startsWith("data:") || text.includes("\ndata:")) {
    const lines = text.split("\n").filter((l) => l.startsWith("data:"));
    return JSON.parse(lines[lines.length - 1].slice(5));
  }
  return JSON.parse(text);
}

async function post(port, session, body) {
  const res = await fetch(`http://127.0.0.1:${port}/mcp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json, text/event-stream",
      ...(session ? { "mcp-session-id": session } : {}),
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} on port ${port}`);
  const text = await res.text();
  return { data: text ? unwrap(text) : null, session: res.headers.get("mcp-session-id") };
}

export async function connect() {
  let lastErr;
  for (const port of PORTS) {
    try {
      const init = await post(port, null, {
        jsonrpc: "2.0",
        id: 1,
        method: "initialize",
        params: {
          protocolVersion: "2024-11-05",
          capabilities: {},
          clientInfo: { name: "figma-motion-tokens", version: "1.0.0" },
        },
      });
      const session = init.session;
      await post(port, session, { jsonrpc: "2.0", method: "notifications/initialized" });
      let id = 2;
      return {
        port,
        async listTools() {
          const r = await post(port, session, { jsonrpc: "2.0", id: id++, method: "tools/list", params: {} });
          if (r.data.error) throw new Error(r.data.error.message);
          return r.data.result.tools;
        },
        async call(name, args) {
          const r = await post(port, session, {
            jsonrpc: "2.0",
            id: id++,
            method: "tools/call",
            params: { name, arguments: args },
          });
          if (r.data.error) throw new Error(r.data.error.message);
          return r.data.result;
        },
      };
    } catch (e) {
      lastErr = e;
    }
  }
  throw new Error(
    `no Figma desktop MCP server on ${PORTS.join("/")}: ${lastErr?.message}\n` +
      "Enable it in Figma desktop (Dev Mode > MCP panel) with the file as the active tab.",
  );
}

// `node desktop-mcp.mjs` on its own lists the tools the desktop server offers.
if (process.argv[1] && process.argv[1].endsWith("desktop-mcp.mjs")) {
  const mcp = await connect();
  const tools = await mcp.listTools();
  console.log(`port ${mcp.port}, ${tools.length} tools`);
  for (const t of tools) console.log(`- ${t.name}: ${(t.description || "").slice(0, 110).replace(/\n/g, " ")}`);
}
