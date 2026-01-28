import type { BlankNode, NamedNode } from "@rdfjs/types";
import * as kitchenSink from "@shaclmate/kitchen-sink-example";

import N3 from "n3";
import { MutableResourceSet } from "rdfjs-resource";
import { beforeAll, describe, expect, it } from "vitest";

async function expectEmptyOptional<
  ObjectIdentifierT extends BlankNode | NamedNode,
  PartialObjectT extends { $identifier: ObjectIdentifierT },
  ResolvedObjectT extends { $identifier: ObjectIdentifierT },
>(
  actual: kitchenSink.$LazyObjectOption<
    ObjectIdentifierT,
    PartialObjectT,
    ResolvedObjectT
  >,
): Promise<void> {
  expect(actual.partial.isNothing()).toStrictEqual(true);
  const resolvedObject = (await actual.resolve()).unsafeCoerce();
  expect(resolvedObject.isNothing()).toStrictEqual(true);
}

async function expectEmptySet<
  ObjectIdentifierT extends BlankNode | NamedNode,
  PartialObjectT extends { $identifier: ObjectIdentifierT },
  ResolvedObjectT extends { $identifier: ObjectIdentifierT },
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

async function expectRequired<
  ObjectIdentifierT extends BlankNode | NamedNode,
  PartialObjectT extends { $identifier: ObjectIdentifierT },
  ResolvedObjectT extends { $identifier: ObjectIdentifierT },
>({
  actual,
  equals,
  expected,
}: {
  actual: kitchenSink.$LazyObject<
    ObjectIdentifierT,
    PartialObjectT,
    ResolvedObjectT
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
  PartialObjectT extends { $identifier: ObjectIdentifierT },
  ResolvedObjectT extends { $identifier: ObjectIdentifierT },
>({
  actual,
  equals,
  expected,
}: {
  actual: kitchenSink.$LazyObjectSet<
    ObjectIdentifierT,
    PartialObjectT,
    ResolvedObjectT
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

async function expectedNonEmptyOptional<
  ObjectIdentifierT extends BlankNode | NamedNode,
  PartialObjectT extends { $identifier: ObjectIdentifierT },
  ResolvedObjectT extends { $identifier: ObjectIdentifierT },
>({
  actual,
  equals,
  expected,
}: {
  actual: kitchenSink.$LazyObjectOption<
    ObjectIdentifierT,
    PartialObjectT,
    ResolvedObjectT
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

describe("lazyProperties", () => {
  let emptyLazyPropertiesClassInstance: kitchenSink.LazyPropertiesClass;
  let emptyLazyPropertiesInterfaceInstance: kitchenSink.LazyPropertiesInterface;
  let nonEmptyLazyPropertiesClassInstance: kitchenSink.LazyPropertiesClass;
  let nonEmptyLazyPropertiesInterfaceInstance: kitchenSink.LazyPropertiesInterface;

  const expectedLazilyResolvedBlankNodeOrIriIdentifierClassInstance =
    new kitchenSink.LazilyResolvedBlankNodeOrIriIdentifierClass({
      $identifier: N3.DataFactory.namedNode(
        "http://example.com/lazilyResolvedBlankNodeOrIriIdentifierClassInstance",
      ),
      lazilyResolvedStringProperty: "test",
    });
  const expectedLazilyResolvedBlankNodeOrIriIdentifierInterfaceInstance =
    kitchenSink.LazilyResolvedBlankNodeOrIriIdentifierInterface.$create({
      $identifier: N3.DataFactory.namedNode(
        "http://example.com/lazilyResolvedBlankNodeOrIriIdentifierInterfaceInstance",
      ),
      lazilyResolvedStringProperty: "test",
    });
  const expectedLazilyResolvedIriIdentifierClassInstance =
    new kitchenSink.LazilyResolvedIriIdentifierClass({
      $identifier: N3.DataFactory.namedNode(
        "http://example.com/lazilyResolvedIriIdentifierClassInstance",
      ),
      lazilyResolvedStringProperty: "test",
    });
  const expectedLazilyResolvedIriIdentifierInterfaceInstance =
    kitchenSink.LazilyResolvedIriIdentifierInterface.$create({
      $identifier: N3.DataFactory.namedNode(
        "http://example.com/lazilyResolvedIriIdentifierClassInstance",
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
    expectedLazilyResolvedBlankNodeOrIriIdentifierClassInstance.$toRdf({
      resourceSet,
    });
    kitchenSink.LazilyResolvedBlankNodeOrIriIdentifierInterface.$toRdf(
      expectedLazilyResolvedBlankNodeOrIriIdentifierInterfaceInstance,
      { resourceSet },
    );
    expectedLazilyResolvedIriIdentifierClassInstance.$toRdf({ resourceSet });
    kitchenSink.LazilyResolvedIriIdentifierInterface.$toRdf(
      expectedLazilyResolvedIriIdentifierInterfaceInstance,
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
          expectedLazilyResolvedBlankNodeOrIriIdentifierClassInstance,
        requiredPartialClassToResolvedClassProperty:
          expectedLazilyResolvedBlankNodeOrIriIdentifierClassInstance,
      }).$toRdf({ resourceSet }),
    ).unsafeCoerce();

    emptyLazyPropertiesInterfaceInstance =
      kitchenSink.LazyPropertiesInterface.$fromRdf(
        kitchenSink.LazyPropertiesInterface.$toRdf(
          kitchenSink.LazyPropertiesInterface.$create({
            requiredLazyToResolvedInterfaceProperty:
              expectedLazilyResolvedBlankNodeOrIriIdentifierInterfaceInstance,
            requiredPartialInterfaceToResolvedInterfaceProperty:
              expectedLazilyResolvedBlankNodeOrIriIdentifierInterfaceInstance,
          }),
          { resourceSet },
        ),
      ).unsafeCoerce();

    nonEmptyLazyPropertiesClassInstance =
      kitchenSink.LazyPropertiesClass.$fromRdf(
        new kitchenSink.LazyPropertiesClass({
          optionalLazyToResolvedClassProperty:
            expectedLazilyResolvedBlankNodeOrIriIdentifierClassInstance,
          optionalLazyToResolvedClassUnionProperty:
            expectedLazilyResolvedClassUnionInstance,
          optionalLazyToResolvedIriIdentifierClassProperty:
            expectedLazilyResolvedIriIdentifierClassInstance,
          optionalPartialClassToResolvedClassProperty:
            expectedLazilyResolvedBlankNodeOrIriIdentifierClassInstance,
          optionalPartialClassToResolvedClassUnionProperty:
            expectedLazilyResolvedClassUnionInstance,
          optionalPartialClassUnionToResolvedClassUnionProperty:
            expectedLazilyResolvedClassUnionInstance,
          requiredLazyToResolvedClassProperty:
            expectedLazilyResolvedBlankNodeOrIriIdentifierClassInstance,
          requiredPartialClassToResolvedClassProperty:
            expectedLazilyResolvedBlankNodeOrIriIdentifierClassInstance,
          setLazyToResolvedClassProperty: [
            expectedLazilyResolvedBlankNodeOrIriIdentifierClassInstance,
          ],
          setPartialClassToResolvedClassProperty: [
            expectedLazilyResolvedBlankNodeOrIriIdentifierClassInstance,
          ],
        }).$toRdf({ resourceSet }),
      ).unsafeCoerce();

    nonEmptyLazyPropertiesInterfaceInstance =
      kitchenSink.LazyPropertiesInterface.$fromRdf(
        kitchenSink.LazyPropertiesInterface.$toRdf(
          kitchenSink.LazyPropertiesInterface.$create({
            optionalLazyToResolvedInterfaceProperty:
              expectedLazilyResolvedBlankNodeOrIriIdentifierInterfaceInstance,
            optionalLazyToResolvedInterfaceUnionProperty:
              expectedLazilyResolvedInterfaceUnionInstance,
            optionalLazyToResolvedIriIdentifierInterfaceProperty:
              expectedLazilyResolvedIriIdentifierInterfaceInstance,
            optionalPartialInterfaceToResolvedInterfaceProperty:
              expectedLazilyResolvedBlankNodeOrIriIdentifierInterfaceInstance,
            optionalPartialInterfaceToResolvedInterfaceUnionProperty:
              expectedLazilyResolvedInterfaceUnionInstance,
            optionalPartialInterfaceUnionToResolvedInterfaceUnionProperty:
              expectedLazilyResolvedInterfaceUnionInstance,
            requiredLazyToResolvedInterfaceProperty:
              expectedLazilyResolvedBlankNodeOrIriIdentifierInterfaceInstance,
            requiredPartialInterfaceToResolvedInterfaceProperty:
              expectedLazilyResolvedBlankNodeOrIriIdentifierInterfaceInstance,
            setLazyToResolvedInterfaceProperty: [
              expectedLazilyResolvedBlankNodeOrIriIdentifierInterfaceInstance,
            ],
            setPartialInterfaceToResolvedInterfaceProperty: [
              expectedLazilyResolvedBlankNodeOrIriIdentifierInterfaceInstance,
            ],
          }),
          { resourceSet },
        ),
      ).unsafeCoerce();
  });

  for (const propertyNameString of Object.keys(
    kitchenSink.LazyPropertiesClass.$schema.properties,
  ).concat(
    Object.keys(kitchenSink.LazyPropertiesInterface.$schema.properties),
  )) {
    const propertyName = propertyNameString as
      | keyof typeof kitchenSink.LazyPropertiesClass.$schema.properties
      | keyof typeof kitchenSink.LazyPropertiesInterface.$schema.properties;

    for (const empty of [false, true]) {
      it(`${propertyName} ${empty ? "empty" : "non-empty"}`, async () => {
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
                expected:
                  expectedLazilyResolvedBlankNodeOrIriIdentifierClassInstance,
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
                expected:
                  expectedLazilyResolvedBlankNodeOrIriIdentifierClassInstance,
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
                  kitchenSink.LazilyResolvedBlankNodeOrIriIdentifierInterface
                    .$equals,
                expected:
                  expectedLazilyResolvedBlankNodeOrIriIdentifierInterfaceInstance,
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
          case "optionalLazyToResolvedIriIdentifierClassProperty": {
            if (empty) {
              await expectEmptyOptional(
                emptyLazyPropertiesClassInstance.optionalLazyToResolvedIriIdentifierClassProperty,
              );
            } else {
              await expectedNonEmptyOptional({
                actual:
                  nonEmptyLazyPropertiesClassInstance.optionalLazyToResolvedIriIdentifierClassProperty,
                equals: (left, right) => left.$equals(right),
                expected: expectedLazilyResolvedIriIdentifierClassInstance,
              });
            }
            break;
          }
          case "optionalLazyToResolvedIriIdentifierInterfaceProperty": {
            if (empty) {
              await expectEmptyOptional(
                emptyLazyPropertiesInterfaceInstance.optionalLazyToResolvedIriIdentifierInterfaceProperty,
              );
            } else {
              await expectedNonEmptyOptional({
                actual:
                  nonEmptyLazyPropertiesInterfaceInstance.optionalLazyToResolvedIriIdentifierInterfaceProperty,
                equals:
                  kitchenSink.LazilyResolvedIriIdentifierInterface.$equals,
                expected: expectedLazilyResolvedIriIdentifierInterfaceInstance,
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
                expected:
                  expectedLazilyResolvedBlankNodeOrIriIdentifierClassInstance,
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
                  kitchenSink.LazilyResolvedBlankNodeOrIriIdentifierInterface
                    .$equals,
                expected:
                  expectedLazilyResolvedBlankNodeOrIriIdentifierInterfaceInstance,
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
                expected:
                  expectedLazilyResolvedBlankNodeOrIriIdentifierClassInstance,
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
                  kitchenSink.LazilyResolvedBlankNodeOrIriIdentifierInterface
                    .$equals,
                expected:
                  expectedLazilyResolvedBlankNodeOrIriIdentifierInterfaceInstance,
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
                expected:
                  expectedLazilyResolvedBlankNodeOrIriIdentifierClassInstance,
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
                  kitchenSink.LazilyResolvedBlankNodeOrIriIdentifierInterface
                    .$equals,
                expected:
                  expectedLazilyResolvedBlankNodeOrIriIdentifierInterfaceInstance,
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
                expected: [
                  expectedLazilyResolvedBlankNodeOrIriIdentifierClassInstance,
                ],
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
                  expected: [
                    expectedLazilyResolvedBlankNodeOrIriIdentifierClassInstance,
                  ],
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
                  kitchenSink.LazilyResolvedBlankNodeOrIriIdentifierInterface
                    .$equals,
                expected: [
                  expectedLazilyResolvedBlankNodeOrIriIdentifierInterfaceInstance,
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
                    kitchenSink.LazilyResolvedBlankNodeOrIriIdentifierInterface
                      .$equals,
                  expected: [
                    expectedLazilyResolvedBlankNodeOrIriIdentifierInterfaceInstance,
                  ],
                });
              }
            }
            break;
          case "$identifier":
          case "$type":
            break;
          default:
            throw new Error(`not implemented: ${propertyName}`);
        }
      });
    }
  }
});
