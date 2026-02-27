import dataFactory from "@rdfjs/data-model";
import type { BlankNode, NamedNode } from "@rdfjs/types";
import * as kitchenSink from "@shaclmate/kitchen-sink-example";
import { xsd } from "@tpluscode/rdf-ns-builders";
import { NonEmptyList } from "purify-ts";
import { describe, it } from "vitest";

export function testObjectFilters(
  createObjectSet: (
    ...instances: kitchenSink.$Object[]
  ) => kitchenSink.$ObjectSet,
) {
  describe("object filters", () => {
    const identifiers = [...new Array(10)].map((_, i) =>
      dataFactory.namedNode(`http://example.com/${i}`),
    );

    describe("blank node", () => {
      const objectSet = createObjectSet(
        new kitchenSink.TermPropertiesClass({
          blankNodeTermProperty: dataFactory.blankNode(),
        }),
        new kitchenSink.TermPropertiesClass({
          $identifier: identifiers[1],
          stringTermProperty: "test",
        }),
      );

      if (objectSet instanceof kitchenSink.$SparqlObjectSet) {
        return;
      }

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
        valueTrue: [{ booleanTermProperty: { value: true } }, [identifiers[0]]],
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
      const blankNodeIdentifier = dataFactory.blankNode();
      const namedNodeIdentifier = dataFactory.namedNode("http://example.com");

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
          if (
            id === "typeBlankNode" &&
            objectSet instanceof kitchenSink.$SparqlObjectSet
          ) {
            return;
          }
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
          literalTermProperty: dataFactory.literal("test"),
        }),
        new kitchenSink.TermPropertiesClass({
          $identifier: identifiers[1],
          literalTermProperty: dataFactory.literal("test", "en"),
        }),
        new kitchenSink.TermPropertiesClass({
          $identifier: identifiers[2],
          literalTermProperty: dataFactory.literal("1", xsd.integer),
        }),
      );

      for (const [id, [filter, expected]] of Object.entries({
        datatypeIn: [
          { literalTermProperty: { datatypeIn: [xsd.integer] } },
          [identifiers[2]],
        ],
        in: [
          { literalTermProperty: { in: [dataFactory.literal("test")] } },
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
              iriTermProperty: dataFactory.namedNode(
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
              in: [dataFactory.namedNode("http://example.com/prop0")],
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
        items: [{ emptyStringSetProperty: { in: [value] } }, [identifiers[0]]],
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
        maxLength: [{ stringTermProperty: { maxLength: 1 } }, [identifiers[0]]],
        minLength: [{ stringTermProperty: { maxLength: 1 } }, [identifiers[1]]],
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
          termProperty: dataFactory.literal("test"),
        }),
        new kitchenSink.TermPropertiesClass({
          $identifier: identifiers[1],
          termProperty: dataFactory.literal("test", "en"),
        }),
        new kitchenSink.TermPropertiesClass({
          $identifier: identifiers[2],
          termProperty: dataFactory.literal("1", xsd.integer),
        }),
        new kitchenSink.TermPropertiesClass({
          $identifier: identifiers[3],
          termProperty: dataFactory.namedNode("http://example.com"),
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
          { termProperty: { in: [dataFactory.literal("test")] } },
          [identifiers[0]],
        ],
        languageIn: [
          { termProperty: { languageIn: ["en"] } },
          [identifiers[1]],
        ],
        typeIn: [{ termProperty: { typeIn: ["NamedNode"] } }, [identifiers[3]]],
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
              $identifier: dataFactory.namedNode(
                "http://example.com/classUnionMember1",
              ),
              classUnionMember1Property: "http://example.com/test0",
              classUnionMemberCommonParentProperty: "http://example.com/test0",
            }),
          },
          requiredIriOrLiteralProperty: dataFactory.namedNode(
            "http://example.com/test0",
          ),
          requiredIriOrStringProperty: dataFactory.namedNode(
            "http://example.com/test0",
          ),
        }),
        new kitchenSink.UnionDiscriminantsClass({
          $identifier: identifiers[1],
          requiredClassOrClassOrStringProperty: {
            type: "2-string",
            value: "http://example.com/test1",
          },
          requiredIriOrLiteralProperty: dataFactory.literal(
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
                  in: [dataFactory.literal("http://example.com/test0")],
                },
                NamedNode: {
                  in: [dataFactory.namedNode("http://example.com/test0")],
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
                  in: [dataFactory.literal("http://example.com/testXXX")],
                },
                NamedNode: {
                  in: [dataFactory.namedNode("http://example.com/testXXX")],
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
                  in: [dataFactory.namedNode("http://example.com/test0")],
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
                  in: [dataFactory.namedNode("http://example.com/testx")],
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
          // if (id.endsWith("Negative")) {
          //   return;
          // }

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
}
