import dataFactory from "@rdfx/data-factory";
import * as kitchenSink from "@shaclmate/kitchen-sink-example";
import { describe, it } from "vitest";
import { data } from "./data.js";
import type { ObjectSetFactory } from "./ObjectSetFactory.js";
import { objectDataset } from "./objectDataset.js";

export function testObjectsMethods(createObjectSet: ObjectSetFactory) {
  describe("objects methods", () => {
    describe("identifiers", () => {
      const objectSet = createObjectSet(objectDataset(data.termObjects));

      it("empty", async ({ expect }) => {
        const actual = (
          await objectSet.termsStructs({
            identifiers: [],
          })
        ).unsafeCoerce();
        expect(actual).toHaveLength(0);
      });

      it("all", async ({ expect }) => {
        const expected = data.termObjects;
        const actual = (
          await objectSet.termsStructs({
            identifiers: expected.map((_) => _.$identifier()),
          })
        ).unsafeCoerce();
        expect(actual).toHaveLength(expected.length);
        for (let i = 0; i < expected.length; i++) {
          expect(
            kitchenSink.TermsStruct.equals(actual[i], expected[i]).isRight(),
          ).toStrictEqual(true);
        }
      });

      it("subset", async ({ expect }) => {
        const expected = data.termObjects.slice(2);
        const actual = (
          await objectSet.termsStructs({
            identifiers: expected.map((_) => _.$identifier()),
          })
        ).unsafeCoerce();
        expect(actual).toHaveLength(expected.length);
        for (let i = 0; i < expected.length; i++) {
          expect(
            kitchenSink.TermsStruct.equals(actual[i], expected[i]).isRight(),
          ).toStrictEqual(true);
        }
      });

      it("missing", async ({ expect }) => {
        expect(
          await objectSet.termsStructs({
            identifiers: [
              dataFactory.namedNode("http://example.com/nonextant"),
              data.termObjects[0].$identifier(),
            ],
          }),
        ).toBeLeft();
      });
    });
  });
}
