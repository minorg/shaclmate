import { describe, it } from "vitest";
import { data } from "./data.js";
import type { ObjectSetFactory } from "./ObjectSetFactory.js";
import { objectDataset } from "./objectDataset.js";

export function testObjectCountMethods(createObjectSet: ObjectSetFactory) {
  describe("object count methods", () => {
    it("class", async ({ expect }) => {
      const objectSet = createObjectSet(
        objectDataset(data.concreteChildClasses),
      );
      expect(
        (await objectSet.concreteChildClassCount()).unsafeCoerce(),
      ).toStrictEqual(data.concreteChildClasses.length);
    });

    describe("union", () => {
      it("class with fromRdfTypes", async ({ expect }) => {
        const objectSet = createObjectSet(objectDataset(data.classUnions));
        expect(
          (await objectSet.classUnionCount()).unsafeCoerce(),
        ).toStrictEqual(data.classUnions.length);
      });

      it("class without fromRdfTypes", async ({ expect }) => {
        const objectSet = createObjectSet(
          objectDataset(data.noRdfTypeClassUnions),
        );
        expect(
          (await objectSet.noRdfTypeClassUnionCount()).unsafeCoerce(),
        ).toStrictEqual(data.noRdfTypeClassUnions.length);
      });

      it("interface", async ({ expect }) => {
        const objectSet = createObjectSet(objectDataset(data.interfaceUnions));
        expect(
          (await objectSet.interfaceUnionCount()).unsafeCoerce(),
        ).toStrictEqual(data.interfaceUnions.length);
      });
    });
  });
}
