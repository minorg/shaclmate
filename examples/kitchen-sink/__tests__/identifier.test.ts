import { describe, it } from "vitest";
import { harnesses } from "./harnesses.js";

describe("identifier", () => {
  it("use a blank node if no $identifier is specified", ({ expect }) => {
    expect(
      harnesses.blankNodeOrIriIdentifierStructWithoutExplicitIdentifier.instance.$identifier()
        .termType,
    ).toStrictEqual("BlankNode");
  });
});
