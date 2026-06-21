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
            kitchenSink.DiscriminatedUnion.equals(
              (
                await objectSet.discriminatedUnion(expectedUnion.$identifier())
              ).unsafeCoerce(),
              expectedUnion as any,
            ).unsafeCoerce(),
          ).toBe(true);
        }
      });

      it("without fromRdfType", async ({ expect }) => {
        const objectSet = createObjectSet(
          objectDataset(data.noRdfTypeDiscriminatedUnionObjects),
        );
        for (const expectedUnion of data.noRdfTypeDiscriminatedUnionObjects) {
          const actualUnion = (
            await objectSet.noRdfTypeDiscriminatedUnion(
              expectedUnion.$identifier(),
            )
          ).unsafeCoerce();
          const equalsResult = kitchenSink.NoRdfTypeDiscriminatedUnion.equals(
            expectedUnion,
            actualUnion,
          );
          expect(equalsResult.unsafeCoerce()).toBe(true);
        }
      });
    });
  });
}
