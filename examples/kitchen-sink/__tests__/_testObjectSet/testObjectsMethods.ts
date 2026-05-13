import dataFactory from "@rdfx/data-factory";
import * as kitchenSink from "@shaclmate/kitchen-sink-example";
import { describe, it } from "vitest";
import { data } from "./data.js";
import type { ObjectSetFactory } from "./ObjectSetFactory.js";
import { objectDataset } from "./objectDataset.js";

export function testObjectsMethods(createObjectSet: ObjectSetFactory) {
  describe("objects methods", () => {
    it("known subclasses", async ({ expect }) => {
      const objectSet = createObjectSet(objectDataset(data.classHierarchy3s));
      const parentClasses = (await objectSet.classHierarchy2s()).unsafeCoerce();
      expect(parentClasses).toHaveLength(data.classHierarchy3s.length);
      for (const childClass of data.classHierarchy3s) {
        // parentClass may be an instance of the parent class rather than the child class, depending on the implementation
        expect(
          parentClasses.some((parentClass) =>
            kitchenSink.ClassHierarchy2.equals(
              parentClass,
              childClass,
            ).isRight(),
          ),
        );
      }
    });

    describe("identifiers", () => {
      const objectSet = createObjectSet(objectDataset(data.classHierarchy3s));

      it("empty", async ({ expect }) => {
        const actual = (
          await objectSet.classHierarchy3s({
            identifiers: [],
          })
        ).unsafeCoerce();
        expect(actual).toHaveLength(0);
      });

      it("all", async ({ expect }) => {
        const expected = data.classHierarchy3s;
        const actual = (
          await objectSet.classHierarchy3s({
            identifiers: expected.map((_) => _.$identifier()),
          })
        ).unsafeCoerce();
        expect(actual).toHaveLength(expected.length);
        for (let i = 0; i < expected.length; i++) {
          expect(
            kitchenSink.ClassHierarchy3.equals(
              actual[i],
              expected[i],
            ).isRight(),
          ).toStrictEqual(true);
        }
      });

      it("subset", async ({ expect }) => {
        const expected = data.classHierarchy3s.slice(2);
        const actual = (
          await objectSet.classHierarchy3s({
            identifiers: expected.map((_) => _.$identifier()),
          })
        ).unsafeCoerce();
        expect(actual).toHaveLength(expected.length);
        for (let i = 0; i < expected.length; i++) {
          expect(
            kitchenSink.ClassHierarchy3.equals(
              actual[i],
              expected[i],
            ).isRight(),
          ).toStrictEqual(true);
        }
      });

      it("missing", async ({ expect }) => {
        expect(
          await objectSet.classHierarchy3s({
            identifiers: [
              dataFactory.namedNode("http://example.com/nonextant"),
              data.classHierarchy3s[0].$identifier(),
            ],
          }),
        ).toBeLeft();
      });
    });
  });
}
