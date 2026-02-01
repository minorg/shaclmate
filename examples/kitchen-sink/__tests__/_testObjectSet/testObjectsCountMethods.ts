import type * as kitchenSink from "@shaclmate/kitchen-sink-example";
import { describe, it } from "vitest";
import { data } from "./data.js";

export function testObjectsCountMethods(
  createObjectSet: (
    ...instances: kitchenSink.$Object[]
  ) => kitchenSink.$ObjectSet,
) {
  describe("objects count methods", () => {
    it("class", async ({ expect }) => {
      const objectSet = createObjectSet(...data.concreteChildClasses);
      expect(
        (await objectSet.concreteChildClassesCount()).unsafeCoerce(),
      ).toStrictEqual(data.concreteChildClasses.length);
    });

    describe("union", () => {
      it("class with fromRdfTypes", async ({ expect }) => {
        const objectSet = createObjectSet(...data.classUnions);
        expect(
          (await objectSet.classUnionsCount()).unsafeCoerce(),
        ).toStrictEqual(data.classUnions.length);
      });

      it("class without fromRdfTypes", async ({ expect }) => {
        const objectSet = createObjectSet(...data.noRdfTypeClassUnions);
        expect(
          (await objectSet.noRdfTypeClassUnionsCount()).unsafeCoerce(),
        ).toStrictEqual(data.noRdfTypeClassUnions.length);
      });

      it("interface", async ({ expect }) => {
        const objectSet = createObjectSet(...data.interfaceUnions);
        expect(
          (await objectSet.interfaceUnionsCount()).unsafeCoerce(),
        ).toStrictEqual(data.interfaceUnions.length);
      });
    });
  });
}
