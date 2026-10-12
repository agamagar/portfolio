// Runs in its own vitest worker: hardenRealm() poisons this realm on purpose.
import * as THREE from "three";
import { describe, expect, it } from "vitest";
import { checkSnippet, hardenRealm, runSnippet } from "../src/three/snippet";
import { fixtureSpec } from "./helpers";

describe("hardenRealm", () => {
  const ESCAPE = `const c = "constr" + "uctor"; const F = [][c][c]; if (F) { return F("return 1")(); } return new THREE.BoxGeometry(1, 1, 1);`;

  it("the computed-constructor escape gets past the static check (so the realm must be hardened)", () => {
    expect(checkSnippet(ESCAPE)).toBeNull();
  });

  it("after hardening, the escape reaches no Function constructor", () => {
    hardenRealm();
    const out = runSnippet(THREE, ESCAPE);
    expect(out.position.length).toBeGreaterThan(0); // fell through to the box: F was undefined
    expect(([] as unknown[]).constructor.constructor).toBeUndefined();
    expect((async () => {}).constructor).toBeUndefined();
  });

  it("three.js geometry code still works in a hardened realm", () => {
    hardenRealm();
    const out = runSnippet(THREE, fixtureSpec("create.robot.json").customParts[0].code);
    expect(out.position.length).toBeGreaterThan(100);
  });
});
