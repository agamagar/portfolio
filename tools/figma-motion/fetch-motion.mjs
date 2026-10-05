#!/usr/bin/env node
// Fetch a node's motion cohort straight from the Figma DESKTOP app's MCP
// server, no agent in the loop.
//
//   node tools/figma-motion/fetch-motion.mjs 80:2601 > specs/caratlane-motion.json
//
// WHY THE DESKTOP SERVER. REST carries no motion data at all, and the cloud
// MCP answers "you don't have edit access" for this file (see README §0). The
// desktop app rides the user's own seat and serves MCP over plain HTTP on
// localhost, so a script can ask it directly. Requirements, both hard:
//   - the Figma desktop app is running
//   - the file containing the node is the ACTIVE tab
//     (open figma://file/<key> first if it is not)
//
// The transport is Streamable HTTP MCP: initialize, then tools/call, and every
// response may arrive SSE-framed (`data: {...}` lines) rather than as bare
// JSON. Both shapes are handled below because the app has answered in both.

const nodeId = process.argv[2];
if (!nodeId) {
  console.error("usage: fetch-motion.mjs <nodeId>  (e.g. 80:2601)");
  process.exit(1);
}

// The desktop app's fixed MCP port. Probe a couple of neighbours in case a
// future build moves it.
const PORTS = [3845, 3846, 12006];

function unwrap(text) {
  // SSE frames: take the last `data:` line, which carries the JSON-RPC result.
  if (text.trimStart().startsWith("data:") || text.includes("\ndata:")) {
    const lines = text.split("\n").filter((l) => l.startsWith("data:"));
    return JSON.parse(lines[lines.length - 1].slice(5));
  }
  return JSON.parse(text);
}

async function rpc(port, sessionId, body) {
  const res = await fetch(`http://127.0.0.1:${port}/mcp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json, text/event-stream",
      ...(sessionId ? { "mcp-session-id": sessionId } : {}),
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} on port ${port}`);
  return { data: unwrap(await res.text()), session: res.headers.get("mcp-session-id") };
}

let lastErr;
for (const port of PORTS) {
  try {
    const init = await rpc(port, null, {
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {
        protocolVersion: "2024-11-05",
        capabilities: {},
        clientInfo: { name: "figma-motion-fetch", version: "1.0.0" },
      },
    });
    const session = init.session;
    // the initialized notification is part of the handshake, not optional
    await fetch(`http://127.0.0.1:${port}/mcp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json, text/event-stream",
        ...(session ? { "mcp-session-id": session } : {}),
      },
      body: JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized" }),
    });
    const call = await rpc(port, session, {
      jsonrpc: "2.0",
      id: 2,
      method: "tools/call",
      params: {
        name: "get_motion_context",
        arguments: {
          nodeId,
          recursive: true,
          clientFrameworks: "react",
          clientLanguages: "javascript",
        },
      },
    });
    if (call.data.error) throw new Error(call.data.error.message);
    // tool results wrap the payload as [{type:"text", text:"<json>"}]
    const content = call.data.result?.content?.[0]?.text;
    if (!content) throw new Error("no content in tool result");
    // validate it parses, then emit pretty
    process.stdout.write(JSON.stringify(JSON.parse(content), null, 2) + "\n");
    process.exit(0);
  } catch (e) {
    lastErr = e;
  }
}
console.error(`could not fetch motion for ${nodeId}: ${lastErr?.message}
Is the Figma desktop app running with the file as the active tab?`);
process.exit(1);
