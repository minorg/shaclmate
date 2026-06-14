import { describe, it } from "vitest";
import * as kitchenSink from "../src/index.js";
import { harnesses } from "./harnesses.js";

describe("isType", () => {
  it("should work on a union", ({ expect }) => {
    expect(
      kitchenSink.Union.isUnion(harnesses.unionMember1.instance),
    ).toStrictEqual(true);
    expect(
      kitchenSink.Union.isUnion(harnesses.unionMember2.instance),
    ).toStrictEqual(true);
  });
});
