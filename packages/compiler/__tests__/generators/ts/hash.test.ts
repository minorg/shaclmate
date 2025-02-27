import { sha256 } from "js-sha256";
import { describe, it } from "vitest";
import { harnesses } from "./harnesses.js";

describe("hash", () => {
  it("known hash", ({ expect }) => {
    expect(
      harnesses.nonClassNodeShape.instance.hash(sha256.create()).hex(),
    ).toStrictEqual(
      "6a95d767e58335664a3c003286250ef462e09ed2b4b0b76c598a0ae16ff0cb37",
    );
  });
});
