import { describe, it } from "vitest";
import { parseInputs } from "../src/parseInputs.js";
import { testData } from "./testData.js";
import "@rdfx/testing";

describe("parseInputs", () => {
  describe("well-formed", () => {
    for (const id of [
      "kitchenSinkExample",
    ] satisfies (keyof (typeof testData)["filePaths"])[]) {
      it(id, async ({ expect }) => {
        const { dataset, prefixMap } = (
          await parseInputs([testData.filePaths[id]])
        ).unsafeCoerce();
        expect(dataset.size).toBeGreaterThan(0);
        expect(prefixMap.size).toBeGreaterThan(0);
      });
    }
  });
});
