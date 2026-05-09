import { describe, it } from "vitest";
import { harnesses } from "./harnesses.js";

describe("identifier", () => {
  it("use a blank node if no $identifier is specified", ({ expect }) => {
    expect(
      harnesses.blankNodeOrIriIdentifierClassWithoutExplicitIdentifier.instance.$identifier()
        .termType,
    ).toStrictEqual("BlankNode");
    expect(
      harnesses.blankNodeOrIriIdentifierInterfaceWithoutExplicitIdentifier.instance.$identifier()
        .termType,
    ).toStrictEqual("BlankNode");
  });
});
