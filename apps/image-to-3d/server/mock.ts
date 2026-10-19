/**
 * Fixture-backed stand-in for client.beta.messages, used by `npm run dev:mock`,
 * the Playwright e2e suite and local demos. Fixtures in fixtures/anthropic are
 * real-shaped Messages API responses (content blocks, stop_reason, usage). The
 * mock replays them as the same stream events the SDK yields, so the server
 * code path is identical to production. Never active in production (env.ts).
 *
 * Fixture names: moderate.allow.json / moderate.block.json (the latter when the note says
 * "moderation-test-block"), create.<subject>.json, refine.<subject>.<pass>.json, judge.<subject>.json
 * The subject is chosen by a keyword in the user's notes, else the default.
 */
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import type { BetaMessage, BetaMessageStreamParams, BetaRawMessageStreamEvent } from "@anthropic-ai/sdk/resources/beta/messages/messages";
import type { MessagesApi, MessageStreamLike } from "./claude.js";

const DEFAULT_SUBJECT = "toadstool";

function textOf(params: BetaMessageStreamParams): { system: string; user: string } {
  const system = Array.isArray(params.system) ? params.system.map((b) => b.text).join("\n") : String(params.system ?? "");
  const user = params.messages
    .flatMap((m) => (typeof m.content === "string" ? [m.content] : m.content.map((b) => (b.type === "text" ? b.text : ""))))
    .join("\n");
  return { system, user };
}

export function pickFixture(files: string[], params: BetaMessageStreamParams): string {
  const { system, user } = textOf(params);
  const subjects = [...new Set(files.filter((f) => !f.startsWith("moderate.")).map((f) => f.split(".")[1]).filter(Boolean))];
  const notes = /Notes from the user[^"]*"""([\s\S]*?)"""/.exec(user)?.[1]?.toLowerCase() ?? "";
  const subject = subjects.find((s) => notes.includes(s)) ?? (subjects.includes(DEFAULT_SUBJECT) ? DEFAULT_SUBJECT : subjects[0]);
  if (system.startsWith("You compare a 3D render")) return `judge.${subject}.json`;
  // moderation: a note containing the test phrase is blocked, everything else is allowed
  if (system.startsWith("You are a content-safety reviewer")) return user.toLowerCase().includes("moderation-test-block") ? "moderate.block.json" : "moderate.allow.json";
  const pass = /COMPARE AND FIX, pass (\d+)/.exec(user)?.[1];
  if (pass) {
    const available = files
      .filter((f) => f.startsWith(`refine.${subject}.`))
      .map((f) => Number(f.split(".")[2]))
      .sort((a, b) => a - b);
    const n = available.filter((x) => x <= Number(pass)).pop() ?? available[0];
    return `refine.${subject}.${n}.json`;
  }
  return `create.${subject}.json`;
}

function chunk(s: string, size: number): string[] {
  const out: string[] = [];
  for (let i = 0; i < s.length; i += size) out.push(s.slice(i, i + size));
  return out;
}

export function messageToEvents(msg: BetaMessage): BetaRawMessageStreamEvent[] {
  const events: BetaRawMessageStreamEvent[] = [];
  events.push({
    type: "message_start",
    message: { ...msg, content: [], stop_reason: null, usage: { ...msg.usage, output_tokens: 1 } },
  } as BetaRawMessageStreamEvent);
  msg.content.forEach((block, index) => {
    if (block.type === "thinking") {
      events.push({ type: "content_block_start", index, content_block: { ...block, thinking: "" } } as BetaRawMessageStreamEvent);
      for (const t of chunk(block.thinking, 48)) events.push({ type: "content_block_delta", index, delta: { type: "thinking_delta", thinking: t } } as BetaRawMessageStreamEvent);
      events.push({ type: "content_block_delta", index, delta: { type: "signature_delta", signature: block.signature } } as BetaRawMessageStreamEvent);
    } else if (block.type === "text") {
      events.push({ type: "content_block_start", index, content_block: { type: "text", text: "", citations: null } } as BetaRawMessageStreamEvent);
      for (const t of chunk(block.text, 160)) events.push({ type: "content_block_delta", index, delta: { type: "text_delta", text: t } } as BetaRawMessageStreamEvent);
    } else {
      events.push({ type: "content_block_start", index, content_block: block } as BetaRawMessageStreamEvent);
    }
    events.push({ type: "content_block_stop", index } as BetaRawMessageStreamEvent);
  });
  events.push({
    type: "message_delta",
    delta: { stop_reason: msg.stop_reason, stop_sequence: null },
    usage: { output_tokens: msg.usage.output_tokens },
  } as BetaRawMessageStreamEvent);
  events.push({ type: "message_stop" } as BetaRawMessageStreamEvent);
  return events;
}

export function fixtureMessagesApi(dir: string, delayMs = 12): MessagesApi {
  const files = readdirSync(dir).filter((f) => f.endsWith(".json"));
  return {
    stream(params: BetaMessageStreamParams, options?: { signal?: AbortSignal }): MessageStreamLike {
      const name = pickFixture(files, params);
      const msg = JSON.parse(readFileSync(path.join(dir, name), "utf8")) as BetaMessage;
      // a fixture recorded on one model still reports the requested model, so pricing follows the UI choice
      const final: BetaMessage = { ...msg, model: params.model };
      const events = messageToEvents(final);
      return {
        async *[Symbol.asyncIterator]() {
          for (const ev of events) {
            if (options?.signal?.aborted) throw new Error("aborted");
            if (delayMs && ev.type === "content_block_delta") await new Promise((r) => setTimeout(r, delayMs));
            yield ev;
          }
        },
        async finalMessage() {
          return final;
        },
      };
    },
  };
}
