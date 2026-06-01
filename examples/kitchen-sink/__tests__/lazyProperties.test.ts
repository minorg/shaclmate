import datasetFactory from "@rdfjs/dataset";
import type { BlankNode, NamedNode } from "@rdfjs/types";
import dataFactory from "@rdfx/data-factory";
import { ResourceSet } from "@rdfx/resource";
import * as kitchenSink from "@shaclmate/kitchen-sink-example";
import { beforeAll, describe, expect, it } from "vitest";

async function expectEmptyOptional<
  ObjectIdentifierT extends BlankNode | NamedNode,
  PartialT extends { $identifier: () => ObjectIdentifierT },
  ResolvedT extends { $identifier: () => ObjectIdentifierT },
>(
  actual: kitchenSink.$LazyOption<ObjectIdentifierT, PartialT, ResolvedT>,
): Promise<void> {
  expect(actual.partial.isNothing()).toStrictEqual(true);
  const resolvedObject = (await actual.resolve()).unsafeCoerce();
  expect(resolvedObject.isNothing()).toStrictEqual(true);
}

async function expectEmptySet<
  ObjectIdentifierT extends BlankNode | NamedNode,
  PartialT extends { $identifier: () => ObjectIdentifierT },
  ResolvedT extends { $identifier: () => ObjectIdentifierT },
>(
  actual: kitchenSink.$LazySet<ObjectIdentifierT, ResolvedT, PartialT>,
): Promise<void> {
  expect(actual.partials).toHaveLength(0);
  const resolvedObjects = (await actual.resolve()).unsafeCoerce();
  expect(resolvedObjects).toHaveLength(0);
}

async function expectRequired<
  ObjectIdentifierT extends BlankNode | NamedNode,
  PartialT extends { $identifier: () => ObjectIdentifierT },
  ResolvedT extends { $identifier: () => ObjectIdentifierT },
>({
  actual,
  equals,
  expected,
}: {
  actual: kitchenSink.$Lazy<ObjectIdentifierT, PartialT, ResolvedT>;
  equals: (left: ResolvedT, right: ResolvedT) => kitchenSink.$EqualsResult;
  expected: ResolvedT;
}): Promise<void> {
  expect(
    actual.partial.$identifier().equals(expected.$identifier()),
  ).toStrictEqual(true);

  const resolvedObject = (await actual.resolve()).unsafeCoerce();
  expect(equals(resolvedObject, expected).extract()).toStrictEqual(true);
}

async function expectSet<
  ObjectIdentifierT extends BlankNode | NamedNode,
  PartialT extends { $identifier: () => ObjectIdentifierT },
  ResolvedT extends { $identifier: () => ObjectIdentifierT },
>({
  actual,
  equals,
  expected,
}: {
  actual: kitchenSink.$LazySet<ObjectIdentifierT, PartialT, ResolvedT>;
  equals: (left: ResolvedT, right: ResolvedT) => kitchenSink.$EqualsResult;
  expected: readonly ResolvedT[];
}): Promise<void> {
  expect(actual.partials).toHaveLength(expected.length);
  actual.partials.forEach((actualPartial, partialI) => {
    expect(
      actualPartial.$identifier().equals(expected[partialI].$identifier()),
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
  PartialT extends { $identifier: () => ObjectIdentifierT },
  ResolvedT extends { $identifier: () => ObjectIdentifierT },
>({
  actual,
  equals,
  expected,
}: {
  actual: kitchenSink.$LazyOption<ObjectIdentifierT, PartialT, ResolvedT>;
  equals: (left: ResolvedT, right: ResolvedT) => kitchenSink.$EqualsResult;
  expected: ResolvedT;
}): Promise<void> {
  expect(
    actual.partial.unsafeCoerce().$identifier().equals(expected.$identifier()),
  ).toStrictEqual(true);

  const resolvedObject = (await actual.resolve()).unsafeCoerce().unsafeCoerce();
  expect(equals(resolvedObject, expected).extract()).toStrictEqual(true);
}

describe("lazyProperties", () => {
  let emptyLazyPropertiesInstance: kitchenSink.LazyPropertiesStruct;
  let nonEmptyLazyPropertiesInstance: kitchenSink.LazyPropertiesStruct;

  const expectedLazilyResolvedBlankNodeOrIriIdentifierInstance =
    kitchenSink.LazilyResolvedBlankNodeOrIriIdentifierStruct.createUnsafe({
      $identifier: dataFactory.namedNode(
        "http://example.com/lazilyResolvedBlankNodeOrIriIdentifierInstance",
      ),
      lazilyResolvedProperty: "test",
    });
  const expectedLazilyResolvedIriIdentifierInstance =
    kitchenSink.LazilyResolvedIriIdentifierStruct.createUnsafe({
      $identifier: dataFactory.namedNode(
        "http://example.com/lazilyResolvedIriIdentifierInstance",
      ),
      lazilyResolvedProperty: "test",
    });
  const expectedLazilyResolvedUnionInstance =
    kitchenSink.LazilyResolvedUnionMember1.createUnsafe({
      $identifier: dataFactory.namedNode(
        "http://example.com/lazilyResolvedUnionInstance",
      ),
      lazilyResolvedProperty: "test",
    });

  beforeAll(() => {
    const resourceSet = new ResourceSet({
      dataFactory,
      dataset: datasetFactory.dataset(),
    });
    kitchenSink.LazilyResolvedBlankNodeOrIriIdentifierStruct.toRdfResource(
      expectedLazilyResolvedBlankNodeOrIriIdentifierInstance,
      {
        resourceSet,
      },
    );
    kitchenSink.LazilyResolvedIriIdentifierStruct.toRdfResource(
      expectedLazilyResolvedIriIdentifierInstance,
      {
        resourceSet,
      },
    );
    kitchenSink.LazilyResolvedUnion.toRdfResource(
      expectedLazilyResolvedUnionInstance,
      { resourceSet },
    );

    emptyLazyPropertiesInstance =
      kitchenSink.LazyPropertiesStruct.fromRdfResource(
        kitchenSink.LazyPropertiesStruct.toRdfResource(
          kitchenSink.LazyPropertiesStruct.createUnsafe({
            requiredLazyToResolvedBlankNodeOrIriIdentifierProperty:
              expectedLazilyResolvedBlankNodeOrIriIdentifierInstance,
            requiredPartialToResolvedBlankNodeOrIriIdentifierProperty:
              expectedLazilyResolvedBlankNodeOrIriIdentifierInstance,
          }),
          { resourceSet },
        ),
      ).unsafeCoerce();

    nonEmptyLazyPropertiesInstance =
      kitchenSink.LazyPropertiesStruct.fromRdfResource(
        kitchenSink.LazyPropertiesStruct.toRdfResource(
          kitchenSink.LazyPropertiesStruct.createUnsafe({
            optionalLazyToResolvedBlankNodeOrIriIdentifierProperty:
              expectedLazilyResolvedBlankNodeOrIriIdentifierInstance,
            optionalLazyToResolvedUnionProperty:
              expectedLazilyResolvedUnionInstance,
            optionalLazyToResolvedIriIdentifierProperty:
              expectedLazilyResolvedIriIdentifierInstance,
            optionalPartialToResolvedBlankNodeOrIriIdentifierProperty:
              expectedLazilyResolvedBlankNodeOrIriIdentifierInstance,
            optionalPartialToResolvedUnionProperty:
              expectedLazilyResolvedUnionInstance,
            optionalPartialUnionToResolvedUnionProperty:
              expectedLazilyResolvedUnionInstance,
            requiredLazyToResolvedBlankNodeOrIriIdentifierProperty:
              expectedLazilyResolvedBlankNodeOrIriIdentifierInstance,
            requiredPartialToResolvedBlankNodeOrIriIdentifierProperty:
              expectedLazilyResolvedBlankNodeOrIriIdentifierInstance,
            setLazyToResolvedBlankNodeOrIriIdentifierProperty: [
              expectedLazilyResolvedBlankNodeOrIriIdentifierInstance,
            ],
            setPartialToResolvedBlankNodeOrIriIdentifierProperty: [
              expectedLazilyResolvedBlankNodeOrIriIdentifierInstance,
            ],
          }),
          { resourceSet },
        ),
      ).unsafeCoerce();
  });

  for (const propertyNameString of Object.keys(
    kitchenSink.LazyPropertiesStruct.schema.properties,
  )) {
    const propertyName =
      propertyNameString as keyof typeof kitchenSink.LazyPropertiesStruct.schema.properties;

    for (const empty of [false, true]) {
      it(`${propertyName} ${empty ? "empty" : "non-empty"}`, async () => {
        switch (propertyName) {
          case "optionalLazyToResolvedBlankNodeOrIriIdentifierProperty": {
            if (empty) {
              await expectEmptyOptional(
                emptyLazyPropertiesInstance.optionalLazyToResolvedBlankNodeOrIriIdentifierProperty,
              );
            } else {
              await expectedNonEmptyOptional({
                actual:
                  nonEmptyLazyPropertiesInstance.optionalLazyToResolvedBlankNodeOrIriIdentifierProperty,
                equals:
                  kitchenSink.LazilyResolvedBlankNodeOrIriIdentifierStruct
                    .equals,
                expected:
                  expectedLazilyResolvedBlankNodeOrIriIdentifierInstance,
              });
            }
            break;
          }
          case "optionalLazyToResolvedUnionProperty": {
            if (empty) {
              await expectEmptyOptional(
                emptyLazyPropertiesInstance.optionalLazyToResolvedUnionProperty,
              );
            } else {
              await expectedNonEmptyOptional({
                actual:
                  nonEmptyLazyPropertiesInstance.optionalLazyToResolvedUnionProperty,
                equals: kitchenSink.LazilyResolvedUnion.equals,
                expected: expectedLazilyResolvedUnionInstance,
              });
            }
            break;
          }
          case "optionalLazyToResolvedIriIdentifierProperty": {
            if (empty) {
              await expectEmptyOptional(
                emptyLazyPropertiesInstance.optionalLazyToResolvedIriIdentifierProperty,
              );
            } else {
              await expectedNonEmptyOptional({
                actual:
                  nonEmptyLazyPropertiesInstance.optionalLazyToResolvedIriIdentifierProperty,
                equals: kitchenSink.LazilyResolvedIriIdentifierStruct.equals,
                expected: expectedLazilyResolvedIriIdentifierInstance,
              });
            }
            break;
          }
          case "optionalPartialToResolvedBlankNodeOrIriIdentifierProperty": {
            if (empty) {
              await expectEmptyOptional(
                emptyLazyPropertiesInstance.optionalPartialToResolvedBlankNodeOrIriIdentifierProperty,
              );
            } else {
              await expectedNonEmptyOptional({
                actual:
                  nonEmptyLazyPropertiesInstance.optionalPartialToResolvedBlankNodeOrIriIdentifierProperty,
                equals:
                  kitchenSink.LazilyResolvedBlankNodeOrIriIdentifierStruct
                    .equals,
                expected:
                  expectedLazilyResolvedBlankNodeOrIriIdentifierInstance,
              });
            }
            break;
          }
          case "optionalPartialToResolvedUnionProperty": {
            if (empty) {
              await expectEmptyOptional(
                emptyLazyPropertiesInstance.optionalPartialToResolvedUnionProperty,
              );
            } else {
              await expectedNonEmptyOptional({
                actual:
                  nonEmptyLazyPropertiesInstance.optionalPartialToResolvedUnionProperty,
                equals: kitchenSink.LazilyResolvedUnion.equals,
                expected: expectedLazilyResolvedUnionInstance,
              });
            }
            break;
          }
          case "optionalPartialUnionToResolvedUnionProperty": {
            if (empty) {
              await expectEmptyOptional(
                emptyLazyPropertiesInstance.optionalPartialUnionToResolvedUnionProperty,
              );
            } else {
              await expectedNonEmptyOptional({
                actual:
                  nonEmptyLazyPropertiesInstance.optionalPartialUnionToResolvedUnionProperty,
                equals: kitchenSink.LazilyResolvedUnion.equals,
                expected: expectedLazilyResolvedUnionInstance,
              });
            }
            break;
          }
          case "requiredLazyToResolvedBlankNodeOrIriIdentifierProperty": {
            if (empty) {
            } else {
              await expectRequired({
                actual:
                  nonEmptyLazyPropertiesInstance.requiredLazyToResolvedBlankNodeOrIriIdentifierProperty,
                equals:
                  kitchenSink.LazilyResolvedBlankNodeOrIriIdentifierStruct
                    .equals,
                expected:
                  expectedLazilyResolvedBlankNodeOrIriIdentifierInstance,
              });
            }
            break;
          }
          case "requiredPartialToResolvedBlankNodeOrIriIdentifierProperty": {
            if (empty) {
            } else {
              await expectRequired({
                actual:
                  nonEmptyLazyPropertiesInstance.requiredPartialToResolvedBlankNodeOrIriIdentifierProperty,
                equals:
                  kitchenSink.LazilyResolvedBlankNodeOrIriIdentifierStruct
                    .equals,
                expected:
                  expectedLazilyResolvedBlankNodeOrIriIdentifierInstance,
              });
            }
            break;
          }
          case "setLazyToResolvedBlankNodeOrIriIdentifierProperty": {
            if (empty) {
              await expectEmptySet(
                emptyLazyPropertiesInstance.setLazyToResolvedBlankNodeOrIriIdentifierProperty,
              );
            } else {
              await expectSet({
                actual:
                  nonEmptyLazyPropertiesInstance.setLazyToResolvedBlankNodeOrIriIdentifierProperty,
                equals:
                  kitchenSink.LazilyResolvedBlankNodeOrIriIdentifierStruct
                    .equals,
                expected: [
                  expectedLazilyResolvedBlankNodeOrIriIdentifierInstance,
                ],
              });
            }
            break;
          }
          case "setPartialToResolvedBlankNodeOrIriIdentifierProperty":
            {
              if (empty) {
                await expectEmptySet(
                  emptyLazyPropertiesInstance.setPartialToResolvedBlankNodeOrIriIdentifierProperty,
                );
              } else {
                await expectSet({
                  actual:
                    nonEmptyLazyPropertiesInstance.setPartialToResolvedBlankNodeOrIriIdentifierProperty,
                  equals:
                    kitchenSink.LazilyResolvedBlankNodeOrIriIdentifierStruct
                      .equals,
                  expected: [
                    expectedLazilyResolvedBlankNodeOrIriIdentifierInstance,
                  ],
                });
              }
            }
            break;
          case "$identifier":
            break;
          default:
            throw new Error(`not implemented: ${propertyName}`);
        }
      });
    }
  }
});
