import dataFactory from "@rdfx/data-factory";
import * as kitchenSink from "@shaclmate/kitchen-sink-example";
import { describe, it } from "vitest";
import { data } from "./data.js";
import type { ObjectSetFactory } from "./ObjectSetFactory.js";
import { objectDataset } from "./objectDataset.js";

export function testObjectMethods(createObjectSet: ObjectSetFactory) {
  describe("object methods", () => {
    it("concrete child", async ({ expect }) => {
      const objectSet = createObjectSet(objectDataset(data.classHierarchy3s));
      expect(
        kitchenSink.ClassHierarchy3.equals(
          (
            await objectSet.classHierarchy3(
              data.classHierarchy3s[0].$identifier(),
            )
          ).unsafeCoerce(),
          data.classHierarchy3s[0],
        ).unsafeCoerce(),
      ).toBe(true);
    });

    it("concrete parent", async ({ expect }) => {
      const objectSet = createObjectSet(objectDataset(data.classHierarchy3s));
      const expectedObject = data.classHierarchy3s[0];
      const actualObject = (
        await objectSet.classHierarchy2(expectedObject.$identifier())
      ).unsafeCoerce();
      expect(actualObject.classHierarchy0Property).toStrictEqual(
        expectedObject.classHierarchy0Property,
      );
      expect(actualObject.classHierarchy2Property).toStrictEqual(
        expectedObject.classHierarchy2Property,
      );
    });

    it("missing", async ({ expect }) => {
      const objectSet = createObjectSet(objectDataset(data.classHierarchy3s));
      expect(
        await objectSet.classHierarchy3(
          dataFactory.namedNode("http://example.com/nonextant"),
        ),
      ).toBeLeft();
    });

    describe("union", () => {
      it("with fromRdfType", async ({ expect }) => {
        const objectSet = createObjectSet(objectDataset(data.unions));
        for (const expectedUnion of data.unions) {
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
        const objectSet = createObjectSet(objectDataset(data.noRdfTypeUnions));
        for (const expectedUnion of data.noRdfTypeUnions) {
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
