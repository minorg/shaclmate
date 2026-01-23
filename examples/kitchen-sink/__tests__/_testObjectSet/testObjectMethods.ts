import * as kitchenSink from "@shaclmate/kitchen-sink-example";
import { describe, it } from "vitest";
import { data } from "./data.js";

export function testObjectMethods(
  createObjectSet: (
    ...instances: kitchenSink.$Object[]
  ) => kitchenSink.$ObjectSet,
) {
  describe("object methods", () => {
    it("concrete child class", async ({ expect }) => {
      const objectSet = createObjectSet(...data.concreteChildClasses);
      expect(
        (
          await objectSet.concreteChildClass(
            data.concreteChildClasses[0].$identifier,
          )
        )
          .unsafeCoerce()
          .$equals(data.concreteChildClasses[0])
          .unsafeCoerce(),
      ).toBe(true);
    });

    it("concrete parent class", async ({ expect }) => {
      const objectSet = createObjectSet(...data.concreteChildClasses);
      const expectedObject = data.concreteChildClasses[0];
      const actualObject = (
        await objectSet.concreteParentClass(expectedObject.$identifier)
      ).unsafeCoerce();
      expect(actualObject).toBeInstanceOf(kitchenSink.ConcreteParentClass);
      expect(actualObject).not.toBeInstanceOf(kitchenSink.ConcreteChildClass);
      expect(
        actualObject.abstractBaseClassWithPropertiesProperty,
      ).toStrictEqual(expectedObject.abstractBaseClassWithPropertiesProperty);
      expect(actualObject.concreteParentClassProperty).toStrictEqual(
        expectedObject.concreteParentClassProperty,
      );
    });

    describe("union", () => {
      it("class with fromRdfType", async ({ expect }) => {
        const objectSet = createObjectSet(...data.classUnions);
        for (const expectedClassUnion of data.classUnions) {
          expect(
            (await objectSet.classUnion(expectedClassUnion.$identifier))
              .unsafeCoerce()
              .$equals(expectedClassUnion as any)
              .unsafeCoerce(),
          ).toBe(true);
        }
      });

      it("class without fromRdfType", async ({ expect }) => {
        const objectSet = createObjectSet(...data.noRdfTypeClassUnions);
        for (const expectedClassUnion of data.noRdfTypeClassUnions) {
          const actualClassUnion = (
            await objectSet.noRdfTypeClassUnion(expectedClassUnion.$identifier)
          ).unsafeCoerce();
          const equalsResult = kitchenSink.NoRdfTypeClassUnion.$equals(
            expectedClassUnion,
            actualClassUnion,
          );
          expect(equalsResult.unsafeCoerce()).toBe(true);
        }
      });

      it("interface", async ({ expect }) => {
        const objectSet = createObjectSet(...data.interfaceUnions);
        for (const expectedInterfaceUnion of data.interfaceUnions) {
          const actualClassUnion = (
            await objectSet.interfaceUnion(expectedInterfaceUnion.$identifier)
          ).unsafeCoerce();
          const equalsResult = kitchenSink.InterfaceUnion.$equals(
            expectedInterfaceUnion,
            actualClassUnion,
          );
          expect(equalsResult.unsafeCoerce()).toBe(true);
        }
      });
    });
  });
}
