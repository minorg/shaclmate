import * as kitchenSink from "@shaclmate/kitchen-sink-example";
import N3 from "n3";
import { describe, it } from "vitest";

const testData = {
  blankNodeOrIriIdentifierClasses: [...new Array(4)].map(
    (_, i) =>
      new kitchenSink.BlankNodeOrIriIdentifierClass({
        $identifier:
          i % 2 === 0
            ? N3.DataFactory.blankNode()
            : N3.DataFactory.namedNode(
                `http://example.com/blankNodeOrIriIdentifierClass${i}`,
              ),
      }),
  ) satisfies readonly kitchenSink.BlankNodeOrIriIdentifierClass[],

  classUnions: [...new Array(4)].map((_, i) => {
    switch (i % 2) {
      case 0:
        return new kitchenSink.ClassUnionMember1({
          $identifier: N3.DataFactory.namedNode(
            `http://example.com/classUnion${i}`,
          ),
          classUnionMemberCommonParentProperty: `common parent ${i}`,
          classUnionMember1Property: `member ${i}`,
        });
      case 1:
        return new kitchenSink.ClassUnionMember2({
          $identifier: N3.DataFactory.namedNode(
            `http://example.com/classUnion${i}`,
          ),
          classUnionMemberCommonParentProperty: `common parent ${i}`,
          classUnionMember2Property: `member ${i}`,
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
    switch (i % 2) {
      case 0:
        return {
          $identifier: N3.DataFactory.namedNode(
            `http://example.com/interfaceUnion${i}`,
          ),
          interfaceUnionMemberCommonParentProperty: `common parent ${i}`,
          interfaceUnionMember1Property: `string ${i}`,
          $type: "InterfaceUnionMember1",
        } satisfies kitchenSink.InterfaceUnion;
      case 1:
        return {
          $identifier: N3.DataFactory.namedNode(
            `http://example.com/interfaceUnion${i}`,
          ),
          interfaceUnionMemberCommonParentProperty: `common parent ${i}`,
          interfaceUnionMember2Property: `string ${i}`,
          $type: "InterfaceUnionMember2",
        } satisfies kitchenSink.InterfaceUnion;
      default:
        throw new RangeError(i.toString());
    }
  }) as kitchenSink.InterfaceUnion[],

  noRdfTypeClassUnions: [...new Array(4)].map((_, i) => {
    switch (i % 2) {
      case 0:
        return new kitchenSink.NoRdfTypeClassUnionMember1({
          $identifier: N3.DataFactory.namedNode(
            `http://example.com/noRdfTypeClassUnion${i}`,
          ),
          noRdfTypeClassUnionMember1Property: `member ${i}`,
        });
      case 1:
        return new kitchenSink.NoRdfTypeClassUnionMember2({
          $identifier: N3.DataFactory.namedNode(
            `http://example.com/noRdfTypeClassUnion${i}`,
          ),
          noRdfTypeClassUnionMember2Property: `member ${i}`,
        });
      default:
        throw new RangeError(i.toString());
    }
  }) as readonly kitchenSink.NoRdfTypeClassUnion[],
};

export function behavesLikeObjectSet(
  createObjectSet: (
    ...instances: kitchenSink.$Object[]
  ) => kitchenSink.$ObjectSet,
) {
  describe("object", () => {
    it("concrete child class", async ({ expect }) => {
      const objectSet = createObjectSet(...testData.concreteChildClasses);
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

    it("concrete parent class", async ({ expect }) => {
      const objectSet = createObjectSet(...testData.concreteChildClasses);
      const expectedObject = testData.concreteChildClasses[0];
      const actualObject = (
        await objectSet.concreteParentClass(expectedObject.$identifier)
      ).unsafeCoerce();
      expect(actualObject).toBeInstanceOf(kitchenSink.ConcreteParentClass);
      expect(actualObject).not.toBeInstanceOf(kitchenSink.ConcreteChildClass);
      expect(
        actualObject.abstractBaseClassWithPropertiesProperty,
      ).toStrictEqual(expectedObject.abstractBaseClassWithPropertiesProperty);
      expect(actualObject.concreteParentClassProperty).toStrictEqual(
        expectedObject.concreteParentClassProperty,
      );
    });

    describe("union", () => {
      it("with fromRdfType", async ({ expect }) => {
        const objectSet = createObjectSet(...testData.classUnions);
        for (const expectedClassUnion of testData.classUnions) {
          expect(
            (await objectSet.classUnion(expectedClassUnion.$identifier))
              .unsafeCoerce()
              .$equals(expectedClassUnion as any)
              .unsafeCoerce(),
          ).toBe(true);
        }
      });

      it("without fromRdfType", async ({ expect }) => {
        const objectSet = createObjectSet(...testData.noRdfTypeClassUnions);
        for (const expectedClassUnion of testData.noRdfTypeClassUnions) {
          const actualClassUnion = (
            await objectSet.noRdfTypeClassUnion(expectedClassUnion.$identifier)
          ).unsafeCoerce();
          const equalsResult = kitchenSink.NoRdfTypeClassUnion.$equals(
            expectedClassUnion,
            actualClassUnion,
          );
          expect(equalsResult.unsafeCoerce()).toBe(true);
        }
      });
    });
  });

  describe("objectIdentifiers", () => {
    it("no options", async ({ expect }) => {
      const objectSet = createObjectSet(...testData.concreteChildClasses);
      expect(
        (await objectSet.concreteChildClassIdentifiers())
          .unsafeCoerce()
          .map((identifier) => identifier.value),
      ).toStrictEqual(
        testData.concreteChildClasses.map((object) => object.$identifier.value),
      );
    });

    it("limit 1", async ({ expect }) => {
      const objectSet = createObjectSet(...testData.concreteChildClasses);
      expect(
        (await objectSet.concreteChildClassIdentifiers({ limit: 1 }))
          .unsafeCoerce()
          .map((identifier) => identifier.value),
      ).toStrictEqual([testData.concreteChildClasses[0].$identifier.value]);
    });

    it("offset 1", async ({ expect }) => {
      const objectSet = createObjectSet(...testData.concreteChildClasses);
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

    it("limit 2 offset 1", async ({ expect }) => {
      const objectSet = createObjectSet(...testData.concreteChildClasses);
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

    describe("union", () => {
      it("with fromRdfType", async ({ expect }) => {
        const objectSet = createObjectSet(...testData.classUnions);
        expect(
          new Set(
            (await objectSet.classUnionIdentifiers())
              .unsafeCoerce()
              .map((identifier) => identifier.value),
          ),
        ).toStrictEqual(
          new Set(
            testData.classUnions.map((object) => object.$identifier.value),
          ),
        );
      });

      it("limit 1", async ({ expect }) => {
        const objectSet = createObjectSet(...testData.classUnions);
        expect(
          (await objectSet.classUnionIdentifiers({ limit: 1 }))
            .unsafeCoerce()
            .map((identifier) => identifier.value),
        ).toStrictEqual([testData.classUnions[0].$identifier.value]);
      });
    });
  });

  describe("objects", () => {
    // it("all identifiers", async ({ expect }) => {
    //   const actualObjects = (
    //     await objectSet.concreteChildClasses({
    //       where: {
    //         identifiers: testData.concreteChildClasses.map(
    //           (object) => object.$identifier,
    //         ),
    //         type: "identifiers",
    //       },
    //     })
    //   ).unsafeCoerce();
    //   expect(actualObjects).toHaveLength(testData.concreteChildClasses.length);
    //   for (const expectedObject of testData.concreteChildClasses) {
    //     expect(
    //       actualObjects.some((actualObject) =>
    //         actualObject.$equals(expectedObject).isRight(),
    //       ),
    //     );
    //   }
    // });

    // it("subset of identifiers", async ({ expect }) => {
    //   const sliceStart = 2;
    //   const actualObjects = (
    //     await objectSet.concreteChildClasses({
    //       where: {
    //         identifiers: testData.concreteChildClasses
    //           .slice(sliceStart)
    //           .map((object) => object.$identifier),
    //         type: "identifiers",
    //       },
    //     })
    //   ).unsafeCoerce();
    //   expect(actualObjects).toHaveLength(
    //     testData.concreteChildClasses.slice(sliceStart).length,
    //   );
    //   for (const expectedObject of testData.concreteChildClasses.slice(
    //     sliceStart,
    //   )) {
    //     expect(
    //       actualObjects.some((actualObject) =>
    //         actualObject.$equals(expectedObject).isRight(),
    //       ),
    //     );
    //   }
    // });

    it("known subclasses", async ({ expect }) => {
      const objectSet = createObjectSet(...testData.concreteChildClasses);
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

    // it("objects (identifier type)", async ({ expect }) => {
    //   if (objectSet instanceof kitchenSink.$SparqlObjectSet) {
    //     return;
    //   }

    //   {
    //     const actualObjects = (
    //       await objectSet.blankNodeOrIriIdentifierClasses()
    //     ).unsafeCoerce();
    //     expect(actualObjects).toHaveLength(4);
    //     expect(
    //       actualObjects.filter(
    //         (actualObject) => actualObject.$identifier.termType === "BlankNode",
    //       ),
    //     ).toHaveLength(2);
    //   }

    //   {
    //     const actualObjects = (
    //       await objectSet.blankNodeOrIriIdentifierClasses({
    //         where: { identifierType: "NamedNode", type: "type" },
    //       })
    //     ).unsafeCoerce();
    //     expect(actualObjects).toHaveLength(2);
    //     for (const actualObject of actualObjects) {
    //       expect(actualObject.$identifier.termType).toStrictEqual("NamedNode");
    //     }
    //   }
    // });
  });

  describe("objectsCount", () => {
    it("objectsCount", async ({ expect }) => {
      const objectSet = createObjectSet(...testData.concreteChildClasses);
      expect(
        (await objectSet.concreteChildClassesCount()).unsafeCoerce(),
      ).toStrictEqual(testData.concreteChildClasses.length);
    });

    describe("union", () => {
      it("with fromRdfTypes", async ({ expect }) => {
        const objectSet = createObjectSet(...testData.classUnions);
        expect(
          (await objectSet.classUnionsCount()).unsafeCoerce(),
        ).toStrictEqual(testData.classUnions.length);
      });

      it("without fromRdfTypes", async ({ expect }) => {
        const objectSet = createObjectSet(...testData.noRdfTypeClassUnions);
        expect(
          (await objectSet.noRdfTypeClassUnionsCount()).unsafeCoerce(),
        ).toStrictEqual(testData.interfaceUnions.length);
      });
    });
  });

  // it("objectUnions (all identifiers)", async ({ expect }) => {
  //   const actualObjects = (
  //     await objectSet.interfaceUnions({
  //       where: {
  //         identifiers: testData.interfaceUnions.map(
  //           (object) => object.$identifier,
  //         ),
  //         type: "identifiers",
  //       },
  //     })
  //   ).unsafeCoerce();
  //   expect(actualObjects).toHaveLength(testData.concreteChildClasses.length);
  //   for (const expectedObject of testData.interfaceUnions) {
  //     expect(
  //       actualObjects.some((actualObject) =>
  //         kitchenSink.InterfaceUnion.$equals(
  //           expectedObject,
  //           actualObject,
  //         ).isRight(),
  //       ),
  //     );
  //   }
  // });

  // it("objectUnions (subset of identifiers)", async ({ expect }) => {
  //   const sliceStart = 2;
  //   const actualObjects = (
  //     await objectSet.classUnions({
  //       where: {
  //         identifiers: testData.classUnions
  //           .slice(sliceStart)
  //           .map((object) => object.$identifier),
  //         type: "identifiers",
  //       },
  //     })
  //   ).unsafeCoerce();
  //   expect(actualObjects).toHaveLength(
  //     testData.classUnions.slice(sliceStart).length,
  //   );
  //   for (const expectedObject of testData.classUnions.slice(sliceStart)) {
  //     expect(
  //       actualObjects.some((actualObject) =>
  //         kitchenSink.ClassUnion.$equals(
  //           expectedObject,
  //           actualObject,
  //         ).isRight(),
  //       ),
  //     );
  //   }
  // });
}
