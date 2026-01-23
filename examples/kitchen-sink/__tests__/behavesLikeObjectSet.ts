import type { BlankNode } from "@rdfjs/types";
import * as kitchenSink from "@shaclmate/kitchen-sink-example";
import { xsd } from "@tpluscode/rdf-ns-builders";
import N3, { DataFactory, type NamedNode } from "n3";
import { NonEmptyList } from "purify-ts";
import { describe, it } from "vitest";
import { harnesses } from "./harnesses.js";

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

  // directRecursiveClasses: [...new Array(4)].map(
  //   (_, i) =>
  //     new kitchenSink.DirectRecursiveClass({
  //       directRecursiveProperty: new kitchenSink.DirectRecursiveClass({
  //         $identifier: N3.DataFactory.namedNode(
  //           `http://example.com/directRecursiveClass${i}/directRecursiveProperty/value`,
  //         ),
  //       }),
  //       $identifier: N3.DataFactory.namedNode(
  //         `http://example.com/directRecursiveClass${i}`,
  //       ),
  //     }),
  // ) satisfies readonly kitchenSink.DirectRecursiveClass[],

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
      it("class with fromRdfType", async ({ expect }) => {
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

      it("class without fromRdfType", async ({ expect }) => {
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

      it("interface", async ({ expect }) => {
        const objectSet = createObjectSet(...testData.interfaceUnions);
        for (const expectedInterfaceUnion of testData.interfaceUnions) {
          const actualClassUnion = (
            await objectSet.interfaceUnion(expectedInterfaceUnion.$identifier)
          ).unsafeCoerce();
          const equalsResult = kitchenSink.InterfaceUnion.$equals(
            expectedInterfaceUnion,
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

    describe("filter", () => {
      const identifiers = [...new Array(10)].map((_, i) =>
        DataFactory.namedNode(`http://example.com/${i}`),
      );

      describe("blank node", () => {
        const objectSet = createObjectSet(
          new kitchenSink.TermPropertiesClass({
            blankNodeTermProperty: DataFactory.blankNode(),
          }),
          new kitchenSink.TermPropertiesClass({
            $identifier: identifiers[1],
            stringTermProperty: "test",
          }),
        );

        for (const [id, [filter, expected]] of Object.entries({
          present: [{ blankNodeTermProperty: {} }, [identifiers[0]]],
        } satisfies Record<
          string,
          [kitchenSink.TermPropertiesClass.$Filter, readonly NamedNode[]]
        >)) {
          it(id, async ({ expect }) => {
            const actual = (
              await objectSet.termPropertiesClassIdentifiers({
                filter,
              })
            ).unsafeCoerce();
            expect(actual).toHaveLength(expected.length);
            for (let i = 0; i < expected.length; i++) {
              expect(expected[i].equals(actual[i]));
            }
          });
        }
      });

      describe("boolean", () => {
        const objectSet = createObjectSet(
          ...[...new Array(2)].map(
            (_, i) =>
              new kitchenSink.TermPropertiesClass({
                $identifier: identifiers[i],
                booleanTermProperty: i === 0,
              }),
          ),
          new kitchenSink.TermPropertiesClass({
            $identifier: identifiers[2],
            stringTermProperty: "test",
          }),
        );

        for (const [id, [filter, expected]] of Object.entries({
          valueFalse: [
            { booleanTermProperty: { value: false } },
            [identifiers[1]],
          ],
          valueTrue: [
            { booleanTermProperty: { value: true } },
            [identifiers[0]],
          ],
        } satisfies Record<
          string,
          [kitchenSink.TermPropertiesClass.$Filter, readonly NamedNode[]]
        >)) {
          it(id, async ({ expect }) => {
            const actual = (
              await objectSet.termPropertiesClassIdentifiers({
                filter,
              })
            ).unsafeCoerce();
            expect(actual).toHaveLength(expected.length);
            for (let i = 0; i < expected.length; i++) {
              expect(expected[i].equals(actual[i]));
            }
          });
        }
      });

      describe("Date", () => {
        const baseValue = new Date(1523268000000);

        const objectSet = createObjectSet(
          ...[...new Array(2)].map(
            (_, i) =>
              new kitchenSink.TermPropertiesClass({
                $identifier: identifiers[i],
                dateTimeTermProperty: new Date(baseValue.getTime() + i * 1000),
              }),
          ),
          new kitchenSink.TermPropertiesClass({
            $identifier: identifiers[2],
            stringTermProperty: "test",
          }),
        );

        for (const [id, [filter, expected]] of Object.entries({
          in: [{ dateTimeTermProperty: { in: [baseValue] } }, [identifiers[0]]],
          maxExclusive: [
            {
              dateTimeTermProperty: {
                maxExclusive: new Date(baseValue.getTime() + 1000),
              },
            },
            [identifiers[0]],
          ],
          maxInclusive: [
            { dateTimeTermProperty: { maxInclusive: baseValue } },
            [identifiers[0]],
          ],
          minExclusive: [
            { dateTimeTermProperty: { minExclusive: baseValue } },
            [identifiers[1]],
          ],
          minInclusive: [
            { dateTimeTermProperty: { minInclusive: baseValue } },
            [identifiers[0], identifiers[1]],
          ],
        } satisfies Record<
          string,
          [kitchenSink.TermPropertiesClass.$Filter, readonly NamedNode[]]
        >)) {
          it(id, async ({ expect }) => {
            const actual = (
              await objectSet.termPropertiesClassIdentifiers({
                filter,
              })
            ).unsafeCoerce();
            expect(actual).toHaveLength(expected.length);
            for (let i = 0; i < expected.length; i++) {
              expect(expected[i].equals(actual[i]));
            }
          });
        }
      });

      describe("identifier", () => {
        const blankNodeIdentifier = DataFactory.blankNode();
        const namedNodeIdentifier = DataFactory.namedNode("http://example.com");

        const objectSet = createObjectSet(
          new kitchenSink.TermPropertiesClass({
            $identifier: blankNodeIdentifier,
            stringTermProperty: "ignored",
          }),
          new kitchenSink.TermPropertiesClass({
            $identifier: namedNodeIdentifier,
            stringTermProperty: "ignored",
          }),
        );

        for (const [id, [filter, expected]] of Object.entries({
          in: [
            { $identifier: { in: [namedNodeIdentifier] } },
            [namedNodeIdentifier],
          ],
          typeBlankNode: [
            { $identifier: { type: "BlankNode" } },
            [blankNodeIdentifier],
          ],
          typeNamedNode: [
            { $identifier: { type: "NamedNode" } },
            [namedNodeIdentifier],
          ],
        } satisfies Record<
          string,
          [
            kitchenSink.TermPropertiesClass.$Filter,
            readonly (BlankNode | NamedNode)[],
          ]
        >)) {
          it(id, async ({ expect }) => {
            const actual = (
              await objectSet.termPropertiesClassIdentifiers({
                filter,
              })
            ).unsafeCoerce();
            expect(actual).toHaveLength(expected.length);
            for (let i = 0; i < expected.length; i++) {
              if (expected[i].termType === "NamedNode") {
                expect(expected[i].equals(actual[i]));
              }
            }
          });
        }
      });

      describe("literal", () => {
        const objectSet = createObjectSet(
          new kitchenSink.TermPropertiesClass({
            $identifier: identifiers[0],
            literalTermProperty: DataFactory.literal("test"),
          }),
          new kitchenSink.TermPropertiesClass({
            $identifier: identifiers[1],
            literalTermProperty: DataFactory.literal("test", "en"),
          }),
          new kitchenSink.TermPropertiesClass({
            $identifier: identifiers[2],
            literalTermProperty: DataFactory.literal(1, xsd.integer),
          }),
        );

        for (const [id, [filter, expected]] of Object.entries({
          datatypeIn: [
            { literalTermProperty: { datatypeIn: [xsd.integer] } },
            [identifiers[2]],
          ],
          in: [
            { literalTermProperty: { in: [DataFactory.literal("test")] } },
            [identifiers[0]],
          ],
          languageIn: [
            { literalTermProperty: { languageIn: ["en"] } },
            [identifiers[1]],
          ],
        } satisfies Record<
          string,
          [kitchenSink.TermPropertiesClass.$Filter, readonly NamedNode[]]
        >)) {
          it(id, async ({ expect }) => {
            const actual = (
              await objectSet.termPropertiesClassIdentifiers({
                filter,
              })
            ).unsafeCoerce();
            expect(actual).toHaveLength(expected.length);
            for (let i = 0; i < expected.length; i++) {
              expect(expected[i].equals(actual[i]));
            }
          });
        }
      });

      describe("named node", () => {
        const objectSet = createObjectSet(
          ...[...new Array(2)].map(
            (_, i) =>
              new kitchenSink.TermPropertiesClass({
                $identifier: identifiers[i],
                iriTermProperty: DataFactory.namedNode(
                  `http://example.com/prop${i}`,
                ),
              }),
          ),
          new kitchenSink.TermPropertiesClass({
            $identifier: identifiers[2],
            stringTermProperty: "test",
          }),
        );

        for (const [id, [filter, expected]] of Object.entries({
          in: [
            {
              iriTermProperty: {
                in: [DataFactory.namedNode("http://example.com/prop0")],
              },
            },
            [identifiers[0]],
          ],
        } satisfies Record<
          string,
          [kitchenSink.TermPropertiesClass.$Filter, readonly NamedNode[]]
        >)) {
          it(id, async ({ expect }) => {
            const actual = (
              await objectSet.termPropertiesClassIdentifiers({
                filter,
              })
            ).unsafeCoerce();
            expect(actual).toHaveLength(expected.length);
            for (let i = 0; i < expected.length; i++) {
              expect(expected[i].equals(actual[i]));
            }
          });
        }
      });

      describe("number", () => {
        const objectSet = createObjectSet(
          ...[...new Array(2)].map(
            (_, i) =>
              new kitchenSink.TermPropertiesClass({
                $identifier: identifiers[i],
                numberTermProperty: i,
              }),
          ),
          new kitchenSink.TermPropertiesClass({
            $identifier: identifiers[2],
            stringTermProperty: "test",
          }),
        );

        for (const [id, [filter, expected]] of Object.entries({
          in: [{ numberTermProperty: { in: [0] } }, [identifiers[0]]],
          maxExclusive: [
            { numberTermProperty: { maxExclusive: 1 } },
            [identifiers[0]],
          ],
          maxInclusive: [
            { numberTermProperty: { maxInclusive: 0 } },
            [identifiers[0]],
          ],
          minExclusive: [
            { numberTermProperty: { minExclusive: 0 } },
            [identifiers[1]],
          ],
          minInclusive: [
            { numberTermProperty: { minInclusive: 0 } },
            [identifiers[0], identifiers[1]],
          ],
        } satisfies Record<
          string,
          [kitchenSink.TermPropertiesClass.$Filter, readonly NamedNode[]]
        >)) {
          it(id, async ({ expect }) => {
            const actual = (
              await objectSet.termPropertiesClassIdentifiers({
                filter,
              })
            ).unsafeCoerce();
            expect(actual).toHaveLength(expected.length);
            for (let i = 0; i < expected.length; i++) {
              expect(expected[i].equals(actual[i]));
            }
          });
        }
      });

      describe("object", () => {
        const objectSet = createObjectSet(
          ...[...new Array(2)].map(
            (_, i) =>
              new kitchenSink.ConcreteChildClass({
                abstractBaseClassWithPropertiesProperty: `test${i}`,
                $identifier: identifiers[i],
                concreteChildClassProperty: `test${i}`,
                concreteParentClassProperty: `test${i}`,
              }),
          ),
          new kitchenSink.TermPropertiesClass({
            $identifier: identifiers[2],
            numberTermProperty: 0,
          }),
        );

        for (const [id, [filter, expected]] of Object.entries({
          childProperty: [
            { concreteChildClassProperty: { in: ["test1"] } },
            [identifiers[1]],
          ],
          identifier: [
            { $identifier: { in: [identifiers[1]] } },
            [identifiers[1]],
          ],
          parentProperty: [
            { concreteParentClassProperty: { in: ["test0"] } },
            [identifiers[0]],
          ],
        } satisfies Record<
          string,
          [kitchenSink.ConcreteChildClass.$Filter, readonly NamedNode[]]
        >)) {
          it(id, async ({ expect }) => {
            const actual = (
              await objectSet.concreteChildClassIdentifiers({
                filter,
              })
            ).unsafeCoerce();
            expect(actual).toHaveLength(expected.length);
            for (let i = 0; i < expected.length; i++) {
              expect(expected[i].equals(actual[i]));
            }
          });
        }
      });

      describe("object union", () => {
        const objectSet = createObjectSet(
          ...[...new Array(2)].map((_, i) =>
            i === 0
              ? new kitchenSink.ClassUnionMember1({
                  $identifier: identifiers[i],
                  classUnionMember1Property: `test${i}`,
                  classUnionMemberCommonParentProperty: `test${i}`,
                })
              : new kitchenSink.ClassUnionMember2({
                  $identifier: identifiers[i],
                  classUnionMember2Property: `test${i}`,
                  classUnionMemberCommonParentProperty: `test${i}`,
                }),
          ),
          new kitchenSink.TermPropertiesClass({
            $identifier: identifiers[2],
            numberTermProperty: 0,
          }),
        );

        for (const [id, [filter, expected]] of Object.entries({
          identifier: [
            { $identifier: { in: [identifiers[0]] } },
            [identifiers[0]],
          ],
          noOn: [{}, [identifiers[0], identifiers[1]]],
          onBothMembersPositive: [
            {
              on: {
                ClassUnionMember1: {
                  classUnionMemberCommonParentProperty: { in: ["test0"] },
                },
                ClassUnionMember2: {
                  classUnionMemberCommonParentProperty: { in: ["test1"] },
                },
              },
            },
            [identifiers[0], identifiers[1]],
          ],
          onMember1Negative: [
            {
              on: {
                ClassUnionMember1: {
                  classUnionMemberCommonParentProperty: { in: ["test1"] },
                },
              },
            },
            [identifiers[1]],
          ],
          onMember1Positive: [
            {
              on: {
                ClassUnionMember1: {
                  classUnionMemberCommonParentProperty: { in: ["test0"] },
                },
              },
            },
            [identifiers[0], identifiers[1]],
          ],
          onMember2Negative: [
            {
              on: {
                ClassUnionMember2: {
                  classUnionMemberCommonParentProperty: { in: ["test0"] },
                },
              },
            },
            [identifiers[0]],
          ],
          onMember2Positive: [
            {
              on: {
                ClassUnionMember2: {
                  classUnionMemberCommonParentProperty: { in: ["test1"] },
                },
              },
            },
            [identifiers[1], identifiers[1]],
          ],
        } satisfies Record<
          string,
          [kitchenSink.ClassUnion.$Filter, readonly NamedNode[]]
        >)) {
          it(id, async ({ expect }) => {
            const actual = (
              await objectSet.classUnionIdentifiers({
                filter,
              })
            ).unsafeCoerce();
            expect(actual).toHaveLength(expected.length);
            for (let i = 0; i < expected.length; i++) {
              expect(expected[i].equals(actual[i]));
            }
          });
        }
      });

      describe("option", () => {
        const instance = new kitchenSink.TermPropertiesClass({
          booleanTermProperty: true,
          $identifier: identifiers[0],
        });
        const objectSet = createObjectSet(instance);

        for (const [id, [filter, expected]] of Object.entries({
          null1: [{ booleanTermProperty: null }, []],
          null2: [{ stringTermProperty: null }, [identifiers[0]]],
          nonNull1: [{ booleanTermProperty: {} }, [identifiers[0]]],
          nonNull2: [{ stringTermProperty: {} }, []],
        } satisfies Record<
          string,
          [kitchenSink.TermPropertiesClass.$Filter, readonly NamedNode[]]
        >)) {
          it(id, async ({ expect }) => {
            const actual = (
              await objectSet.termPropertiesClassIdentifiers({
                filter,
              })
            ).unsafeCoerce();
            expect(actual).toHaveLength(expected.length);
            for (let i = 0; i < expected.length; i++) {
              expect(expected[i].equals(actual[i]));
            }
          });
        }
      });

      describe("set", () => {
        const value = "test";
        const objectSet = createObjectSet(
          new kitchenSink.PropertyCardinalitiesClass({
            $identifier: identifiers[0],
            emptyStringSetProperty: [value],
            nonEmptyStringSetProperty: NonEmptyList([value]),
            requiredStringProperty: value,
          }),
        );

        for (const [id, [filter, expected]] of Object.entries({
          items: [
            { emptyStringSetProperty: { in: [value] } },
            [identifiers[0]],
          ],
          ...(!(objectSet instanceof kitchenSink.$SparqlObjectSet)
            ? {
                maxCount0: [{ emptyStringSetProperty: { $maxCount: 0 } }, []],
                maxCount1: [
                  { emptyStringSetProperty: { $maxCount: 1 } },
                  [identifiers[0]],
                ],
                minCount1: [
                  { emptyStringSetProperty: { $minCount: 1 } },
                  [identifiers[0]],
                ],
                minCount2: [{ emptyStringSetProperty: { $minCount: 2 } }, []],
              }
            : {}),
        } satisfies Record<
          string,
          [kitchenSink.PropertyCardinalitiesClass.$Filter, readonly NamedNode[]]
        >))
          it(id, async ({ expect }) => {
            const actual = (
              await objectSet.propertyCardinalitiesClassIdentifiers({
                filter,
              })
            ).unsafeCoerce();
            expect(actual).toHaveLength(expected.length);
            for (let i = 0; i < expected.length; i++) {
              expect(expected[i].equals(actual[i]));
            }
          });
      });

      describe("string", () => {
        const objectSet = createObjectSet(
          ...[...new Array(2)].map(
            (_, i) =>
              new kitchenSink.TermPropertiesClass({
                $identifier: identifiers[i],
                stringTermProperty: "x".repeat(i + 1),
              }),
          ),
          new kitchenSink.TermPropertiesClass({
            $identifier: identifiers[2],
            numberTermProperty: 0,
          }),
        );

        for (const [id, [filter, expected]] of Object.entries({
          in: [{ stringTermProperty: { in: ["x"] } }, [identifiers[0]]],
          maxLength: [
            { stringTermProperty: { maxLength: 1 } },
            [identifiers[0]],
          ],
          minLength: [
            { stringTermProperty: { maxLength: 1 } },
            [identifiers[1]],
          ],
        } satisfies Record<
          string,
          [kitchenSink.TermPropertiesClass.$Filter, readonly NamedNode[]]
        >)) {
          it(id, async ({ expect }) => {
            const actual = (
              await objectSet.termPropertiesClassIdentifiers({
                filter,
              })
            ).unsafeCoerce();
            expect(actual).toHaveLength(expected.length);
            for (let i = 0; i < expected.length; i++) {
              expect(expected[i].equals(actual[i]));
            }
          });
        }
      });

      describe("term", () => {
        const objectSet = createObjectSet(
          new kitchenSink.TermPropertiesClass({
            $identifier: identifiers[0],
            termProperty: DataFactory.literal("test"),
          }),
          new kitchenSink.TermPropertiesClass({
            $identifier: identifiers[1],
            termProperty: DataFactory.literal("test", "en"),
          }),
          new kitchenSink.TermPropertiesClass({
            $identifier: identifiers[2],
            termProperty: DataFactory.literal(1, xsd.integer),
          }),
          new kitchenSink.TermPropertiesClass({
            $identifier: identifiers[3],
            termProperty: DataFactory.namedNode("http://example.com"),
          }),
          new kitchenSink.TermPropertiesClass({
            $identifier: identifiers[4],
            stringTermProperty: "test",
          }),
        );

        for (const [id, [filter, expected]] of Object.entries({
          datatypeIn: [
            { termProperty: { datatypeIn: [xsd.integer] } },
            [identifiers[2]],
          ],
          in: [
            { termProperty: { in: [DataFactory.literal("test")] } },
            [identifiers[0]],
          ],
          languageIn: [
            { termProperty: { languageIn: ["en"] } },
            [identifiers[1]],
          ],
          typeIn: [
            { termProperty: { typeIn: ["NamedNode"] } },
            [identifiers[3]],
          ],
        } satisfies Record<
          string,
          [kitchenSink.TermPropertiesClass.$Filter, readonly NamedNode[]]
        >)) {
          it(id, async ({ expect }) => {
            const actual = (
              await objectSet.termPropertiesClassIdentifiers({
                filter,
              })
            ).unsafeCoerce();
            expect(actual).toHaveLength(expected.length);
            for (let i = 0; i < expected.length; i++) {
              expect(expected[i].equals(actual[i]));
            }
          });
        }
      });

      describe("union", () => {
        const objectSet = createObjectSet(
          new kitchenSink.UnionDiscriminantsClass({
            $identifier: identifiers[0],
            requiredClassOrClassOrStringProperty: {
              type: "0-ClassUnionMember1",
              value: new kitchenSink.ClassUnionMember1({
                $identifier: DataFactory.namedNode(
                  "http://example.com/classUnionMember1",
                ),
                classUnionMember1Property: "http://example.com/test0",
                classUnionMemberCommonParentProperty:
                  "http://example.com/test0",
              }),
            },
            requiredIriOrLiteralProperty: DataFactory.namedNode(
              "http://example.com/test0",
            ),
            requiredIriOrStringProperty: DataFactory.namedNode(
              "http://example.com/test0",
            ),
          }),
          new kitchenSink.UnionDiscriminantsClass({
            $identifier: identifiers[1],
            requiredClassOrClassOrStringProperty: {
              type: "2-string",
              value: "http://example.com/test1",
            },
            requiredIriOrLiteralProperty: DataFactory.literal(
              "http://example.com/test1",
            ),
            requiredIriOrStringProperty: "http://example.com/test1",
          }),
        );

        for (const [id, [filter, expected]] of Object.entries({
          envelopePositive: [
            {
              requiredClassOrClassOrStringProperty: {
                on: {
                  "0-ClassUnionMember1": {
                    classUnionMember1Property: {
                      in: ["http://example.com/test0"],
                    },
                  },
                  "1-ClassUnionMember2": {
                    classUnionMember2Property: {
                      in: ["http://example.com/test0"],
                    },
                  },
                  "2-string": { in: ["http://example.com/test0"] },
                },
              },
            },
            [identifiers[0]],
          ],
          envelopeNegative: [
            {
              requiredClassOrClassOrStringProperty: {
                on: {
                  "0-ClassUnionMember1": {
                    classUnionMember1Property: {
                      in: ["http://example.com/testx"],
                    },
                  },
                  "1-ClassUnionMember2": {
                    classUnionMember2Property: {
                      in: ["http://example.com/testx"],
                    },
                  },
                  "2-string": { in: ["http://example.com/testx"] },
                },
              },
            },
            [],
          ],
          inlinePositive: [
            {
              requiredIriOrLiteralProperty: {
                on: {
                  Literal: {
                    in: [DataFactory.literal("http://example.com/test0")],
                  },
                  NamedNode: {
                    in: [DataFactory.namedNode("http://example.com/test0")],
                  },
                },
              },
            },
            [identifiers[0]],
          ],
          inlineNegative: [
            {
              requiredIriOrLiteralProperty: {
                on: {
                  Literal: {
                    in: [DataFactory.literal("http://example.com/testXXX")],
                  },
                  NamedNode: {
                    in: [DataFactory.namedNode("http://example.com/testXXX")],
                  },
                },
              },
            },
            [],
          ],
          typeofPositive: [
            {
              requiredIriOrStringProperty: {
                on: {
                  object: {
                    in: [DataFactory.namedNode("http://example.com/test0")],
                  },
                  string: { in: ["http://example.com/test0"] },
                },
              },
            },
            [identifiers[0]],
          ],
          typeofNegative: [
            {
              requiredIriOrStringProperty: {
                on: {
                  object: {
                    in: [DataFactory.namedNode("http://example.com/testx")],
                  },
                  string: { in: ["http://example.com/testx"] },
                },
              },
            },
            [],
          ],
        } satisfies Record<
          string,
          [kitchenSink.UnionDiscriminantsClass.$Filter, readonly NamedNode[]]
        >)) {
          it(id, async ({ expect }) => {
            const actual = (
              await objectSet.unionDiscriminantsClassIdentifiers({
                filter,
              })
            ).unsafeCoerce();
            expect(actual).toHaveLength(expected.length);
            for (let i = 0; i < expected.length; i++) {
              expect(expected[i].equals(actual[i]));
            }
          });
        }
      });
    });

    describe("union", () => {
      it("class with fromRdfType", async ({ expect }) => {
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

      it("class limit 1", async ({ expect }) => {
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
      it("class with fromRdfTypes", async ({ expect }) => {
        const objectSet = createObjectSet(...testData.classUnions);
        expect(
          (await objectSet.classUnionsCount()).unsafeCoerce(),
        ).toStrictEqual(testData.classUnions.length);
      });

      it("class without fromRdfTypes", async ({ expect }) => {
        const objectSet = createObjectSet(...testData.noRdfTypeClassUnions);
        expect(
          (await objectSet.noRdfTypeClassUnionsCount()).unsafeCoerce(),
        ).toStrictEqual(testData.noRdfTypeClassUnions.length);
      });

      it("interface", async ({ expect }) => {
        const objectSet = createObjectSet(...testData.interfaceUnions);
        expect(
          (await objectSet.interfaceUnionsCount()).unsafeCoerce(),
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
