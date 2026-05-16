import { sha256 } from "js-sha256";
import { describe, it } from "vitest";
import { harnesses } from "./harnesses.js";

describe("hash", () => {
  it("known hash", ({ expect }) => {
    expect(
      harnesses.nonClass.staticSide
        .hash(sha256.create(), harnesses.nonClass.instance)
        .hex(),
    ).toStrictEqual(
      "ba44c34b2d16c106158236a335cce5555a54833ea3a49080abc6fcf783ebfbcc",
    );
  });
});
