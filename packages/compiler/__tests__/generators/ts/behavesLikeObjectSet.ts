import type { Quad } from "@rdfjs/types";
import type { $ObjectSet } from "@shaclmate/kitchen-sink-example";
import * as kitchenSink from "@shaclmate/kitchen-sink-example";
import N3 from "n3";
import { MutableResourceSet } from "rdfjs-resource";
import { beforeAll, it } from "vitest";

export function behavesLikeObjectSet<ObjectSetT extends $ObjectSet>({
  addQuad,
  objectSet,
}: { addQuad: (quad: Quad) => void; objectSet: ObjectSetT }) {
  const expectedObjects = [1, 2, 3, 4].map(
    (objectI) =>
      new kitchenSink.ConcreteChildClassNodeShape({
        abcStringProperty: `ABC string ${objectI}`,
        childStringProperty: `child string ${objectI}`,
        identifier: N3.DataFactory.namedNode(
          `http://example.com/object${objectI}`,
        ),
        parentStringProperty: `parent string ${objectI}`,
      }),
  );

  beforeAll(() => {
    const dataset = new N3.Store();
    const mutateGraph = N3.DataFactory.defaultGraph();
    const resourceSet = new MutableResourceSet({
      dataFactory: N3.DataFactory,
      dataset,
    });
    for (const expectedObject of expectedObjects) {
      expectedObject.toRdf({ resourceSet, mutateGraph });
    }
    for (const quad of dataset) {
      addQuad(quad);
    }
  });

  it("objectByIdentifier", async ({ expect }) => {
    expect(
      (
        await objectSet.concreteChildClassNodeShape(
          expectedObjects[0].identifier,
        )
      )
        .unsafeCoerce()
        .equals(expectedObjects[0])
        .unsafeCoerce(),
    ).toBe(true);
  });

  it("objectIdentifiers (no options)", async ({ expect }) => {
    expect(
      (await objectSet.concreteChildClassNodeShapeIdentifiers())
        .unsafeCoerce()
        .map((identifier) => identifier.value),
    ).toStrictEqual(expectedObjects.map((object) => object.identifier.value));
  });

  it("objectIdentifiers (limit 1)", async ({ expect }) => {
    expect(
      (await objectSet.concreteChildClassNodeShapeIdentifiers({ limit: 1 }))
        .unsafeCoerce()
        .map((identifier) => identifier.value),
    ).toStrictEqual([expectedObjects[0].identifier.value]);
  });

  it("objectIdentifiers (offset 1)", async ({ expect }) => {
    expect(
      (
        await objectSet.concreteChildClassNodeShapeIdentifiers({
          offset: 1,
        })
      )
        .unsafeCoerce()
        .map((identifier) => identifier.value),
    ).toStrictEqual(
      expectedObjects.slice(1).map((object) => object.identifier.value),
    );
  });

  it("objectIdentifiers (limit 2 offset 1)", async ({ expect }) => {
    expect(
      (
        await objectSet.concreteChildClassNodeShapeIdentifiers({
          limit: 2,
          offset: 1,
        })
      )
        .unsafeCoerce()
        .map((identifier) => identifier.value)
        .sort(),
    ).toStrictEqual([
      expectedObjects[1].identifier.value,
      expectedObjects[2].identifier.value,
    ]);
  });

  it("objectsCount", async ({ expect }) => {
    expect(
      (await objectSet.concreteChildClassNodeShapesCount()).unsafeCoerce(),
    ).toStrictEqual(expectedObjects.length);
  });

  it("objects (all)", async ({ expect }) => {
    const actualObjects = (
      await objectSet.concreteChildClassNodeShapes(
        expectedObjects.map((object) => object.identifier),
      )
    ).map((either) => either.unsafeCoerce());
    expect(actualObjects).toHaveLength(expectedObjects.length);
    for (const expectedObject of expectedObjects) {
      expect(
        actualObjects.some((actualObject) =>
          actualObject.equals(expectedObject).isRight(),
        ),
      );
    }
  });

  it("objects (subset)", async ({ expect }) => {
    const sliceStart = 2;
    const actualObjects = (
      await objectSet.concreteChildClassNodeShapes(
        expectedObjects.slice(sliceStart).map((object) => object.identifier),
      )
    ).map((either) => either.unsafeCoerce());
    expect(actualObjects).toHaveLength(
      expectedObjects.slice(sliceStart).length,
    );
    for (const expectedObject of expectedObjects.slice(sliceStart)) {
      expect(
        actualObjects.some((actualObject) =>
          actualObject.equals(expectedObject).isRight(),
        ),
      );
    }
  });
}
