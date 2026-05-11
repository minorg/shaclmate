import { describe, it } from "vitest";
import { data } from "./data.js";
import type { ObjectSetFactory } from "./ObjectSetFactory.js";
import { objectDataset } from "./objectDataset.js";

export function testObjectCountMethods(createObjectSet: ObjectSetFactory) {
  describe("object count methods", () => {
    it("class", async ({ expect }) => {
      const objectSet = createObjectSet(objectDataset(data.classHierarchy3s));
      expect(
        (await objectSet.classHierarchy3Count()).unsafeCoerce(),
      ).toStrictEqual(data.classHierarchy3s.length);
    });

    describe("union", () => {
      it("with fromRdfTypes", async ({ expect }) => {
        const objectSet = createObjectSet(objectDataset(data.unions));
        expect((await objectSet.unionCount()).unsafeCoerce()).toStrictEqual(
          data.unions.length,
        );
      });

      it("without fromRdfTypes", async ({ expect }) => {
        const objectSet = createObjectSet(objectDataset(data.noRdfTypeUnions));
        expect(
          (await objectSet.noRdfTypeUnionCount()).unsafeCoerce(),
        ).toStrictEqual(data.noRdfTypeUnions.length);
      });
    });
  });
}
