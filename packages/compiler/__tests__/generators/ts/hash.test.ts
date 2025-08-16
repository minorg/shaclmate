import { sha256 } from "js-sha256";
import { describe, it } from "vitest";
import { harnesses } from "./harnesses.js";

describe("hash", () => {
  it("known hash", ({ expect }) => {
    expect(
      harnesses.nonClass.instance.hash(sha256.create()).hex(),
    ).toStrictEqual(
      "a4ad9a44edc4b7d6baf915ee46ee55ea09664a226709146e31ded0c07ba92507",
    );
  });
});
