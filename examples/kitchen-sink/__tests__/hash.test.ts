import { sha256 } from "js-sha256";
import { describe, it } from "vitest";
import { harnesses } from "./harnesses.js";

describe("hash", () => {
  it("known hash", ({ expect }) => {
    expect(
      harnesses.nonClassStruct.staticSide
        .hash(sha256.create(), harnesses.nonClassStruct.instance)
        .hex(),
    ).toStrictEqual(
      "9aa796c784f263a7941e3f5d63ba5ed2d07ffb6ab039db22f50ee68b3712dd1a",
    );
  });
});
