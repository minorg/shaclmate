import type * as kitchenSink from "@shaclmate/kitchen-sink-example";
import { describe, it } from "vitest";
import { data } from "./data.js";

export function testObjectCountMethods(
  createObjectSet: (
    ...instances: kitchenSink.$Object[]
  ) => kitchenSink.$ObjectSet,
) {
  describe("object count methods", () => {
    it("class", async ({ expect }) => {
      const objectSet = createObjectSet(...data.concreteChildClasses);
      expect(
        (await objectSet.concreteChildClassCount()).unsafeCoerce(),
      ).toStrictEqual(data.concreteChildClasses.length);
    });

    describe("union", () => {
      it("class with fromRdfTypes", async ({ expect }) => {
        const objectSet = createObjectSet(...data.classUnions);
        expect(
          (await objectSet.classUnionCount()).unsafeCoerce(),
        ).toStrictEqual(data.classUnions.length);
      });

      it("class without fromRdfTypes", async ({ expect }) => {
        const objectSet = createObjectSet(...data.noRdfTypeClassUnions);
        expect(
          (await objectSet.noRdfTypeClassUnionCount()).unsafeCoerce(),
        ).toStrictEqual(data.noRdfTypeClassUnions.length);
      });

      it("interface", async ({ expect }) => {
        const objectSet = createObjectSet(...data.interfaceUnions);
        expect(
          (await objectSet.interfaceUnionCount()).unsafeCoerce(),
        ).toStrictEqual(data.interfaceUnions.length);
      });
    });
  });
}
