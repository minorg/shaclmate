import type * as kitchenSink from "@shaclmate/kitchen-sink-example";
import { DataFactory } from "n3";
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

    describe("identifiers", () => {
      const objectSet = createObjectSet(...data.concreteChildClasses);

      it("empty", async ({ expect }) => {
        const actual = (
          await objectSet.concreteChildClasses({
            identifiers: [],
          })
        ).unsafeCoerce();
        expect(actual).toHaveLength(0);
      });

      it("all", async ({ expect }) => {
        const expected = data.concreteChildClasses;
        const actual = (
          await objectSet.concreteChildClasses({
            identifiers: expected.map((_) => _.$identifier),
          })
        ).unsafeCoerce();
        expect(actual).toHaveLength(expected.length);
        for (let i = 0; i < expected.length; i++) {
          expect(actual[i].$equals(expected[i]).isRight()).toStrictEqual(true);
        }
      });

      it("subset", async ({ expect }) => {
        const expected = data.concreteChildClasses.slice(2);
        const actual = (
          await objectSet.concreteChildClasses({
            identifiers: expected.map((_) => _.$identifier),
          })
        ).unsafeCoerce();
        expect(actual).toHaveLength(expected.length);
        for (let i = 0; i < expected.length; i++) {
          expect(actual[i].$equals(expected[i]).isRight()).toStrictEqual(true);
        }
      });

      it("missing", async ({ expect }) => {
        expect(
          (
            await objectSet.concreteChildClasses({
              identifiers: [
                DataFactory.namedNode("http://example.com/nonextant"),
                data.concreteChildClasses[0].$identifier,
              ],
            })
          ).isLeft(),
        ).toStrictEqual(true);
      });
    });
  });
}
