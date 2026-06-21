import { describe, it } from "vitest";
import { data } from "./data.js";
import type { ObjectSetFactory } from "./ObjectSetFactory.js";
import { objectDataset } from "./objectDataset.js";

export function testObjectCountMethods(createObjectSet: ObjectSetFactory) {
  describe("object count methods", () => {
    it("class", async ({ expect }) => {
      const objectSet = createObjectSet(objectDataset(data.termObjects));
      expect((await objectSet.termsStructCount()).unsafeCoerce()).toStrictEqual(
        data.termObjects.length,
      );
    });

    describe("union", () => {
      it("with fromRdfTypes", async ({ expect }) => {
        const objectSet = createObjectSet(objectDataset(data.unionObjects));
        expect(
          (await objectSet.discriminatedUnionCount()).unsafeCoerce(),
        ).toStrictEqual(data.unionObjects.length);
      });

      it("without fromRdfTypes", async ({ expect }) => {
        const objectSet = createObjectSet(
          objectDataset(data.noRdfTypeDiscriminatedUnionObjects),
        );
        expect(
          (await objectSet.noRdfTypeDiscriminatedUnionCount()).unsafeCoerce(),
        ).toStrictEqual(data.noRdfTypeDiscriminatedUnionObjects.length);
      });
    });
  });
}
