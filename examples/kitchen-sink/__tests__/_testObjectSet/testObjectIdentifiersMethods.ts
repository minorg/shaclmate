import type { NamedNode } from "@rdfjs/types";
import dataFactory from "@rdfx/data-factory";
import { describe, it } from "vitest";
import type * as kitchenSink from "../../src/index.js";
import { data } from "./data.js";
import type { ObjectSetFactory } from "./ObjectSetFactory.js";
import { objectDataset } from "./objectDataset.js";

export function testObjectIdentifiersMethods(
  createObjectSet: ObjectSetFactory,
) {
  describe("object identifiers methods", () => {
    describe("graphs", () => {
      const defaultGraphObjects = [data.termObjects[0], data.termObjects[1]];
      const namedGraph1Object = data.termObjects[2];
      const namedGraph1Iri = namedGraph1Object.$identifier() as NamedNode;
      const namedGraph2Object = data.termObjects[3];
      const namedGraph2Iri = namedGraph2Object.$identifier() as NamedNode;
      const datasetObjects: Record<string, readonly kitchenSink.$Object[]> = {
        "": defaultGraphObjects,
      };
      datasetObjects[namedGraph1Iri.value] = [namedGraph1Object];
      datasetObjects[namedGraph2Iri.value] = [namedGraph2Object];
      const dataset = objectDataset(datasetObjects);
      const defaultGraphObjectSet = createObjectSet(dataset, {
        graph: dataFactory.defaultGraph(),
      });
      const namedGraph1ObjectSet = createObjectSet(dataset, {
        graph: namedGraph1Iri,
      });
      // const namedGraph2ObjectSet = createObjectSet(dataset, {
      //   graph: namedGraph2Iri,
      // });
      const unionGraphObjectSet = createObjectSet(dataset);

      describe("default graph", () => {
        it("no query", async ({ expect }) => {
          expect(
            (await defaultGraphObjectSet.termsStructIdentifiers())
              .unsafeCoerce()
              .map((_) => _.value)
              .sort(),
          ).toStrictEqual(
            defaultGraphObjects.map((_) => _.$identifier().value).sort(),
          );
        });

        it("query of named graph", async ({ expect }) => {
          expect(
            (
              await defaultGraphObjectSet.termsStructIdentifiers({
                graph: namedGraph1Iri,
              })
            )
              .unsafeCoerce()
              .map((_) => _.value),
          ).toStrictEqual([namedGraph1Object.$identifier().value]);
        });
      });

      describe("named graph", () => {
        it("no query", async ({ expect }) => {
          expect(
            (await namedGraph1ObjectSet.termsStructIdentifiers())
              .unsafeCoerce()
              .map((_) => _.value),
          ).toStrictEqual([namedGraph1Object.$identifier().value]);
        });

        it("query of different named graph", async ({ expect }) => {
          expect(
            (
              await namedGraph1ObjectSet.termsStructIdentifiers({
                graph: namedGraph2Iri,
              })
            )
              .unsafeCoerce()
              .map((_) => _.value),
          ).toStrictEqual([namedGraph2Object.$identifier().value]);
        });
      });

      describe("union graph", () => {
        it("no query", async ({ expect }) => {
          expect(
            (await unionGraphObjectSet.termsStructIdentifiers())
              .unsafeCoerce()
              .map((_) => _.value)
              .sort(),
          ).toStrictEqual(
            [...defaultGraphObjects, namedGraph1Object, namedGraph2Object]
              .map((_) => _.$identifier().value)
              .sort(),
          );
        });

        it("query of default graph", async ({ expect }) => {
          expect(
            (
              await unionGraphObjectSet.termsStructIdentifiers({
                graph: dataFactory.defaultGraph(),
              })
            )
              .unsafeCoerce()
              .map((_) => _.value),
          ).toStrictEqual(
            defaultGraphObjects.map((_) => _.$identifier().value),
          );
        });

        it("query of named graph 1", async ({ expect }) => {
          expect(
            (
              await unionGraphObjectSet.termsStructIdentifiers({
                graph: namedGraph1Iri,
              })
            )
              .unsafeCoerce()
              .map((_) => _.value),
          ).toStrictEqual([namedGraph1Object.$identifier().value]);
        });

        it("query of named graph 2", async ({ expect }) => {
          expect(
            (
              await unionGraphObjectSet.termsStructIdentifiers({
                graph: namedGraph2Iri,
              })
            )
              .unsafeCoerce()
              .map((_) => _.value),
          ).toStrictEqual([namedGraph2Object.$identifier().value]);
        });
      });
    });

    it("no options", async ({ expect }) => {
      const objectSet = createObjectSet(objectDataset(data.termObjects));
      expect(
        (await objectSet.termsStructIdentifiers())
          .unsafeCoerce()
          .map((identifier) => identifier.value),
      ).toStrictEqual(
        data.termObjects.map((object) => object.$identifier().value),
      );
    });

    it("limit 1", async ({ expect }) => {
      const objectSet = createObjectSet(objectDataset(data.termObjects));
      expect(
        (await objectSet.termsStructIdentifiers({ limit: 1 }))
          .unsafeCoerce()
          .map((identifier) => identifier.value),
      ).toStrictEqual([data.termObjects[0].$identifier().value]);
    });

    it("offset 1", async ({ expect }) => {
      const objectSet = createObjectSet(objectDataset(data.termObjects));
      expect(
        (
          await objectSet.termsStructIdentifiers({
            offset: 1,
          })
        )
          .unsafeCoerce()
          .map((identifier) => identifier.value),
      ).toStrictEqual(
        data.termObjects.slice(1).map((object) => object.$identifier().value),
      );
    });

    it("limit 2 offset 1", async ({ expect }) => {
      const objectSet = createObjectSet(objectDataset(data.termObjects));
      expect(
        (
          await objectSet.termsStructIdentifiers({
            limit: 2,
            offset: 1,
          })
        )
          .unsafeCoerce()
          .map((identifier) => identifier.value)
          .sort(),
      ).toStrictEqual([
        data.termObjects[1].$identifier().value,
        data.termObjects[2].$identifier().value,
      ]);
    });

    describe("union", () => {
      it("class union", async ({ expect }) => {
        const objectSet = createObjectSet(objectDataset(data.unionObjects));
        expect(
          new Set(
            (await objectSet.discriminatedUnionIdentifiers())
              .unsafeCoerce()
              .map((identifier) => identifier.value),
          ),
        ).toStrictEqual(
          new Set(
            data.unionObjects.map((object) => object.$identifier().value),
          ),
        );
      });

      it("class union limit 1", async ({ expect }) => {
        const objectSet = createObjectSet(objectDataset(data.unionObjects));
        expect(
          (await objectSet.discriminatedUnionIdentifiers({ limit: 1 }))
            .unsafeCoerce()
            .map((identifier) => identifier.value),
        ).toStrictEqual([data.unionObjects[0].$identifier().value]);
      });
    });
  });
}
