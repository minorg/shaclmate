import type { Quad } from "@rdfjs/types";
import type { $ObjectSet } from "@shaclmate/kitchen-sink-example";
import * as kitchenSink from "@shaclmate/kitchen-sink-example";
import N3 from "n3";
import { MutableResourceSet } from "rdfjs-resource";
import { beforeAll, it } from "vitest";

const testData = {
  classUnionNodeShapes: [...new Array(4)].map((_, i) => {
    switch (i % 2) {
      case 0:
        return new kitchenSink.UnionNodeShapeMember1({
          identifier: N3.DataFactory.namedNode(
            `http://example.com/classUnionNodeShape${i}`,
          ),
          stringProperty1: `string ${i}`,
        });
      case 1:
        return new kitchenSink.UnionNodeShapeMember2({
          identifier: N3.DataFactory.namedNode(
            `http://example.com/classUnionNodeShape${i}`,
          ),
          stringProperty2: `string ${i}`,
        });
      default:
        throw new RangeError(i.toString());
    }
  }) as readonly kitchenSink.UnionNodeShape[],

  concreteChildClassNodeShapes: [...new Array(4)].map(
    (_, i) =>
      new kitchenSink.ConcreteChildClassNodeShape({
        abcStringProperty: `ABC string ${i}`,
        childStringProperty: `child string ${i}`,
        identifier: N3.DataFactory.namedNode(
          `http://example.com/concreteChildClassNodeShape${i}`,
        ),
        parentStringProperty: `parent string ${i}`,
      }),
  ) satisfies readonly kitchenSink.ConcreteChildClassNodeShape[],

  interfaceUnionNodeShapes: [...new Array(4)].map((_, i) => {
    switch (i % 3) {
      case 0:
        return {
          identifier: N3.DataFactory.namedNode(
            `http://example.com/interfaceUnionNodeShape${i}`,
          ),
          stringProperty1: `string ${i}`,
          type: "InterfaceUnionNodeShapeMember1",
        } satisfies kitchenSink.InterfaceUnionNodeShape;
      case 1:
        return {
          identifier: N3.DataFactory.namedNode(
            `http://example.com/interfaceUnionNodeShape${i}`,
          ),
          stringProperty2a: `string ${i}`,
          type: "InterfaceUnionNodeShapeMember2a",
        } satisfies kitchenSink.InterfaceUnionNodeShape;
      case 2:
        return {
          identifier: N3.DataFactory.namedNode(
            `http://example.com/interfaceUnionNodeShape${i}`,
          ),
          stringProperty2b: `string ${i}`,
          type: "InterfaceUnionNodeShapeMember2b",
        } satisfies kitchenSink.InterfaceUnionNodeShape;
      default:
        throw new RangeError(i.toString());
    }
  }) as kitchenSink.InterfaceUnionNodeShape[],
};

export function behavesLikeObjectSet<ObjectSetT extends $ObjectSet>({
  addQuad,
  objectSet,
}: { addQuad: (quad: Quad) => void; objectSet: ObjectSetT }) {
  beforeAll(() => {
    const dataset = new N3.Store();
    const mutateGraph = N3.DataFactory.defaultGraph();
    const resourceSet = new MutableResourceSet({
      dataFactory: N3.DataFactory,
      dataset,
    });
    for (const object of testData.classUnionNodeShapes) {
      object.toRdf({ resourceSet, mutateGraph });
    }
    for (const object of testData.concreteChildClassNodeShapes) {
      object.toRdf({ resourceSet, mutateGraph });
    }
    for (const object of testData.interfaceUnionNodeShapes) {
      kitchenSink.InterfaceUnionNodeShape.toRdf(object, {
        resourceSet,
        mutateGraph,
      });
    }
    for (const quad of dataset) {
      addQuad(quad);
    }
  });

  it("object", async ({ expect }) => {
    expect(
      (
        await objectSet.concreteChildClassNodeShape(
          testData.concreteChildClassNodeShapes[0].identifier,
        )
      )
        .unsafeCoerce()
        .equals(testData.concreteChildClassNodeShapes[0])
        .unsafeCoerce(),
    ).toBe(true);
  });

  it("objectIdentifiers (no options)", async ({ expect }) => {
    expect(
      (await objectSet.concreteChildClassNodeShapeIdentifiers())
        .unsafeCoerce()
        .map((identifier) => identifier.value),
    ).toStrictEqual(
      testData.concreteChildClassNodeShapes.map(
        (object) => object.identifier.value,
      ),
    );
  });

  it("objectIdentifiers (limit 1)", async ({ expect }) => {
    expect(
      (await objectSet.concreteChildClassNodeShapeIdentifiers({ limit: 1 }))
        .unsafeCoerce()
        .map((identifier) => identifier.value),
    ).toStrictEqual([
      testData.concreteChildClassNodeShapes[0].identifier.value,
    ]);
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
      testData.concreteChildClassNodeShapes
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
      testData.concreteChildClassNodeShapes[1].identifier.value,
      testData.concreteChildClassNodeShapes[2].identifier.value,
    ]);
  });

  it("objects (all identifiers)", async ({ expect }) => {
    const actualObjects = (
      await objectSet.concreteChildClassNodeShapes({
        where: {
          identifiers: testData.concreteChildClassNodeShapes.map(
            (object) => object.identifier,
          ),
          type: "identifiers",
        },
      })
    ).map((either) => either.unsafeCoerce());
    expect(actualObjects).toHaveLength(
      testData.concreteChildClassNodeShapes.length,
    );
    for (const expectedObject of testData.concreteChildClassNodeShapes) {
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
          identifiers: testData.concreteChildClassNodeShapes
            .slice(sliceStart)
            .map((object) => object.identifier),
          type: "identifiers",
        },
      })
    ).map((either) => either.unsafeCoerce());
    expect(actualObjects).toHaveLength(
      testData.concreteChildClassNodeShapes.slice(sliceStart).length,
    );
    for (const expectedObject of testData.concreteChildClassNodeShapes.slice(
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
    ).toStrictEqual(testData.concreteChildClassNodeShapes.length);
  });

  it("objectUnion (class with fromRdfType)", async ({ expect }) => {
    for (const expectedClassUnionNodeShape of testData.classUnionNodeShapes) {
      expect(
        (await objectSet.unionNodeShape(expectedClassUnionNodeShape.identifier))
          .unsafeCoerce()
          .equals(expectedClassUnionNodeShape as any)
          .unsafeCoerce(),
      ).toBe(true);
    }
  });

  it("objectUnion (interface without fromRdfType)", async ({ expect }) => {
    for (const expectedInterfaceUnionNodeShape of testData.interfaceUnionNodeShapes) {
      const actualInterfaceUnionNodeShape = (
        await objectSet.interfaceUnionNodeShape(
          expectedInterfaceUnionNodeShape.identifier,
        )
      ).unsafeCoerce();
      const equalsResult = kitchenSink.InterfaceUnionNodeShape.equals(
        expectedInterfaceUnionNodeShape,
        actualInterfaceUnionNodeShape,
      );
      expect(equalsResult.unsafeCoerce()).toBe(true);
    }
  });

  it("objectUnionIdentifiers (no options)", async ({ expect }) => {
    expect(
      new Set(
        (await objectSet.unionNodeShapeIdentifiers())
          .unsafeCoerce()
          .map((identifier) => identifier.value),
      ),
    ).toStrictEqual(
      new Set(
        testData.classUnionNodeShapes.map((object) => object.identifier.value),
      ),
    );
  });

  it("objectUnionIdentifiers (limit 1)", async ({ expect }) => {
    expect(
      (await objectSet.unionNodeShapeIdentifiers({ limit: 1 }))
        .unsafeCoerce()
        .map((identifier) => identifier.value),
    ).toStrictEqual([testData.classUnionNodeShapes[0].identifier.value]);
  });

  it("objectUnions (all identifiers)", async ({ expect }) => {
    const actualObjects = (
      await objectSet.interfaceUnionNodeShapes({
        where: {
          identifiers: testData.interfaceUnionNodeShapes.map(
            (object) => object.identifier,
          ),
          type: "identifiers",
        },
      })
    ).map((either) => either.unsafeCoerce());
    expect(actualObjects).toHaveLength(
      testData.concreteChildClassNodeShapes.length,
    );
    for (const expectedObject of testData.interfaceUnionNodeShapes) {
      expect(
        actualObjects.some((actualObject) =>
          kitchenSink.InterfaceUnionNodeShape.equals(
            expectedObject,
            actualObject,
          ).isRight(),
        ),
      );
    }
  });

  it("objectUnions (subset of identifiers)", async ({ expect }) => {
    const sliceStart = 2;
    const actualObjects = (
      await objectSet.unionNodeShapes({
        where: {
          identifiers: testData.classUnionNodeShapes
            .slice(sliceStart)
            .map((object) => object.identifier),
          type: "identifiers",
        },
      })
    ).map((either) => either.unsafeCoerce());
    expect(actualObjects).toHaveLength(
      testData.classUnionNodeShapes.slice(sliceStart).length,
    );
    for (const expectedObject of testData.classUnionNodeShapes.slice(
      sliceStart,
    )) {
      expect(
        actualObjects.some((actualObject) =>
          kitchenSink.UnionNodeShape.equals(
            expectedObject,
            actualObject,
          ).isRight(),
        ),
      );
    }
  });

  it("objectUnionsCount (no fromRdfTypes)", async ({ expect }) => {
    expect(
      (await objectSet.interfaceUnionNodeShapesCount()).unsafeCoerce(),
    ).toStrictEqual(0);
  });

  it("objectUnionsCount (with fromRdfTypes)", async ({ expect }) => {
    expect(
      (await objectSet.unionNodeShapesCount()).unsafeCoerce(),
    ).toStrictEqual(testData.classUnionNodeShapes.length);
  });
}
