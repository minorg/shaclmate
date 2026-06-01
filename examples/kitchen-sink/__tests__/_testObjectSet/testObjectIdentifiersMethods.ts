import type { NamedNode } from "@rdfjs/types";
import dataFactory from "@rdfx/data-factory";
import type * as kitchenSink from "@shaclmate/kitchen-sink-example";
import { describe, it } from "vitest";
import { data } from "./data.js";
import type { ObjectSetFactory } from "./ObjectSetFactory.js";
import { objectDataset } from "./objectDataset.js";

export function testObjectIdentifiersMethods(
  createObjectSet: ObjectSetFactory,
) {
  describe("object identifiers methods", () => {
    describe("graphs", () => {
      const defaultGraphObjects = [
        data.termPropertiesObjects[0],
        data.termPropertiesObjects[1],
      ];
      const namedGraph1Object = data.termPropertiesObjects[2];
      const namedGraph1Iri = namedGraph1Object.$identifier() as NamedNode;
      const namedGraph2Object = data.termPropertiesObjects[3];
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
            (await defaultGraphObjectSet.termPropertiesStructIdentifiers())
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
              await defaultGraphObjectSet.termPropertiesStructIdentifiers({
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
            (await namedGraph1ObjectSet.termPropertiesStructIdentifiers())
              .unsafeCoerce()
              .map((_) => _.value),
          ).toStrictEqual([namedGraph1Object.$identifier().value]);
        });

        it("query of different named graph", async ({ expect }) => {
          expect(
            (
              await namedGraph1ObjectSet.termPropertiesStructIdentifiers({
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
            (await unionGraphObjectSet.termPropertiesStructIdentifiers())
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
              await unionGraphObjectSet.termPropertiesStructIdentifiers({
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
              await unionGraphObjectSet.termPropertiesStructIdentifiers({
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
              await unionGraphObjectSet.termPropertiesStructIdentifiers({
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
      const objectSet = createObjectSet(
        objectDataset(data.termPropertiesObjects),
      );
      expect(
        (await objectSet.termPropertiesStructIdentifiers())
          .unsafeCoerce()
          .map((identifier) => identifier.value),
      ).toStrictEqual(
        data.termPropertiesObjects.map((object) => object.$identifier().value),
      );
    });

    it("limit 1", async ({ expect }) => {
      const objectSet = createObjectSet(
        objectDataset(data.termPropertiesObjects),
      );
      expect(
        (await objectSet.termPropertiesStructIdentifiers({ limit: 1 }))
          .unsafeCoerce()
          .map((identifier) => identifier.value),
      ).toStrictEqual([data.termPropertiesObjects[0].$identifier().value]);
    });

    it("offset 1", async ({ expect }) => {
      const objectSet = createObjectSet(
        objectDataset(data.termPropertiesObjects),
      );
      expect(
        (
          await objectSet.termPropertiesStructIdentifiers({
            offset: 1,
          })
        )
          .unsafeCoerce()
          .map((identifier) => identifier.value),
      ).toStrictEqual(
        data.termPropertiesObjects
          .slice(1)
          .map((object) => object.$identifier().value),
      );
    });

    it("limit 2 offset 1", async ({ expect }) => {
      const objectSet = createObjectSet(
        objectDataset(data.termPropertiesObjects),
      );
      expect(
        (
          await objectSet.termPropertiesStructIdentifiers({
            limit: 2,
            offset: 1,
          })
        )
          .unsafeCoerce()
          .map((identifier) => identifier.value)
          .sort(),
      ).toStrictEqual([
        data.termPropertiesObjects[1].$identifier().value,
        data.termPropertiesObjects[2].$identifier().value,
      ]);
    });

    describe("union", () => {
      it("class union", async ({ expect }) => {
        const objectSet = createObjectSet(objectDataset(data.unionObjects));
        expect(
          new Set(
            (await objectSet.unionIdentifiers())
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
          (await objectSet.unionIdentifiers({ limit: 1 }))
            .unsafeCoerce()
            .map((identifier) => identifier.value),
        ).toStrictEqual([data.unionObjects[0].$identifier().value]);
      });
    });
  });
}
