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
  const expectConcreteChildClassNodeShapes = new Array(4).map(
    (_, i) =>
      new kitchenSink.ConcreteChildClassNodeShape({
        abcStringProperty: `ABC string ${i}`,
        childStringProperty: `child string ${i}`,
        identifier: N3.DataFactory.namedNode(`http://example.com/object${i}`),
        parentStringProperty: `parent string ${i}`,
      }),
  );

  const expectedInterfaceUnionNodeShapes = new Array(4).map((i) => {
    switch (i % 3) {
      case 0:
        return {
          identifier: N3.DataFactory.namedNode(`http://example.com/object${i}`),
          stringProperty1: `string ${i}`,
          type: "InterfaceUnionNodeShapeMember1",
        } satisfies kitchenSink.InterfaceUnionNodeShapeMember1;
      case 1:
        return {
          identifier: N3.DataFactory.namedNode(`http://example.com/object${i}`),
          stringProperty2a: `string ${i}`,
          type: "InterfaceUnionNodeShapeMember2a",
        } satisfies kitchenSink.InterfaceUnionNodeShapeMember2a;
      case 2:
        return {
          identifier: N3.DataFactory.namedNode(`http://example.com/object${i}`),
          stringProperty2b: `string ${i}`,
          type: "InterfaceUnionNodeShapeMember2b",
        } satisfies kitchenSink.InterfaceUnionNodeShapeMember2b;
      default:
        throw new RangeError();
    }
  });

  beforeAll(() => {
    const dataset = new N3.Store();
    const mutateGraph = N3.DataFactory.defaultGraph();
    const resourceSet = new MutableResourceSet({
      dataFactory: N3.DataFactory,
      dataset,
    });
    for (const expectedObject of expectConcreteChildClassNodeShapes) {
      expectedObject.toRdf({ resourceSet, mutateGraph });
    }
    for (const quad of dataset) {
      addQuad(quad);
    }
  });

  it("object", async ({ expect }) => {
    expect(
      (
        await objectSet.concreteChildClassNodeShape(
          expectConcreteChildClassNodeShapes[0].identifier,
        )
      )
        .unsafeCoerce()
        .equals(expectConcreteChildClassNodeShapes[0])
        .unsafeCoerce(),
    ).toBe(true);
  });

  it("objectIdentifiers (no options)", async ({ expect }) => {
    expect(
      (await objectSet.concreteChildClassNodeShapeIdentifiers())
        .unsafeCoerce()
        .map((identifier) => identifier.value),
    ).toStrictEqual(
      expectConcreteChildClassNodeShapes.map(
        (object) => object.identifier.value,
      ),
    );
  });

  it("objectIdentifiers (limit 1)", async ({ expect }) => {
    expect(
      (await objectSet.concreteChildClassNodeShapeIdentifiers({ limit: 1 }))
        .unsafeCoerce()
        .map((identifier) => identifier.value),
    ).toStrictEqual([expectConcreteChildClassNodeShapes[0].identifier.value]);
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
      expectConcreteChildClassNodeShapes
        .slice(1)
        .map((object) => object.identifier.value),
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
      expectConcreteChildClassNodeShapes[1].identifier.value,
      expectConcreteChildClassNodeShapes[2].identifier.value,
    ]);
  });

  it("objects (all identifiers)", async ({ expect }) => {
    const actualObjects = (
      await objectSet.concreteChildClassNodeShapes({
        where: {
          identifiers: expectConcreteChildClassNodeShapes.map(
            (object) => object.identifier,
          ),
          type: "identifiers",
        },
      })
    ).map((either) => either.unsafeCoerce());
    expect(actualObjects).toHaveLength(
      expectConcreteChildClassNodeShapes.length,
    );
    for (const expectedObject of expectConcreteChildClassNodeShapes) {
      expect(
        actualObjects.some((actualObject) =>
          actualObject.equals(expectedObject).isRight(),
        ),
      );
    }
  });

  it("objects (subset of identifiers)", async ({ expect }) => {
    const sliceStart = 2;
    const actualObjects = (
      await objectSet.concreteChildClassNodeShapes({
        where: {
          identifiers: expectConcreteChildClassNodeShapes
            .slice(sliceStart)
            .map((object) => object.identifier),
          type: "identifiers",
        },
      })
    ).map((either) => either.unsafeCoerce());
    expect(actualObjects).toHaveLength(
      expectConcreteChildClassNodeShapes.slice(sliceStart).length,
    );
    for (const expectedObject of expectConcreteChildClassNodeShapes.slice(
      sliceStart,
    )) {
      expect(
        actualObjects.some((actualObject) =>
          actualObject.equals(expectedObject).isRight(),
        ),
      );
    }
  });

  it("objectsCount", async ({ expect }) => {
    expect(
      (await objectSet.concreteChildClassNodeShapesCount()).unsafeCoerce(),
    ).toStrictEqual(expectConcreteChildClassNodeShapes.length);
  });
}
