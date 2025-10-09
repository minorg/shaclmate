import type { Quad } from "@rdfjs/types";
import type { $ObjectSet } from "@shaclmate/kitchen-sink-example";
import * as kitchenSink from "@shaclmate/kitchen-sink-example";
import N3 from "n3";
import { MutableResourceSet } from "rdfjs-resource";
import { beforeAll, it } from "vitest";

const testData = {
  classClassUnions: [...new Array(4)].map((_, i) => {
    switch (i % 2) {
      case 0:
        return new kitchenSink.ClassUnionMember1({
          $identifier: N3.DataFactory.namedNode(
            `http://example.com/classClassUnion${i}`,
          ),
          classUnionMember1Property: `string ${i}`,
        });
      case 1:
        return new kitchenSink.ClassUnionMember2({
          $identifier: N3.DataFactory.namedNode(
            `http://example.com/classClassUnion${i}`,
          ),
          classUnionMember2Property: `string ${i}`,
        });
      default:
        throw new RangeError(i.toString());
    }
  }) as readonly kitchenSink.ClassUnion[],

  concreteChildClasses: [...new Array(4)].map(
    (_, i) =>
      new kitchenSink.ConcreteChildClass({
        abstractBaseClassWithPropertiesProperty: `ABC string ${i}`,
        concreteChildClassProperty: `child string ${i}`,
        concreteParentClassProperty: `parent string ${i}`,
        $identifier: N3.DataFactory.namedNode(
          `http://example.com/concreteChildClass${i}`,
        ),
      }),
  ) satisfies readonly kitchenSink.ConcreteChildClass[],

  directRecursiveClasses: [...new Array(4)].map(
    (_, i) =>
      new kitchenSink.DirectRecursiveClass({
        directRecursiveProperty: new kitchenSink.DirectRecursiveClass({
          $identifier: N3.DataFactory.namedNode(
            `http://example.com/directRecursiveClass${i}/directRecursiveProperty/value`,
          ),
        }),
        $identifier: N3.DataFactory.namedNode(
          `http://example.com/directRecursiveClass${i}`,
        ),
      }),
  ) satisfies readonly kitchenSink.DirectRecursiveClass[],

  interfaceUnions: [...new Array(4)].map((_, i) => {
    switch (i % 3) {
      case 0:
        return {
          $identifier: N3.DataFactory.namedNode(
            `http://example.com/interfaceUnion${i}`,
          ),
          interfaceUnionMember1Property: `string ${i}`,
          $type: "InterfaceUnionMember1",
        } satisfies kitchenSink.InterfaceUnion;
      case 1:
        return {
          $identifier: N3.DataFactory.namedNode(
            `http://example.com/interfaceUnion${i}`,
          ),
          interfaceUnionMember2aProperty: `string ${i}`,
          $type: "InterfaceUnionMember2a",
        } satisfies kitchenSink.InterfaceUnion;
      case 2:
        return {
          $identifier: N3.DataFactory.namedNode(
            `http://example.com/interfaceUnion${i}`,
          ),
          interfaceUnionMember2bProperty: `string ${i}`,
          $type: "InterfaceUnionMember2b",
        } satisfies kitchenSink.InterfaceUnion;
      default:
        throw new RangeError(i.toString());
    }
  }) as kitchenSink.InterfaceUnion[],
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
    for (const object of testData.classClassUnions) {
      object.$toRdf({ resourceSet, mutateGraph });
    }
    for (const object of testData.concreteChildClasses) {
      object.$toRdf({ resourceSet, mutateGraph });
    }
    for (const object of testData.directRecursiveClasses) {
      object.$toRdf({ resourceSet, mutateGraph });
    }
    for (const object of testData.interfaceUnions) {
      kitchenSink.InterfaceUnion.$toRdf(object, {
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
        await objectSet.concreteChildClass(
          testData.concreteChildClasses[0].$identifier,
        )
      )
        .unsafeCoerce()
        .$equals(testData.concreteChildClasses[0])
        .unsafeCoerce(),
    ).toBe(true);
  });

  it("objectIdentifiers (no options)", async ({ expect }) => {
    expect(
      (await objectSet.concreteChildClassIdentifiers())
        .unsafeCoerce()
        .map((identifier) => identifier.value),
    ).toStrictEqual(
      testData.concreteChildClasses.map((object) => object.$identifier.value),
    );
  });

  it("objectIdentifiers (limit 1)", async ({ expect }) => {
    expect(
      (await objectSet.concreteChildClassIdentifiers({ limit: 1 }))
        .unsafeCoerce()
        .map((identifier) => identifier.value),
    ).toStrictEqual([testData.concreteChildClasses[0].$identifier.value]);
  });

  it("objectIdentifiers (offset 1)", async ({ expect }) => {
    expect(
      (
        await objectSet.concreteChildClassIdentifiers({
          offset: 1,
        })
      )
        .unsafeCoerce()
        .map((identifier) => identifier.value),
    ).toStrictEqual(
      testData.concreteChildClasses
        .slice(1)
        .map((object) => object.$identifier.value),
    );
  });

  it("objectIdentifiers (limit 2 offset 1)", async ({ expect }) => {
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
      testData.concreteChildClasses[1].$identifier.value,
      testData.concreteChildClasses[2].$identifier.value,
    ]);
  });

  it("objectIdentifiers (triple-objects)", async ({ expect }) => {
    for (const directRecursiveClass of testData.directRecursiveClasses) {
      expect(
        (
          await objectSet.directRecursiveClassIdentifiers({
            where: {
              subject: directRecursiveClass.$identifier,
              predicate:
                kitchenSink.DirectRecursiveClass.$properties
                  .directRecursiveProperty.identifier,
              type: "triple-objects",
            },
          })
        )
          .unsafeCoerce()
          .map((identifier) => identifier.value)
          .sort(),
      ).toStrictEqual([
        directRecursiveClass.directRecursiveProperty.unsafeCoerce().$identifier
          .value,
      ]);
    }
  });

  it("objects (all identifiers)", async ({ expect }) => {
    const actualObjects = (
      await objectSet.concreteChildClasses({
        where: {
          identifiers: testData.concreteChildClasses.map(
            (object) => object.$identifier,
          ),
          type: "identifiers",
        },
      })
    ).unsafeCoerce();
    expect(actualObjects).toHaveLength(testData.concreteChildClasses.length);
    for (const expectedObject of testData.concreteChildClasses) {
      expect(
        actualObjects.some((actualObject) =>
          actualObject.$equals(expectedObject).isRight(),
        ),
      );
    }
  });

  it("objects (subset of identifiers)", async ({ expect }) => {
    const sliceStart = 2;
    const actualObjects = (
      await objectSet.concreteChildClasses({
        where: {
          identifiers: testData.concreteChildClasses
            .slice(sliceStart)
            .map((object) => object.$identifier),
          type: "identifiers",
        },
      })
    ).unsafeCoerce();
    expect(actualObjects).toHaveLength(
      testData.concreteChildClasses.slice(sliceStart).length,
    );
    for (const expectedObject of testData.concreteChildClasses.slice(
      sliceStart,
    )) {
      expect(
        actualObjects.some((actualObject) =>
          actualObject.$equals(expectedObject).isRight(),
        ),
      );
    }
  });

  it("objects (known subclasses)", async ({ expect }) => {
    const parentClasses = (
      await objectSet.concreteParentClasses()
    ).unsafeCoerce();
    expect(parentClasses).toHaveLength(testData.concreteChildClasses.length);
    for (const childClass of testData.concreteChildClasses) {
      // parentClass may be an instance of the parent class rather than the child class, depending on the implementation
      expect(
        parentClasses.some((parentClass) =>
          parentClass.$equals(childClass).isRight(),
        ),
      );
    }
  });

  it("objectsCount", async ({ expect }) => {
    expect(
      (await objectSet.concreteChildClassesCount()).unsafeCoerce(),
    ).toStrictEqual(testData.concreteChildClasses.length);
  });

  it("objectUnion (class with fromRdfType)", async ({ expect }) => {
    for (const expectedClassClassUnion of testData.classClassUnions) {
      expect(
        (await objectSet.classUnion(expectedClassClassUnion.$identifier))
          .unsafeCoerce()
          .$equals(expectedClassClassUnion as any)
          .unsafeCoerce(),
      ).toBe(true);
    }
  });

  it("objectUnion (interface without fromRdfType)", async ({ expect }) => {
    for (const expectedInterfaceUnion of testData.interfaceUnions) {
      const actualInterfaceUnion = (
        await objectSet.interfaceUnion(expectedInterfaceUnion.$identifier)
      ).unsafeCoerce();
      const equalsResult = kitchenSink.InterfaceUnion.$equals(
        expectedInterfaceUnion,
        actualInterfaceUnion,
      );
      expect(equalsResult.unsafeCoerce()).toBe(true);
    }
  });

  it("objectUnionIdentifiers (no options)", async ({ expect }) => {
    expect(
      new Set(
        (await objectSet.classUnionIdentifiers())
          .unsafeCoerce()
          .map((identifier) => identifier.value),
      ),
    ).toStrictEqual(
      new Set(
        testData.classClassUnions.map((object) => object.$identifier.value),
      ),
    );
  });

  it("objectUnionIdentifiers (limit 1)", async ({ expect }) => {
    expect(
      (await objectSet.classUnionIdentifiers({ limit: 1 }))
        .unsafeCoerce()
        .map((identifier) => identifier.value),
    ).toStrictEqual([testData.classClassUnions[0].$identifier.value]);
  });

  it("objectUnions (all identifiers)", async ({ expect }) => {
    const actualObjects = (
      await objectSet.interfaceUnions({
        where: {
          identifiers: testData.interfaceUnions.map(
            (object) => object.$identifier,
          ),
          type: "identifiers",
        },
      })
    ).unsafeCoerce();
    expect(actualObjects).toHaveLength(testData.concreteChildClasses.length);
    for (const expectedObject of testData.interfaceUnions) {
      expect(
        actualObjects.some((actualObject) =>
          kitchenSink.InterfaceUnion.$equals(
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
      await objectSet.classUnions({
        where: {
          identifiers: testData.classClassUnions
            .slice(sliceStart)
            .map((object) => object.$identifier),
          type: "identifiers",
        },
      })
    ).unsafeCoerce();
    expect(actualObjects).toHaveLength(
      testData.classClassUnions.slice(sliceStart).length,
    );
    for (const expectedObject of testData.classClassUnions.slice(sliceStart)) {
      expect(
        actualObjects.some((actualObject) =>
          kitchenSink.ClassUnion.$equals(
            expectedObject,
            actualObject,
          ).isRight(),
        ),
      );
    }
  });

  it("objectUnionsCount (no fromRdfTypes)", async ({ expect }) => {
    expect(
      (await objectSet.interfaceUnionsCount()).unsafeCoerce(),
    ).toStrictEqual(
      !(objectSet instanceof kitchenSink.$SparqlObjectSet)
        ? 0
        : testData.interfaceUnions.length,
    );
  });

  it("objectUnionsCount (with fromRdfTypes)", async ({ expect }) => {
    expect((await objectSet.classUnionsCount()).unsafeCoerce()).toStrictEqual(
      testData.classClassUnions.length,
    );
  });
}
