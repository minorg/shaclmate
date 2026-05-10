import dataFactory from "@rdfx/data-factory";
import * as kitchenSink from "@shaclmate/kitchen-sink-example";
import { describe, it } from "vitest";
import { data } from "./data.js";
import type { ObjectSetFactory } from "./ObjectSetFactory.js";
import { objectDataset } from "./objectDataset.js";

export function testObjectsMethods(createObjectSet: ObjectSetFactory) {
  describe("objects methods", () => {
    it("known subclasses", async ({ expect }) => {
      const objectSet = createObjectSet(objectDataset(data.concreteChildren));
      const parentClasses = (await objectSet.concreteParents()).unsafeCoerce();
      expect(parentClasses).toHaveLength(data.concreteChildren.length);
      for (const childClass of data.concreteChildren) {
        // parentClass may be an instance of the parent class rather than the child class, depending on the implementation
        expect(
          parentClasses.some((parentClass) =>
            kitchenSink.ConcreteParentStatic.$equals(
              parentClass,
              childClass,
            ).isRight(),
          ),
        );
      }
    });

    describe("identifiers", () => {
      const objectSet = createObjectSet(objectDataset(data.concreteChildren));

      it("empty", async ({ expect }) => {
        const actual = (
          await objectSet.concreteChildren({
            identifiers: [],
          })
        ).unsafeCoerce();
        expect(actual).toHaveLength(0);
      });

      it("all", async ({ expect }) => {
        const expected = data.concreteChildren;
        const actual = (
          await objectSet.concreteChildren({
            identifiers: expected.map((_) => _.$identifier()),
          })
        ).unsafeCoerce();
        expect(actual).toHaveLength(expected.length);
        for (let i = 0; i < expected.length; i++) {
          expect(
            kitchenSink.ConcreteChild.$equals(actual[i], expected[i]).isRight(),
          ).toStrictEqual(true);
        }
      });

      it("subset", async ({ expect }) => {
        const expected = data.concreteChildren.slice(2);
        const actual = (
          await objectSet.concreteChildren({
            identifiers: expected.map((_) => _.$identifier()),
          })
        ).unsafeCoerce();
        expect(actual).toHaveLength(expected.length);
        for (let i = 0; i < expected.length; i++) {
          expect(
            kitchenSink.ConcreteChild.$equals(actual[i], expected[i]).isRight(),
          ).toStrictEqual(true);
        }
      });

      it("missing", async ({ expect }) => {
        expect(
          await objectSet.concreteChildren({
            identifiers: [
              dataFactory.namedNode("http://example.com/nonextant"),
              data.concreteChildren[0].$identifier(),
            ],
          }),
        ).toBeLeft();
      });
    });
  });
}
