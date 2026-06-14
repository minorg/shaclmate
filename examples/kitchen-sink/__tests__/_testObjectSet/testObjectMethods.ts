import dataFactory from "@rdfx/data-factory";
import { describe, it } from "vitest";
import * as kitchenSink from "../../src/index.js";
import { data } from "./data.js";
import type { ObjectSetFactory } from "./ObjectSetFactory.js";
import { objectDataset } from "./objectDataset.js";

export function testObjectMethods(createObjectSet: ObjectSetFactory) {
  describe("object methods", () => {
    it("missing", async ({ expect }) => {
      const objectSet = createObjectSet(objectDataset(data.termObjects));
      expect(
        await objectSet.termsStruct(
          dataFactory.namedNode("http://example.com/nonextant"),
        ),
      ).toBeLeft();
    });

    describe("union", () => {
      it("with fromRdfType", async ({ expect }) => {
        const objectSet = createObjectSet(objectDataset(data.unionObjects));
        for (const expectedUnion of data.unionObjects) {
          expect(
            kitchenSink.Union.equals(
              (
                await objectSet.union(expectedUnion.$identifier())
              ).unsafeCoerce(),
              expectedUnion as any,
            ).unsafeCoerce(),
          ).toBe(true);
        }
      });

      it("without fromRdfType", async ({ expect }) => {
        const objectSet = createObjectSet(
          objectDataset(data.noRdfTypeUnionObjects),
        );
        for (const expectedUnion of data.noRdfTypeUnionObjects) {
          const actualUnion = (
            await objectSet.noRdfTypeUnion(expectedUnion.$identifier())
          ).unsafeCoerce();
          const equalsResult = kitchenSink.NoRdfTypeUnion.equals(
            expectedUnion,
            actualUnion,
          );
          expect(equalsResult.unsafeCoerce()).toBe(true);
        }
      });
    });
  });
}
