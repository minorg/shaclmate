import datasetFactory from "@rdfjs/dataset";
import type { BlankNode, NamedNode } from "@rdfjs/types";
import dataFactory from "@rdfx/data-factory";
import { ResourceSet } from "@rdfx/resource";
import { beforeAll, describe, expect, it } from "vitest";
import * as kitchenSink from "../src/index.js";

async function expectEmptyOptional<
  ObjectIdentifierT extends BlankNode | NamedNode,
  PartialT extends { $identifier: () => ObjectIdentifierT },
  ResolvedT extends { $identifier: () => ObjectIdentifierT },
>(actual: kitchenSink.$LazyOption<PartialT, ResolvedT>): Promise<void> {
  expect(actual.partial.isNothing()).toStrictEqual(true);
  const resolvedObject = (await actual.resolve()).unsafeCoerce();
  expect(resolvedObject.isNothing()).toStrictEqual(true);
}

async function expectEmptySet<
  ObjectIdentifierT extends BlankNode | NamedNode,
  PartialT extends { $identifier: () => ObjectIdentifierT },
  ResolvedT extends { $identifier: () => ObjectIdentifierT },
>(actual: kitchenSink.$LazySet<ResolvedT, PartialT>): Promise<void> {
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
  actual: kitchenSink.$Lazy<PartialT, ResolvedT>;
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
  actual: kitchenSink.$LazySet<PartialT, ResolvedT>;
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
  actual: kitchenSink.$LazyOption<PartialT, ResolvedT>;
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
      lazilyResolved: "test",
    });
  const expectedLazilyResolvedIriIdentifierInstance =
    kitchenSink.LazilyResolvedIriIdentifierStruct.createUnsafe({
      $identifier: dataFactory.namedNode(
        "http://example.com/lazilyResolvedIriIdentifierInstance",
      ),
      lazilyResolved: "test",
    });
  const expectedLazilyResolvedDiscriminatedUnionInstance =
    kitchenSink.LazilyResolvedDiscriminatedUnionMember1.createUnsafe({
      $identifier: dataFactory.namedNode(
        "http://example.com/lazilyResolvedDiscriminatedUnionInstance",
      ),
      lazilyResolved: "test",
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
    kitchenSink.LazilyResolvedDiscriminatedUnion.toRdfResource(
      expectedLazilyResolvedDiscriminatedUnionInstance,
      { resourceSet },
    );

    emptyLazyPropertiesInstance =
      kitchenSink.LazyPropertiesStruct.fromRdfResource(
        kitchenSink.LazyPropertiesStruct.toRdfResource(
          kitchenSink.LazyPropertiesStruct.createUnsafe({
            requiredLazyToResolvedBlankNodeOrIriIdentifier:
              expectedLazilyResolvedBlankNodeOrIriIdentifierInstance,
            requiredPartialToResolvedBlankNodeOrIriIdentifier:
              expectedLazilyResolvedBlankNodeOrIriIdentifierInstance,
          }),
          { resourceSet },
        ),
      ).unsafeCoerce();

    nonEmptyLazyPropertiesInstance =
      kitchenSink.LazyPropertiesStruct.fromRdfResource(
        kitchenSink.LazyPropertiesStruct.toRdfResource(
          kitchenSink.LazyPropertiesStruct.createUnsafe({
            optionalLazyToResolvedBlankNodeOrIriIdentifier:
              expectedLazilyResolvedBlankNodeOrIriIdentifierInstance,
            optionalLazyToResolvedDiscriminatedUnion:
              expectedLazilyResolvedDiscriminatedUnionInstance,
            optionalLazyToResolvedIriIdentifier:
              expectedLazilyResolvedIriIdentifierInstance,
            optionalPartialToResolvedBlankNodeOrIriIdentifier:
              expectedLazilyResolvedBlankNodeOrIriIdentifierInstance,
            optionalPartialToResolvedDiscriminatedUnion:
              expectedLazilyResolvedDiscriminatedUnionInstance,
            optionalPartialDiscriminatedUnionToResolvedDiscriminatedUnion:
              expectedLazilyResolvedDiscriminatedUnionInstance,
            requiredLazyToResolvedBlankNodeOrIriIdentifier:
              expectedLazilyResolvedBlankNodeOrIriIdentifierInstance,
            requiredPartialToResolvedBlankNodeOrIriIdentifier:
              expectedLazilyResolvedBlankNodeOrIriIdentifierInstance,
            setLazyToResolvedBlankNodeOrIriIdentifier: [
              expectedLazilyResolvedBlankNodeOrIriIdentifierInstance,
            ],
            setPartialToResolvedBlankNodeOrIriIdentifier: [
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
          case "optionalLazyToResolvedBlankNodeOrIriIdentifier": {
            if (empty) {
              await expectEmptyOptional(
                emptyLazyPropertiesInstance.optionalLazyToResolvedBlankNodeOrIriIdentifier,
              );
            } else {
              await expectedNonEmptyOptional({
                actual:
                  nonEmptyLazyPropertiesInstance.optionalLazyToResolvedBlankNodeOrIriIdentifier,
                equals:
                  kitchenSink.LazilyResolvedBlankNodeOrIriIdentifierStruct
                    .equals,
                expected:
                  expectedLazilyResolvedBlankNodeOrIriIdentifierInstance,
              });
            }
            break;
          }
          case "optionalLazyToResolvedDiscriminatedUnion": {
            if (empty) {
              await expectEmptyOptional(
                emptyLazyPropertiesInstance.optionalLazyToResolvedDiscriminatedUnion,
              );
            } else {
              await expectedNonEmptyOptional({
                actual:
                  nonEmptyLazyPropertiesInstance.optionalLazyToResolvedDiscriminatedUnion,
                equals: kitchenSink.LazilyResolvedDiscriminatedUnion.equals,
                expected: expectedLazilyResolvedDiscriminatedUnionInstance,
              });
            }
            break;
          }
          case "optionalLazyToResolvedIriIdentifier": {
            if (empty) {
              await expectEmptyOptional(
                emptyLazyPropertiesInstance.optionalLazyToResolvedIriIdentifier,
              );
            } else {
              await expectedNonEmptyOptional({
                actual:
                  nonEmptyLazyPropertiesInstance.optionalLazyToResolvedIriIdentifier,
                equals: kitchenSink.LazilyResolvedIriIdentifierStruct.equals,
                expected: expectedLazilyResolvedIriIdentifierInstance,
              });
            }
            break;
          }
          case "optionalPartialToResolvedBlankNodeOrIriIdentifier": {
            if (empty) {
              await expectEmptyOptional(
                emptyLazyPropertiesInstance.optionalPartialToResolvedBlankNodeOrIriIdentifier,
              );
            } else {
              await expectedNonEmptyOptional({
                actual:
                  nonEmptyLazyPropertiesInstance.optionalPartialToResolvedBlankNodeOrIriIdentifier,
                equals:
                  kitchenSink.LazilyResolvedBlankNodeOrIriIdentifierStruct
                    .equals,
                expected:
                  expectedLazilyResolvedBlankNodeOrIriIdentifierInstance,
              });
            }
            break;
          }
          case "optionalPartialToResolvedDiscriminatedUnion": {
            if (empty) {
              await expectEmptyOptional(
                emptyLazyPropertiesInstance.optionalPartialToResolvedDiscriminatedUnion,
              );
            } else {
              await expectedNonEmptyOptional({
                actual:
                  nonEmptyLazyPropertiesInstance.optionalPartialToResolvedDiscriminatedUnion,
                equals: kitchenSink.LazilyResolvedDiscriminatedUnion.equals,
                expected: expectedLazilyResolvedDiscriminatedUnionInstance,
              });
            }
            break;
          }
          case "optionalPartialDiscriminatedUnionToResolvedDiscriminatedUnion": {
            if (empty) {
              await expectEmptyOptional(
                emptyLazyPropertiesInstance.optionalPartialDiscriminatedUnionToResolvedDiscriminatedUnion,
              );
            } else {
              await expectedNonEmptyOptional({
                actual:
                  nonEmptyLazyPropertiesInstance.optionalPartialDiscriminatedUnionToResolvedDiscriminatedUnion,
                equals: kitchenSink.LazilyResolvedDiscriminatedUnion.equals,
                expected: expectedLazilyResolvedDiscriminatedUnionInstance,
              });
            }
            break;
          }
          case "requiredLazyToResolvedBlankNodeOrIriIdentifier": {
            if (empty) {
            } else {
              await expectRequired({
                actual:
                  nonEmptyLazyPropertiesInstance.requiredLazyToResolvedBlankNodeOrIriIdentifier,
                equals:
                  kitchenSink.LazilyResolvedBlankNodeOrIriIdentifierStruct
                    .equals,
                expected:
                  expectedLazilyResolvedBlankNodeOrIriIdentifierInstance,
              });
            }
            break;
          }
          case "requiredPartialToResolvedBlankNodeOrIriIdentifier": {
            if (empty) {
            } else {
              await expectRequired({
                actual:
                  nonEmptyLazyPropertiesInstance.requiredPartialToResolvedBlankNodeOrIriIdentifier,
                equals:
                  kitchenSink.LazilyResolvedBlankNodeOrIriIdentifierStruct
                    .equals,
                expected:
                  expectedLazilyResolvedBlankNodeOrIriIdentifierInstance,
              });
            }
            break;
          }
          case "setLazyToResolvedBlankNodeOrIriIdentifier": {
            if (empty) {
              await expectEmptySet(
                emptyLazyPropertiesInstance.setLazyToResolvedBlankNodeOrIriIdentifier,
              );
            } else {
              await expectSet({
                actual:
                  nonEmptyLazyPropertiesInstance.setLazyToResolvedBlankNodeOrIriIdentifier,
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
          case "setPartialToResolvedBlankNodeOrIriIdentifier":
            {
              if (empty) {
                await expectEmptySet(
                  emptyLazyPropertiesInstance.setPartialToResolvedBlankNodeOrIriIdentifier,
                );
              } else {
                await expectSet({
                  actual:
                    nonEmptyLazyPropertiesInstance.setPartialToResolvedBlankNodeOrIriIdentifier,
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
