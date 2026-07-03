import { describe, it } from "vitest";
import * as kitchenSink from "../src/index.js";
import { harnesses } from "./harnesses.js";

describe("typeGuard", () => {
  it("should work on a union", ({ expect }) => {
    expect(
      kitchenSink.DiscriminatedUnion.isDiscriminatedUnion(
        harnesses.discriminatedUnionMember1.instance,
      ),
    ).toStrictEqual(true);
    expect(
      kitchenSink.DiscriminatedUnion.isDiscriminatedUnion(
        harnesses.discriminatedUnionMember2.instance,
      ),
    ).toStrictEqual(true);
  });
});
