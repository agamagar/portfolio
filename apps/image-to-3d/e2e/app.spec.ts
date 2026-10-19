import { expect, test, type Page } from "@playwright/test";
import { mkdirSync, readFileSync } from "node:fs";
import path from "node:path";

/**
 * The whole product, once, in order: gate → generate (with live progress) →
 * refine → save → library → viewer → edit → delete. Claude is the fixture
 * replay; everything else (build output, CSP, sandbox worker, WebGL, GLB
 * export, storage) is real. Screenshots land in docs/screenshots for the PR.
 */
const SHOTS = path.resolve("docs/screenshots");
mkdirSync(SHOTS, { recursive: true });
const IMG = (n: string) => path.resolve(`fixtures/images/${n}.png`);

test.describe.configure({ mode: "serial" });

let page: Page;
const cspViolations: string[] = [];
const pageErrors: string[] = [];

test.beforeAll(async ({ browser }) => {
  const ctx = await browser.newContext({ permissions: ["clipboard-read", "clipboard-write"] });
  page = await ctx.newPage();
  page.on("pageerror", (e) => pageErrors.push(e.message));
  page.on("console", (m) => {
    if (/Content Security Policy|Refused to/i.test(m.text())) cspViolations.push(m.text());
  });
});

test.afterAll(() => {
  expect(cspViolations, "no CSP violations").toEqual([]);
  expect(pageErrors, "no uncaught page errors").toEqual([]);
});

async function generate(opts: { file: string; notes?: string; style: string; passes: number; screenshotMidway?: string }) {
  await page.getByTestId("file-input").setInputFiles(IMG(opts.file));
  await expect(page.getByAltText("Front view")).toBeVisible();
  if (opts.notes !== undefined) await page.getByLabel("What is it?").fill(opts.notes);
  await page.getByRole("radio", { name: opts.style }).click();
  const passes = page.locator("#passes");
  while (Number(await passes.textContent()) > opts.passes) await page.getByRole("button", { name: "Fewer passes" }).click();
  while (Number(await passes.textContent()) < opts.passes) await page.getByRole("button", { name: "More passes" }).click();
  await expect(page.locator(".estimate .mono")).toContainText("$");

  await page.getByRole("button", { name: /Generate/ }).click();
  if (opts.screenshotMidway) {
    // first pass is in flight: version 1 built, Claude is comparing
    await expect(page.locator(".step.active").filter({ hasText: "Compare & fix, pass 1" })).toBeVisible();
    await expect(page.locator(".thinking")).toBeVisible();
    await page.waitForTimeout(400);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: `${SHOTS}/${opts.screenshotMidway}` });
  }
  await expect(page.getByRole("button", { name: "Save to library" })).toBeEnabled({ timeout: 90_000 });
  await expect(page.locator(".step.active")).toHaveCount(0);
  await expect(page.locator(".step.error")).toHaveCount(0);
}

async function save(title?: string) {
  await page.getByRole("button", { name: "Save to library" }).click();
  const dialog = page.getByRole("dialog", { name: "Save to library" });
  if (title) await dialog.getByLabel("Title").fill(title);
  await dialog.getByRole("button", { name: "Save" }).click();
  await page.waitForURL(/\/m\/[0-9a-f-]{36}$/);
  await expect(page.locator(".details")).toBeVisible();
}

test("the access gate blocks strangers, and a new account needs an invite code", async () => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Image → 3D" })).toBeVisible();
  const api = await page.request.get("/api/library");
  expect(api.status()).toBe(401);
  await page.getByLabel(/^Email/).fill("ada@example.com");
  await page.getByLabel(/^Invite code/).fill("wrong-code");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("alert")).toContainText("invite code");
  await page.screenshot({ path: `${SHOTS}/login.png` });
  await page.getByLabel(/^Invite code/).fill("beta-e2e");
  await page.getByRole("button", { name: "Sign in" }).click();

  // nothing works until the Terms and Privacy policy are agreed to
  await expect(page.getByRole("heading", { name: "One last thing" })).toBeVisible();
  expect((await page.request.get("/api/library")).status()).toBe(403);
  const cont = page.getByRole("button", { name: "Continue" });
  await expect(cont).toBeDisabled();
  await page.getByRole("checkbox").check();
  await page.screenshot({ path: `${SHOTS}/consent.png` });
  await cont.click();
  await expect(page.getByRole("heading", { name: "New model" })).toBeVisible();
});

test("Terms and Privacy are public pages", async () => {
  await page.getByRole("link", { name: "Privacy" }).click();
  await expect(page.getByRole("heading", { name: "Privacy policy" })).toBeVisible();
  await expect(page.getByText("deleted 24 hours after upload")).toBeVisible();
  await expect(page.getByRole("button", { name: "Delete my account" })).toBeVisible();
  await page.goto("/terms");
  await expect(page.getByRole("heading", { name: "Terms of use" })).toBeVisible();
  await page.goto("/");
});

test("security headers: page CSP, and no model-written-code worker in the public bundle", async () => {
  const res = await page.request.get("/");
  expect(res.headers()["content-security-policy"]).toContain("script-src 'self'");
  expect(res.headers()["content-security-policy"]).not.toContain("unsafe-eval");
  const html = await res.text();
  const js = /src="(\/assets\/index-[^"]+\.js)"/.exec(html)![1];
  const bundle = await (await page.request.get(js)).text();
  expect(bundle).not.toMatch(/sandbox\.worker/);
});

test("generate: image → spec → model, with two compare-and-fix passes", async () => {
  await page.screenshot({ path: `${SHOTS}/create-empty.png` });
  await generate({ file: "toadstool", style: "Clay", passes: 2, screenshotMidway: "generation-in-progress.png" });

  await expect(page.locator(".step.done")).toHaveCount(7); // spec, build ×3, pass ×2, judge
  const versions = page.getByRole("group", { name: "Versions" }).locator(".version");
  await expect(versions).toHaveCount(3);
  await expect(versions.nth(2)).toContainText("best");
  await expect(versions.nth(0).locator(".score")).toHaveText("6.2");
  await expect(versions.nth(2).locator(".score")).toHaveText("8.8");
  await expect(page.locator(".versions .cost")).toContainText("$0.");
  await page.waitForTimeout(3500); // let the toast fade
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: `${SHOTS}/generation-done.png` });

  // a GLB can be downloaded straight away
  const [download] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "GLB" }).click()]);
  const glb = readFileSync((await download.path())!);
  expect(glb.subarray(0, 4).toString("latin1")).toBe("glTF");
  expect(glb.byteLength).toBeGreaterThan(10_000);

  await save();
  await expect(page.getByLabel("Title")).toHaveValue("Toadstool in a pot");
});

test("model-written custom parts are dropped (the robot fixture still carries a gear)", async () => {
  await page.getByRole("link", { name: "Create", exact: true }).click();
  await generate({ file: "robot", notes: "a toy robot", style: "Toon", passes: 1 });
  await page.locator(".notes summary").click();
  await expect(page.locator(".notes")).toContainText("model-written code is not run");
  await save();
});

test("a quick draft with no refinement", async () => {
  await page.getByRole("link", { name: "Create", exact: true }).click();
  await page.getByRole("radio", { name: /Haiku 5\.5/ }).check();
  await generate({ file: "toadstool", notes: "toadstool", style: "Low-poly", passes: 0 });
  await expect(page.getByRole("group", { name: "Versions" }).locator(".version")).toHaveCount(1);
  await save("Toadstool, low-poly draft");
});

test("library: grid, search and tag filters", async () => {
  await page.getByRole("link", { name: "Library", exact: true }).click();
  const cards = page.getByRole("list", { name: "Models" }).locator("li");
  await expect(cards).toHaveCount(3);
  await page.waitForTimeout(3500);
  await page.screenshot({ path: `${SHOTS}/gallery.png` });

  await page.getByLabel("Search models").fill("robot");
  await expect(cards).toHaveCount(1);
  await page.getByLabel("Search models").fill("");
  await page.getByRole("button", { name: "mushroom", exact: true }).click();
  await expect(cards).toHaveCount(2);
  await page.getByRole("button", { name: "Clear" }).click();
  await expect(cards).toHaveCount(3);

  await page.emulateMedia({ colorScheme: "dark" });
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${SHOTS}/gallery-dark.png` });
  await page.emulateMedia({ colorScheme: "light" });
});

test("viewer: style switch, rename, tags, share link, GLB", async () => {
  await page.getByRole("link", { name: /Toy robot/ }).click();
  await expect(page.getByLabel("Title")).toHaveValue("Toy robot");

  await page.getByRole("radio", { name: "Felt" }).click();
  await expect(page.getByRole("button", { name: /Download GLB \(Felt\)/ })).toBeVisible();
  await page.getByRole("radio", { name: "Toon" }).click();
  await page.waitForTimeout(3500); // toasts gone, model settled
  await page.screenshot({ path: `${SHOTS}/viewer.png` });

  await page.getByLabel("Title").fill("Wind-up robot");
  await page.getByLabel("Title").press("Enter");
  await expect(page.getByRole("status").filter({ hasText: "Saved" })).toBeVisible();

  await page.getByLabel("Tags").fill("favourite");
  await page.getByLabel("Tags").press("Enter");
  await expect(page.locator(".tag-input .chip", { hasText: "favourite" })).toBeVisible();

  // share by link: a public, read-only page with a report link (opened in a signed-out context)
  await page.getByRole("button", { name: "Share by link" }).click();
  const shareUrl = await page.getByLabel("Share link").inputValue();
  expect(shareUrl).toMatch(/\/s\/[A-Za-z0-9_-]{20,32}$/);
  const guest = await page.context().browser()!.newContext({ baseURL: new URL(shareUrl).origin });
  const gp = await guest.newPage();
  await gp.goto(shareUrl);
  await expect(gp.getByRole("heading", { name: "Toy robot" })).toBeVisible();
  await expect(gp.getByRole("link", { name: "Download GLB" })).toHaveAttribute("href", /^\/api\/file\?p=/);
  await gp.getByRole("button", { name: "Report this model" }).click();
  await gp.getByRole("dialog").getByRole("button", { name: "Send report" }).click();
  await expect(gp.getByRole("status").filter({ hasText: "Thanks" })).toBeVisible();
  await guest.close();

  const [download] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: /Download GLB/ }).click()]);
  expect(readFileSync((await download.path())!).subarray(0, 4).toString("latin1")).toBe("glTF");

  // persisted
  await page.reload();
  await expect(page.getByLabel("Title")).toHaveValue("Wind-up robot");
});

test("delete removes the model and its files", async () => {
  await page.getByRole("button", { name: "Delete" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toContainText("can't be undone");
  await dialog.getByRole("button", { name: "Delete" }).click();
  await page.waitForURL(/\/library$/);
  await expect(page.getByRole("list", { name: "Models" }).locator("li")).toHaveCount(2);
});

test("signing out locks the app again", async () => {
  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page.getByLabel(/^Email/)).toBeVisible();
  expect((await page.request.get("/api/library")).status()).toBe(401);
});
