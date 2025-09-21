import type { BlankNode, NamedNode } from "@rdfjs/types";
import * as kitchenSink from "@shaclmate/kitchen-sink-example";
import N3 from "n3";
import { MutableResourceSet } from "rdfjs-resource";
import { beforeAll, describe, expect, it } from "vitest";

async function expectEmptyOptional<
  ObjectIdentifierT extends BlankNode | NamedNode,
  ResolvedObjectT extends { $identifier: ObjectIdentifierT },
  StubObjectT extends { $identifier: ObjectIdentifierT },
>(
  actual: kitchenSink.$LazyOptionalObject<
    ObjectIdentifierT,
    ResolvedObjectT,
    StubObjectT
  >,
): Promise<void> {
  expect(actual.stub.isNothing()).toStrictEqual(true);
  const resolvedObject = (await actual.resolve()).unsafeCoerce();
  expect(resolvedObject.isNothing()).toStrictEqual(true);
}

async function expectEmptySet<
  ObjectIdentifierT extends BlankNode | NamedNode,
  ResolvedObjectT extends { $identifier: ObjectIdentifierT },
  StubObjectT extends { $identifier: ObjectIdentifierT },
>(
  actual: kitchenSink.$LazyObjectSet<
    ObjectIdentifierT,
    ResolvedObjectT,
    StubObjectT
  >,
): Promise<void> {
  expect(actual.stubs).toHaveLength(0);
  const resolvedObjects = (await actual.resolve()).unsafeCoerce();
  expect(resolvedObjects).toHaveLength(0);
}

async function expectedNonEmptyOptional<
  ObjectIdentifierT extends BlankNode | NamedNode,
  ResolvedObjectT extends { $identifier: ObjectIdentifierT },
  StubObjectT extends { $identifier: ObjectIdentifierT },
>({
  actual,
  equals,
  expected,
}: {
  actual: kitchenSink.$LazyOptionalObject<
    ObjectIdentifierT,
    ResolvedObjectT,
    StubObjectT
  >;
  equals: (
    left: ResolvedObjectT,
    right: ResolvedObjectT,
  ) => kitchenSink.$EqualsResult;
  expected: ResolvedObjectT;
}): Promise<void> {
  expect(
    actual.stub.unsafeCoerce().$identifier.equals(expected.$identifier),
  ).toStrictEqual(true);

  const resolvedObject = (await actual.resolve()).unsafeCoerce().unsafeCoerce();
  expect(equals(resolvedObject, expected).extract()).toStrictEqual(true);
}

async function expectRequired<
  ObjectIdentifierT extends BlankNode | NamedNode,
  ResolvedObjectT extends { $identifier: ObjectIdentifierT },
  StubObjectT extends { $identifier: ObjectIdentifierT },
>({
  actual,
  equals,
  expected,
}: {
  actual: kitchenSink.$LazyRequiredObject<
    ObjectIdentifierT,
    ResolvedObjectT,
    StubObjectT
  >;
  equals: (
    left: ResolvedObjectT,
    right: ResolvedObjectT,
  ) => kitchenSink.$EqualsResult;
  expected: ResolvedObjectT;
}): Promise<void> {
  expect(actual.stub.$identifier.equals(expected.$identifier)).toStrictEqual(
    true,
  );

  const resolvedObject = (await actual.resolve()).unsafeCoerce();
  expect(equals(resolvedObject, expected).extract()).toStrictEqual(true);
}

async function expectSet<
  ObjectIdentifierT extends BlankNode | NamedNode,
  ResolvedObjectT extends { $identifier: ObjectIdentifierT },
  StubObjectT extends { $identifier: ObjectIdentifierT },
>({
  actual,
  equals,
  expected,
}: {
  actual: kitchenSink.$LazyObjectSet<
    ObjectIdentifierT,
    ResolvedObjectT,
    StubObjectT
  >;
  equals: (
    left: ResolvedObjectT,
    right: ResolvedObjectT,
  ) => kitchenSink.$EqualsResult;
  expected: readonly ResolvedObjectT[];
}): Promise<void> {
  expect(actual.stubs).toHaveLength(expected.length);
  actual.stubs.forEach((actualStub, stubI) => {
    expect(
      actualStub.$identifier.equals(expected[stubI].$identifier),
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
    expectedLazilyResolvedIriClassInstance.$toRdf({ resourceSet });
    expectedLazilyResolvedClassUnionInstance.$toRdf({ resourceSet });

    emptyLazyPropertiesClassInstance = kitchenSink.LazyPropertiesClass.$fromRdf(
      new kitchenSink.LazyPropertiesClass({
        requiredLazyToResolvedClassProperty:
          expectedLazilyResolvedBlankNodeOrIriClassInstance,
        requiredStubClassToResolvedClassProperty:
          expectedLazilyResolvedBlankNodeOrIriClassInstance,
      }).$toRdf({ resourceSet }),
    ).unsafeCoerce();

    emptyLazyPropertiesInterfaceInstance =
      kitchenSink.LazyPropertiesInterface.$fromRdf(
        kitchenSink.LazyPropertiesInterface.$toRdf(
          kitchenSink.LazyPropertiesInterface.$create({
            requiredLazyToResolvedInterfaceProperty:
              expectedLazilyResolvedBlankNodeOrIriInterfaceInstance,
            requiredStubInterfaceToResolvedInterfaceProperty:
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
          optionalStubClassToResolvedClassProperty:
            expectedLazilyResolvedBlankNodeOrIriClassInstance,
          optionalStubClassToResolvedClassUnionProperty:
            expectedLazilyResolvedClassUnionInstance,
          optionalStubClassUnionToResolvedClassUnionProperty:
            expectedLazilyResolvedClassUnionInstance,
          requiredLazyToResolvedClassProperty:
            expectedLazilyResolvedBlankNodeOrIriClassInstance,
          requiredStubClassToResolvedClassProperty:
            expectedLazilyResolvedBlankNodeOrIriClassInstance,
          setLazyToResolvedClassProperty: [
            expectedLazilyResolvedBlankNodeOrIriClassInstance,
          ],
          setStubClassToResolvedClassProperty: [
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
            optionalStubInterfaceToResolvedInterfaceProperty:
              expectedLazilyResolvedBlankNodeOrIriInterfaceInstance,
            optionalStubInterfaceToResolvedInterfaceUnionProperty:
              expectedLazilyResolvedInterfaceUnionInstance,
            optionalStubInterfaceUnionToResolvedInterfaceUnionProperty:
              expectedLazilyResolvedInterfaceUnionInstance,
            requiredLazyToResolvedInterfaceProperty:
              expectedLazilyResolvedBlankNodeOrIriInterfaceInstance,
            requiredStubInterfaceToResolvedInterfaceProperty:
              expectedLazilyResolvedBlankNodeOrIriInterfaceInstance,
            setLazyToResolvedInterfaceProperty: [
              expectedLazilyResolvedBlankNodeOrIriInterfaceInstance,
            ],
            setStubInterfaceToResolvedInterfaceProperty: [
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
                  emptyLazyPropertiesInterfaceInstance.optionalLazyToResolvedIriInterfaceProperty,
                equals: kitchenSink.LazilyResolvedIriInterface.$equals,
                expected: expectedLazilyResolvedIriInterfaceInstance,
              });
            }
            break;
          }
          case "optionalStubClassToResolvedClassProperty": {
            if (empty) {
              await expectEmptyOptional(
                emptyLazyPropertiesClassInstance.optionalStubClassToResolvedClassProperty,
              );
            } else {
              await expectedNonEmptyOptional({
                actual:
                  nonEmptyLazyPropertiesClassInstance.optionalStubClassToResolvedClassProperty,
                equals: (left, right) => left.$equals(right),
                expected: expectedLazilyResolvedBlankNodeOrIriClassInstance,
              });
            }
            break;
          }
          case "optionalStubClassToResolvedClassUnionProperty": {
            if (empty) {
              await expectEmptyOptional(
                emptyLazyPropertiesClassInstance.optionalStubClassToResolvedClassUnionProperty,
              );
            } else {
              await expectedNonEmptyOptional({
                actual:
                  nonEmptyLazyPropertiesClassInstance.optionalStubClassToResolvedClassUnionProperty,
                equals: kitchenSink.LazilyResolvedClassUnion.$equals,
                expected: expectedLazilyResolvedClassUnionInstance,
              });
            }
            break;
          }
          case "optionalStubClassUnionToResolvedClassUnionProperty": {
            if (empty) {
              await expectEmptyOptional(
                emptyLazyPropertiesClassInstance.optionalStubClassUnionToResolvedClassUnionProperty,
              );
            } else {
              await expectedNonEmptyOptional({
                actual:
                  nonEmptyLazyPropertiesClassInstance.optionalStubClassUnionToResolvedClassUnionProperty,
                equals: kitchenSink.LazilyResolvedClassUnion.$equals,
                expected: expectedLazilyResolvedClassUnionInstance,
              });
            }
            break;
          }
          case "optionalStubInterfaceToResolvedInterfaceProperty": {
            if (empty) {
              await expectEmptyOptional(
                emptyLazyPropertiesInterfaceInstance.optionalStubInterfaceToResolvedInterfaceProperty,
              );
            } else {
              await expectedNonEmptyOptional({
                actual:
                  nonEmptyLazyPropertiesInterfaceInstance.optionalStubInterfaceToResolvedInterfaceProperty,
                equals:
                  kitchenSink.LazilyResolvedBlankNodeOrIriInterface.$equals,
                expected: expectedLazilyResolvedBlankNodeOrIriInterfaceInstance,
              });
            }
            break;
          }
          case "optionalStubInterfaceToResolvedInterfaceUnionProperty": {
            if (empty) {
              await expectEmptyOptional(
                emptyLazyPropertiesInterfaceInstance.optionalStubInterfaceToResolvedInterfaceUnionProperty,
              );
            } else {
              await expectedNonEmptyOptional({
                actual:
                  nonEmptyLazyPropertiesInterfaceInstance.optionalStubInterfaceToResolvedInterfaceUnionProperty,
                equals: kitchenSink.LazilyResolvedInterfaceUnion.$equals,
                expected: expectedLazilyResolvedInterfaceUnionInstance,
              });
            }
            break;
          }
          case "optionalStubInterfaceUnionToResolvedInterfaceUnionProperty": {
            if (empty) {
              await expectEmptyOptional(
                emptyLazyPropertiesInterfaceInstance.optionalStubInterfaceUnionToResolvedInterfaceUnionProperty,
              );
            } else {
              await expectedNonEmptyOptional({
                actual:
                  nonEmptyLazyPropertiesInterfaceInstance.optionalStubInterfaceUnionToResolvedInterfaceUnionProperty,
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
          case "requiredStubClassToResolvedClassProperty": {
            if (empty) {
            } else {
              await expectRequired({
                actual:
                  nonEmptyLazyPropertiesClassInstance.requiredStubClassToResolvedClassProperty,
                equals: (left, right) => left.$equals(right),
                expected: expectedLazilyResolvedBlankNodeOrIriClassInstance,
              });
            }
            break;
          }
          case "requiredStubInterfaceToResolvedInterfaceProperty": {
            if (empty) {
            } else {
              await expectRequired({
                actual:
                  nonEmptyLazyPropertiesInterfaceInstance.requiredStubInterfaceToResolvedInterfaceProperty,
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
          case "setStubClassToResolvedClassProperty":
            {
              if (empty) {
                await expectEmptySet(
                  emptyLazyPropertiesClassInstance.setStubClassToResolvedClassProperty,
                );
              } else {
                await expectSet({
                  actual:
                    nonEmptyLazyPropertiesClassInstance.setStubClassToResolvedClassProperty,
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
          case "setStubInterfaceToResolvedInterfaceProperty":
            {
              if (empty) {
                await expectEmptySet(
                  emptyLazyPropertiesInterfaceInstance.setStubInterfaceToResolvedInterfaceProperty,
                );
              } else {
                await expectSet({
                  actual:
                    nonEmptyLazyPropertiesInterfaceInstance.setStubInterfaceToResolvedInterfaceProperty,
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
