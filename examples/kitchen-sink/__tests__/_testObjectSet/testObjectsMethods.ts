import type * as kitchenSink from "@shaclmate/kitchen-sink-example";
import { describe, it } from "vitest";
import { data } from "./data.js";

export function testObjectsMethods(
  createObjectSet: (
    ...instances: kitchenSink.$Object[]
  ) => kitchenSink.$ObjectSet,
) {
  describe("objects methods", () => {
    it("known subclasses", async ({ expect }) => {
      const objectSet = createObjectSet(...data.concreteChildClasses);
      const parentClasses = (
        await objectSet.concreteParentClasses()
      ).unsafeCoerce();
      expect(parentClasses).toHaveLength(data.concreteChildClasses.length);
      for (const childClass of data.concreteChildClasses) {
        // parentClass may be an instance of the parent class rather than the child class, depending on the implementation
        expect(
          parentClasses.some((parentClass) =>
            parentClass.$equals(childClass).isRight(),
          ),
        );
      }
    });
  });
}
