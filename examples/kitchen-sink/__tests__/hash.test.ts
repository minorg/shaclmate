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
      "7fec181bb9c77561646fbcb60e9b3ba1b51b2a3a87922fec568acb4d463cd9ec",
    );
  });
});
