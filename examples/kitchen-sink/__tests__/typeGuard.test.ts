import { describe, it } from "vitest";
import * as kitchenSink from "../src/index.js";
import { harnesses } from "./harnesses.js";

describe("typeGuard", () => {
  it("should work on a union", ({ expect }) => {
    expect(
      kitchenSink.StructDiscriminatedUnion.isStructDiscriminatedUnion(
        harnesses.structDiscriminatedUnionMember1.instance,
      ),
    ).toStrictEqual(true);
    expect(
      kitchenSink.StructDiscriminatedUnion.isStructDiscriminatedUnion(
        harnesses.structDiscriminatedUnionMember2.instance,
      ),
    ).toStrictEqual(true);
  });
});
