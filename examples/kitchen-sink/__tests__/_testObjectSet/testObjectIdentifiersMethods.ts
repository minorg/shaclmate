import dataFactory from "@rdfjs/data-model";
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
        data.concreteChildClasses[0],
        data.concreteChildClasses[1],
      ];
      const namedGraph1Object = data.concreteChildClasses[2];
      const namedGraph1Iri = namedGraph1Object.$identifier as NamedNode;
      const namedGraph2Object = data.concreteChildClasses[3];
      const namedGraph2Iri = namedGraph2Object.$identifier as NamedNode;
      const dataset = objectDataset({
        "": defaultGraphObjects,
        "http://example.com/concreteChildClass2": [namedGraph1Object],
        "http://example.com/concreteChildClass3": [namedGraph2Object],
      });
      const defaultGraphObjectSet = createObjectSet(dataset, {
        graph: dataFactory.defaultGraph(),
      });
      const namedGraph1ObjectSet = createObjectSet(dataset, {
        graph: data.concreteChildClasses[3].$identifier,
      });
      // const namedGraph2ObjectSet = createObjectSet(dataset, {
      //   graph: data.concreteChildClasses[3].$identifier,
      // });
      const unionGraphObjectSet = createObjectSet(dataset);

      describe("objectIdentifiers", () => {
        describe("default graph", () => {
          it("no query", async ({ expect }) => {
            expect(
              (await defaultGraphObjectSet.concreteChildClassIdentifiers())
                .unsafeCoerce()
                .map((_) => _.value),
            ).toStrictEqual(
              defaultGraphObjects.map((_) => _.$identifier.value),
            );
          });

          it("query of named graph", async ({ expect }) => {
            expect(
              (
                await defaultGraphObjectSet.concreteChildClassIdentifiers({
                  graph: namedGraph1Iri,
                })
              ).unsafeCoerce(),
            ).toHaveLength(0);
          });
        });

        describe("named graph", () => {
          it("no query", async ({ expect }) => {
            expect(
              (await namedGraph1ObjectSet.concreteChildClassIdentifiers())
                .unsafeCoerce()
                .map((_) => _.value),
            ).toStrictEqual([namedGraph1Object.$identifier.value]);
          });

          it("query of different named graph", async ({ expect }) => {
            expect(
              (
                await namedGraph1ObjectSet.concreteChildClassIdentifiers({
                  graph: namedGraph2Iri,
                })
              ).unsafeCoerce(),
            ).toHaveLength(0);
          });
        });

        describe("union graph", () => {
          it("no query", async ({ expect }) => {
            expect(
              (await unionGraphObjectSet.concreteChildClassIdentifiers())
                .unsafeCoerce()
                .map((_) => _.value)
                .sort(),
            ).toStrictEqual(
              [...defaultGraphObjects, namedGraph1Object, namedGraph2Object]
                .map((_) => _.$identifier.value)
                .sort(),
            );
          });

          it("query of default graph", async ({ expect }) => {
            expect(
              (
                await unionGraphObjectSet.concreteChildClassIdentifiers({
                  graph: dataFactory.defaultGraph(),
                })
              )
                .unsafeCoerce()
                .map((_) => _.value),
            ).toStrictEqual(
              defaultGraphObjects.map((_) => _.$identifier.value),
            );
          });

          it("query of named graph 1", async ({ expect }) => {
            expect(
              (
                await unionGraphObjectSet.concreteChildClassIdentifiers({
                  graph: namedGraph1Iri,
                })
              )
                .unsafeCoerce()
                .map((_) => _.value),
            ).toStrictEqual([namedGraph1Object.$identifier.value]);
          });

          it("query of named graph 2", async ({ expect }) => {
            expect(
              (
                await unionGraphObjectSet.concreteChildClassIdentifiers({
                  graph: namedGraph2Iri,
                })
              )
                .unsafeCoerce()
                .map((_) => _.value),
            ).toStrictEqual([namedGraph2Object.$identifier.value]);
          });
        });
      });
    });

    it("no options", async ({ expect }) => {
      const objectSet = createObjectSet(
        objectDataset(data.concreteChildClasses),
      );
      expect(
        (await objectSet.concreteChildClassIdentifiers())
          .unsafeCoerce()
          .map((identifier) => identifier.value),
      ).toStrictEqual(
        data.concreteChildClasses.map((object) => object.$identifier.value),
      );
    });

    it("limit 1", async ({ expect }) => {
      const objectSet = createObjectSet(
        objectDataset(data.concreteChildClasses),
      );
      expect(
        (await objectSet.concreteChildClassIdentifiers({ limit: 1 }))
          .unsafeCoerce()
          .map((identifier) => identifier.value),
      ).toStrictEqual([data.concreteChildClasses[0].$identifier.value]);
    });

    it("offset 1", async ({ expect }) => {
      const objectSet = createObjectSet(
        objectDataset(data.concreteChildClasses),
      );
      expect(
        (
          await objectSet.concreteChildClassIdentifiers({
            offset: 1,
          })
        )
          .unsafeCoerce()
          .map((identifier) => identifier.value),
      ).toStrictEqual(
        data.concreteChildClasses
          .slice(1)
          .map((object) => object.$identifier.value),
      );
    });

    it("limit 2 offset 1", async ({ expect }) => {
      const objectSet = createObjectSet(
        objectDataset(data.concreteChildClasses),
      );
      expect(
        (
          await objectSet.concreteChildClassIdentifiers({
            limit: 2,
            offset: 1,
          })
        )
          .unsafeCoerce()
          .map((identifier) => identifier.value)
          .sort(),
      ).toStrictEqual([
        data.concreteChildClasses[1].$identifier.value,
        data.concreteChildClasses[2].$identifier.value,
      ]);
    });

    describe("union", () => {
      it("class union", async ({ expect }) => {
        const objectSet = createObjectSet(objectDataset(data.classUnions));
        expect(
          new Set(
            (await objectSet.classUnionIdentifiers())
              .unsafeCoerce()
              .map((identifier) => identifier.value),
          ),
        ).toStrictEqual(
          new Set(data.classUnions.map((object) => object.$identifier.value)),
        );
      });

      it("class union limit 1", async ({ expect }) => {
        const objectSet = createObjectSet(objectDataset(data.classUnions));
        expect(
          (await objectSet.classUnionIdentifiers({ limit: 1 }))
            .unsafeCoerce()
            .map((identifier) => identifier.value),
        ).toStrictEqual([data.classUnions[0].$identifier.value]);
      });
    });
  });
}
