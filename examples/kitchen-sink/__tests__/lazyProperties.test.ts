import type { BlankNode, NamedNode } from "@rdfjs/types";
import N3 from "n3";
import { MutableResourceSet } from "rdfjs-resource";
import { beforeAll, describe, expect, it } from "vitest";
import * as kitchenSink from "../src/index.js";

async function expectEmptyOptional<
  ObjectIdentifierT extends BlankNode | NamedNode,
  ResolvedObjectT extends { $identifier: ObjectIdentifierT },
  PartialObjectT extends { $identifier: ObjectIdentifierT },
>(
  actual: kitchenSink.$LazyOptionalObject<
    ObjectIdentifierT,
    ResolvedObjectT,
    PartialObjectT
  >,
): Promise<void> {
  expect(actual.partial.isNothing()).toStrictEqual(true);
  const resolvedObject = (await actual.resolve()).unsafeCoerce();
  expect(resolvedObject.isNothing()).toStrictEqual(true);
}

async function expectEmptySet<
  ObjectIdentifierT extends BlankNode | NamedNode,
  ResolvedObjectT extends { $identifier: ObjectIdentifierT },
  PartialObjectT extends { $identifier: ObjectIdentifierT },
>(
  actual: kitchenSink.$LazyObjectSet<
    ObjectIdentifierT,
    ResolvedObjectT,
    PartialObjectT
  >,
): Promise<void> {
  expect(actual.partials).toHaveLength(0);
  const resolvedObjects = (await actual.resolve()).unsafeCoerce();
  expect(resolvedObjects).toHaveLength(0);
}

async function expectedNonEmptyOptional<
  ObjectIdentifierT extends BlankNode | NamedNode,
  ResolvedObjectT extends { $identifier: ObjectIdentifierT },
  PartialObjectT extends { $identifier: ObjectIdentifierT },
>({
  actual,
  equals,
  expected,
}: {
  actual: kitchenSink.$LazyOptionalObject<
    ObjectIdentifierT,
    ResolvedObjectT,
    PartialObjectT
  >;
  equals: (
    left: ResolvedObjectT,
    right: ResolvedObjectT,
  ) => kitchenSink.$EqualsResult;
  expected: ResolvedObjectT;
}): Promise<void> {
  expect(
    actual.partial.unsafeCoerce().$identifier.equals(expected.$identifier),
  ).toStrictEqual(true);

  const resolvedObject = (await actual.resolve()).unsafeCoerce().unsafeCoerce();
  expect(equals(resolvedObject, expected).extract()).toStrictEqual(true);
}

async function expectRequired<
  ObjectIdentifierT extends BlankNode | NamedNode,
  ResolvedObjectT extends { $identifier: ObjectIdentifierT },
  PartialObjectT extends { $identifier: ObjectIdentifierT },
>({
  actual,
  equals,
  expected,
}: {
  actual: kitchenSink.$LazyRequiredObject<
    ObjectIdentifierT,
    ResolvedObjectT,
    PartialObjectT
  >;
  equals: (
    left: ResolvedObjectT,
    right: ResolvedObjectT,
  ) => kitchenSink.$EqualsResult;
  expected: ResolvedObjectT;
}): Promise<void> {
  expect(actual.partial.$identifier.equals(expected.$identifier)).toStrictEqual(
    true,
  );

  const resolvedObject = (await actual.resolve()).unsafeCoerce();
  expect(equals(resolvedObject, expected).extract()).toStrictEqual(true);
}

async function expectSet<
  ObjectIdentifierT extends BlankNode | NamedNode,
  ResolvedObjectT extends { $identifier: ObjectIdentifierT },
  PartialObjectT extends { $identifier: ObjectIdentifierT },
>({
  actual,
  equals,
  expected,
}: {
  actual: kitchenSink.$LazyObjectSet<
    ObjectIdentifierT,
    ResolvedObjectT,
    PartialObjectT
  >;
  equals: (
    left: ResolvedObjectT,
    right: ResolvedObjectT,
  ) => kitchenSink.$EqualsResult;
  expected: readonly ResolvedObjectT[];
}): Promise<void> {
  expect(actual.partials).toHaveLength(expected.length);
  actual.partials.forEach((actualPartial, partialI) => {
    expect(
      actualPartial.$identifier.equals(expected[partialI].$identifier),
    ).toStrictEqual(true);
  });

  {
    const resolvedObjects = (await actual.resolve()).unsafeCoerce();
    expect(resolvedObjects).toHaveLength(expected.length);
    resolvedObjects.forEach((actualResolvedObject, i) => {
      expect(
        equals(actualResolvedObject, expected[i]).unsafeCoerce(),
      ).toStrictEqual(true);
    });
  }

  {
    const resolvedObjects = (
      await actual.resolve({ offset: expected.length })
    ).unsafeCoerce();
    expect(resolvedObjects).toHaveLength(0);
  }
}

describe("lazyProperties", () => {
  let emptyLazyPropertiesClassInstance: kitchenSink.LazyPropertiesClass;
  let emptyLazyPropertiesInterfaceInstance: kitchenSink.LazyPropertiesInterface;
  let nonEmptyLazyPropertiesClassInstance: kitchenSink.LazyPropertiesClass;
  let nonEmptyLazyPropertiesInterfaceInstance: kitchenSink.LazyPropertiesInterface;

  const expectedLazilyResolvedBlankNodeOrIriClassInstance =
    new kitchenSink.LazilyResolvedBlankNodeOrIriClass({
      $identifier: N3.DataFactory.namedNode(
        "http://example.com/lazilyResolvedBlankNodeOrIriClassInstance",
      ),
      lazilyResolvedStringProperty: "test",
    });
  const expectedLazilyResolvedBlankNodeOrIriInterfaceInstance =
    kitchenSink.LazilyResolvedBlankNodeOrIriInterface.$create({
      $identifier: N3.DataFactory.namedNode(
        "http://example.com/lazilyResolvedBlankNodeOrIriInterfaceInstance",
      ),
      lazilyResolvedStringProperty: "test",
    });
  const expectedLazilyResolvedIriClassInstance =
    new kitchenSink.LazilyResolvedIriClass({
      $identifier: N3.DataFactory.namedNode(
        "http://example.com/lazilyResolvedIriClassInstance",
      ),
      lazilyResolvedStringProperty: "test",
    });
  const expectedLazilyResolvedIriInterfaceInstance =
    kitchenSink.LazilyResolvedIriInterface.$create({
      $identifier: N3.DataFactory.namedNode(
        "http://example.com/lazilyResolvedIriClassInstance",
      ),
      lazilyResolvedStringProperty: "test",
    });
  const expectedLazilyResolvedClassUnionInstance =
    new kitchenSink.LazilyResolvedClassUnionMember1({
      $identifier: N3.DataFactory.namedNode(
        "http://example.com/lazilyResolvedClassUnionInstance",
      ),
      lazilyResolvedStringProperty: "test",
    });
  const expectedLazilyResolvedInterfaceUnionInstance =
    kitchenSink.LazilyResolvedInterfaceUnionMember1.$create({
      $identifier: N3.DataFactory.namedNode(
        "http://example.com/lazilyResolvedInterfaceUnionInstance",
      ),
      lazilyResolvedStringProperty: "test",
    });

  beforeAll(() => {
    const resourceSet = new MutableResourceSet({
      dataFactory: N3.DataFactory,
      dataset: new N3.Store(),
    });
    expectedLazilyResolvedBlankNodeOrIriClassInstance.$toRdf({ resourceSet });
    kitchenSink.LazilyResolvedBlankNodeOrIriInterface.$toRdf(
      expectedLazilyResolvedBlankNodeOrIriInterfaceInstance,
      { resourceSet },
    );
    expectedLazilyResolvedIriClassInstance.$toRdf({ resourceSet });
    kitchenSink.LazilyResolvedIriInterface.$toRdf(
      expectedLazilyResolvedIriInterfaceInstance,
      { resourceSet },
    );
    expectedLazilyResolvedClassUnionInstance.$toRdf({ resourceSet });
    kitchenSink.LazilyResolvedInterfaceUnion.$toRdf(
      expectedLazilyResolvedInterfaceUnionInstance,
      { resourceSet },
    );

    emptyLazyPropertiesClassInstance = kitchenSink.LazyPropertiesClass.$fromRdf(
      new kitchenSink.LazyPropertiesClass({
        requiredLazyToResolvedClassProperty:
          expectedLazilyResolvedBlankNodeOrIriClassInstance,
        requiredPartialClassToResolvedClassProperty:
          expectedLazilyResolvedBlankNodeOrIriClassInstance,
      }).$toRdf({ resourceSet }),
    ).unsafeCoerce();

    emptyLazyPropertiesInterfaceInstance =
      kitchenSink.LazyPropertiesInterface.$fromRdf(
        kitchenSink.LazyPropertiesInterface.$toRdf(
          kitchenSink.LazyPropertiesInterface.$create({
            requiredLazyToResolvedInterfaceProperty:
              expectedLazilyResolvedBlankNodeOrIriInterfaceInstance,
            requiredPartialInterfaceToResolvedInterfaceProperty:
              expectedLazilyResolvedBlankNodeOrIriInterfaceInstance,
          }),
          { resourceSet },
        ),
      ).unsafeCoerce();

    nonEmptyLazyPropertiesClassInstance =
      kitchenSink.LazyPropertiesClass.$fromRdf(
        new kitchenSink.LazyPropertiesClass({
          optionalLazyToResolvedClassProperty:
            expectedLazilyResolvedBlankNodeOrIriClassInstance,
          optionalLazyToResolvedClassUnionProperty:
            expectedLazilyResolvedClassUnionInstance,
          optionalLazyToResolvedIriClassProperty:
            expectedLazilyResolvedIriClassInstance,
          optionalPartialClassToResolvedClassProperty:
            expectedLazilyResolvedBlankNodeOrIriClassInstance,
          optionalPartialClassToResolvedClassUnionProperty:
            expectedLazilyResolvedClassUnionInstance,
          optionalPartialClassUnionToResolvedClassUnionProperty:
            expectedLazilyResolvedClassUnionInstance,
          requiredLazyToResolvedClassProperty:
            expectedLazilyResolvedBlankNodeOrIriClassInstance,
          requiredPartialClassToResolvedClassProperty:
            expectedLazilyResolvedBlankNodeOrIriClassInstance,
          setLazyToResolvedClassProperty: [
            expectedLazilyResolvedBlankNodeOrIriClassInstance,
          ],
          setPartialClassToResolvedClassProperty: [
            expectedLazilyResolvedBlankNodeOrIriClassInstance,
          ],
        }).$toRdf({ resourceSet }),
      ).unsafeCoerce();

    nonEmptyLazyPropertiesInterfaceInstance =
      kitchenSink.LazyPropertiesInterface.$fromRdf(
        kitchenSink.LazyPropertiesInterface.$toRdf(
          kitchenSink.LazyPropertiesInterface.$create({
            optionalLazyToResolvedInterfaceProperty:
              expectedLazilyResolvedBlankNodeOrIriInterfaceInstance,
            optionalLazyToResolvedInterfaceUnionProperty:
              expectedLazilyResolvedInterfaceUnionInstance,
            optionalLazyToResolvedIriInterfaceProperty:
              expectedLazilyResolvedIriInterfaceInstance,
            optionalPartialInterfaceToResolvedInterfaceProperty:
              expectedLazilyResolvedBlankNodeOrIriInterfaceInstance,
            optionalPartialInterfaceToResolvedInterfaceUnionProperty:
              expectedLazilyResolvedInterfaceUnionInstance,
            optionalPartialInterfaceUnionToResolvedInterfaceUnionProperty:
              expectedLazilyResolvedInterfaceUnionInstance,
            requiredLazyToResolvedInterfaceProperty:
              expectedLazilyResolvedBlankNodeOrIriInterfaceInstance,
            requiredPartialInterfaceToResolvedInterfaceProperty:
              expectedLazilyResolvedBlankNodeOrIriInterfaceInstance,
            setLazyToResolvedInterfaceProperty: [
              expectedLazilyResolvedBlankNodeOrIriInterfaceInstance,
            ],
            setPartialInterfaceToResolvedInterfaceProperty: [
              expectedLazilyResolvedBlankNodeOrIriInterfaceInstance,
            ],
          }),
          { resourceSet },
        ),
      ).unsafeCoerce();
  });

  for (const propertyNameString of Object.keys(
    kitchenSink.LazyPropertiesClass.$properties,
  ).concat(Object.keys(kitchenSink.LazyPropertiesInterface.$properties))) {
    const propertyName = propertyNameString as
      | keyof typeof kitchenSink.LazyPropertiesClass.$properties
      | keyof typeof kitchenSink.LazyPropertiesInterface.$properties;

    for (const empty of [false, true]) {
      it(`${propertyName} ${empty ? "empty" : "non-empty"}`, async ({
        expect,
      }) => {
        switch (propertyName) {
          case "optionalLazyToResolvedClassProperty": {
            if (empty) {
              await expectEmptyOptional(
                emptyLazyPropertiesClassInstance.optionalLazyToResolvedClassProperty,
              );
            } else {
              await expectedNonEmptyOptional({
                actual:
                  nonEmptyLazyPropertiesClassInstance.optionalLazyToResolvedClassProperty,
                equals: (left, right) => left.$equals(right),
                expected: expectedLazilyResolvedBlankNodeOrIriClassInstance,
              });
            }
            break;
          }
          case "optionalLazyToResolvedClassUnionProperty": {
            if (empty) {
              await expectEmptyOptional(
                emptyLazyPropertiesClassInstance.optionalLazyToResolvedClassUnionProperty,
              );
            } else {
              await expectedNonEmptyOptional({
                actual:
                  nonEmptyLazyPropertiesClassInstance.optionalLazyToResolvedClassProperty,
                equals: (left, right) => left.$equals(right),
                expected: expectedLazilyResolvedBlankNodeOrIriClassInstance,
              });
            }
            break;
          }
          case "optionalLazyToResolvedInterfaceProperty": {
            if (empty) {
              await expectEmptyOptional(
                emptyLazyPropertiesInterfaceInstance.optionalLazyToResolvedInterfaceProperty,
              );
            } else {
              await expectedNonEmptyOptional({
                actual:
                  nonEmptyLazyPropertiesInterfaceInstance.optionalLazyToResolvedInterfaceProperty,
                equals:
                  kitchenSink.LazilyResolvedBlankNodeOrIriInterface.$equals,
                expected: expectedLazilyResolvedBlankNodeOrIriInterfaceInstance,
              });
            }
            break;
          }
          case "optionalLazyToResolvedInterfaceUnionProperty": {
            if (empty) {
              await expectEmptyOptional(
                emptyLazyPropertiesInterfaceInstance.optionalLazyToResolvedInterfaceUnionProperty,
              );
            } else {
              await expectedNonEmptyOptional({
                actual:
                  nonEmptyLazyPropertiesInterfaceInstance.optionalLazyToResolvedInterfaceUnionProperty,
                equals: kitchenSink.LazilyResolvedInterfaceUnion.$equals,
                expected: expectedLazilyResolvedInterfaceUnionInstance,
              });
            }
            break;
          }
          case "optionalLazyToResolvedIriClassProperty": {
            if (empty) {
              await expectEmptyOptional(
                emptyLazyPropertiesClassInstance.optionalLazyToResolvedIriClassProperty,
              );
            } else {
              await expectedNonEmptyOptional({
                actual:
                  nonEmptyLazyPropertiesClassInstance.optionalLazyToResolvedIriClassProperty,
                equals: (left, right) => left.$equals(right),
                expected: expectedLazilyResolvedIriClassInstance,
              });
            }
            break;
          }
          case "optionalLazyToResolvedIriInterfaceProperty": {
            if (empty) {
              await expectEmptyOptional(
                emptyLazyPropertiesInterfaceInstance.optionalLazyToResolvedIriInterfaceProperty,
              );
            } else {
              await expectedNonEmptyOptional({
                actual:
                  nonEmptyLazyPropertiesInterfaceInstance.optionalLazyToResolvedIriInterfaceProperty,
                equals: kitchenSink.LazilyResolvedIriInterface.$equals,
                expected: expectedLazilyResolvedIriInterfaceInstance,
              });
            }
            break;
          }
          case "optionalPartialClassToResolvedClassProperty": {
            if (empty) {
              await expectEmptyOptional(
                emptyLazyPropertiesClassInstance.optionalPartialClassToResolvedClassProperty,
              );
            } else {
              await expectedNonEmptyOptional({
                actual:
                  nonEmptyLazyPropertiesClassInstance.optionalPartialClassToResolvedClassProperty,
                equals: (left, right) => left.$equals(right),
                expected: expectedLazilyResolvedBlankNodeOrIriClassInstance,
              });
            }
            break;
          }
          case "optionalPartialClassToResolvedClassUnionProperty": {
            if (empty) {
              await expectEmptyOptional(
                emptyLazyPropertiesClassInstance.optionalPartialClassToResolvedClassUnionProperty,
              );
            } else {
              await expectedNonEmptyOptional({
                actual:
                  nonEmptyLazyPropertiesClassInstance.optionalPartialClassToResolvedClassUnionProperty,
                equals: kitchenSink.LazilyResolvedClassUnion.$equals,
                expected: expectedLazilyResolvedClassUnionInstance,
              });
            }
            break;
          }
          case "optionalPartialClassUnionToResolvedClassUnionProperty": {
            if (empty) {
              await expectEmptyOptional(
                emptyLazyPropertiesClassInstance.optionalPartialClassUnionToResolvedClassUnionProperty,
              );
            } else {
              await expectedNonEmptyOptional({
                actual:
                  nonEmptyLazyPropertiesClassInstance.optionalPartialClassUnionToResolvedClassUnionProperty,
                equals: kitchenSink.LazilyResolvedClassUnion.$equals,
                expected: expectedLazilyResolvedClassUnionInstance,
              });
            }
            break;
          }
          case "optionalPartialInterfaceToResolvedInterfaceProperty": {
            if (empty) {
              await expectEmptyOptional(
                emptyLazyPropertiesInterfaceInstance.optionalPartialInterfaceToResolvedInterfaceProperty,
              );
            } else {
              await expectedNonEmptyOptional({
                actual:
                  nonEmptyLazyPropertiesInterfaceInstance.optionalPartialInterfaceToResolvedInterfaceProperty,
                equals:
                  kitchenSink.LazilyResolvedBlankNodeOrIriInterface.$equals,
                expected: expectedLazilyResolvedBlankNodeOrIriInterfaceInstance,
              });
            }
            break;
          }
          case "optionalPartialInterfaceToResolvedInterfaceUnionProperty": {
            if (empty) {
              await expectEmptyOptional(
                emptyLazyPropertiesInterfaceInstance.optionalPartialInterfaceToResolvedInterfaceUnionProperty,
              );
            } else {
              await expectedNonEmptyOptional({
                actual:
                  nonEmptyLazyPropertiesInterfaceInstance.optionalPartialInterfaceToResolvedInterfaceUnionProperty,
                equals: kitchenSink.LazilyResolvedInterfaceUnion.$equals,
                expected: expectedLazilyResolvedInterfaceUnionInstance,
              });
            }
            break;
          }
          case "optionalPartialInterfaceUnionToResolvedInterfaceUnionProperty": {
            if (empty) {
              await expectEmptyOptional(
                emptyLazyPropertiesInterfaceInstance.optionalPartialInterfaceUnionToResolvedInterfaceUnionProperty,
              );
            } else {
              await expectedNonEmptyOptional({
                actual:
                  nonEmptyLazyPropertiesInterfaceInstance.optionalPartialInterfaceUnionToResolvedInterfaceUnionProperty,
                equals: kitchenSink.LazilyResolvedInterfaceUnion.$equals,
                expected: expectedLazilyResolvedInterfaceUnionInstance,
              });
            }
            break;
          }
          case "requiredLazyToResolvedClassProperty": {
            if (empty) {
            } else {
              await expectRequired({
                actual:
                  nonEmptyLazyPropertiesClassInstance.requiredLazyToResolvedClassProperty,
                equals: (left, right) => left.$equals(right),
                expected: expectedLazilyResolvedBlankNodeOrIriClassInstance,
              });
            }
            break;
          }
          case "requiredLazyToResolvedInterfaceProperty": {
            if (empty) {
            } else {
              await expectRequired({
                actual:
                  nonEmptyLazyPropertiesInterfaceInstance.requiredLazyToResolvedInterfaceProperty,
                equals:
                  kitchenSink.LazilyResolvedBlankNodeOrIriInterface.$equals,
                expected: expectedLazilyResolvedBlankNodeOrIriInterfaceInstance,
              });
            }
            break;
          }
          case "requiredPartialClassToResolvedClassProperty": {
            if (empty) {
            } else {
              await expectRequired({
                actual:
                  nonEmptyLazyPropertiesClassInstance.requiredPartialClassToResolvedClassProperty,
                equals: (left, right) => left.$equals(right),
                expected: expectedLazilyResolvedBlankNodeOrIriClassInstance,
              });
            }
            break;
          }
          case "requiredPartialInterfaceToResolvedInterfaceProperty": {
            if (empty) {
            } else {
              await expectRequired({
                actual:
                  nonEmptyLazyPropertiesInterfaceInstance.requiredPartialInterfaceToResolvedInterfaceProperty,
                equals:
                  kitchenSink.LazilyResolvedBlankNodeOrIriInterface.$equals,
                expected: expectedLazilyResolvedBlankNodeOrIriInterfaceInstance,
              });
            }
            break;
          }
          case "setLazyToResolvedClassProperty": {
            if (empty) {
              await expectEmptySet(
                emptyLazyPropertiesClassInstance.setLazyToResolvedClassProperty,
              );
            } else {
              await expectSet({
                actual:
                  nonEmptyLazyPropertiesClassInstance.setLazyToResolvedClassProperty,
                equals: (left, right) => left.$equals(right),
                expected: [expectedLazilyResolvedBlankNodeOrIriClassInstance],
              });
            }
            break;
          }
          case "setPartialClassToResolvedClassProperty":
            {
              if (empty) {
                await expectEmptySet(
                  emptyLazyPropertiesClassInstance.setPartialClassToResolvedClassProperty,
                );
              } else {
                await expectSet({
                  actual:
                    nonEmptyLazyPropertiesClassInstance.setPartialClassToResolvedClassProperty,
                  equals: (left, right) => left.$equals(right),
                  expected: [expectedLazilyResolvedBlankNodeOrIriClassInstance],
                });
              }
            }
            break;
          case "setLazyToResolvedInterfaceProperty": {
            if (empty) {
              await expectEmptySet(
                emptyLazyPropertiesInterfaceInstance.setLazyToResolvedInterfaceProperty,
              );
            } else {
              await expectSet({
                actual:
                  nonEmptyLazyPropertiesInterfaceInstance.setLazyToResolvedInterfaceProperty,
                equals:
                  kitchenSink.LazilyResolvedBlankNodeOrIriInterface.$equals,
                expected: [
                  expectedLazilyResolvedBlankNodeOrIriInterfaceInstance,
                ],
              });
            }
            break;
          }
          case "setPartialInterfaceToResolvedInterfaceProperty":
            {
              if (empty) {
                await expectEmptySet(
                  emptyLazyPropertiesInterfaceInstance.setPartialInterfaceToResolvedInterfaceProperty,
                );
              } else {
                await expectSet({
                  actual:
                    nonEmptyLazyPropertiesInterfaceInstance.setPartialInterfaceToResolvedInterfaceProperty,
                  equals:
                    kitchenSink.LazilyResolvedBlankNodeOrIriInterface.$equals,
                  expected: [
                    expectedLazilyResolvedBlankNodeOrIriInterfaceInstance,
                  ],
                });
              }
            }
            break;
          default:
            throw new Error(`not implemented: ${propertyName}`);
        }
      });
    }
  }
});
