import { sha256 } from "js-sha256";
import { describe, it } from "vitest";
import { harnesses } from "./harnesses.js";

describe("hash", () => {
  it("known hash", ({ expect }) => {
    expect(
      harnesses.nonClass.instance.hash(sha256.create()).hex(),
    ).toStrictEqual(
      "051a4288e0371489df27a7cb346e0568e9205ad5aba7e545270ee23e80336600",
    );
  });
});
