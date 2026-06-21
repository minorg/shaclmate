import { describe, it } from "vitest";
import * as kitchenSink from "../src/index.js";
import { harnesses } from "./harnesses.js";

describe("isType", () => {
  it("should work on a union", ({ expect }) => {
    expect(
      kitchenSink.DiscriminatedUnion.isUnion(
        harnesses.discriminatedUnionMember1.instance,
      ),
    ).toStrictEqual(true);
    expect(
      kitchenSink.DiscriminatedUnion.isUnion(
        harnesses.discriminatedUnionMember2.instance,
      ),
    ).toStrictEqual(true);
  });
});
