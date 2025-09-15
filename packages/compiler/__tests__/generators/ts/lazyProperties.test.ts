import * as kitchenSink from "@shaclmate/kitchen-sink-example";
import N3 from "n3";
import { Either, Maybe } from "purify-ts";
import { MutableResourceSet } from "rdfjs-resource";
import { invariant } from "ts-invariant";
import { beforeAll, describe, it } from "vitest";

describe("lazyProperties", () => {
  let emptyLazyPropertiesObject: kitchenSink.LazyPropertiesClass;
  let nonEmptyLazyPropertiesObject: kitchenSink.LazyPropertiesClass;

  const expectedLazilyResolvedBlankNodeOrIriObject =
    new kitchenSink.LazilyResolvedBlankNodeOrIriClass({
      $identifier: N3.DataFactory.namedNode(
        "http://example.com/lazilyResolvedBlankNodeOrIriObject",
      ),
      lazilyResolvedStringProperty: "test",
    });
  const expectedLazilyResolvedIriObject =
    new kitchenSink.LazilyResolvedIriClass({
      $identifier: N3.DataFactory.namedNode(
        "http://example.com/lazilyResolvedIriObject",
      ),
      lazilyResolvedStringProperty: "test",
    });
  const expectedLazilyResolvedObjectUnion =
    new kitchenSink.LazilyResolvedClassUnionMember1({
      $identifier: N3.DataFactory.namedNode(
        "http://example.com/lazilyResolvedObjectUnion",
      ),
      lazilyResolvedStringProperty: "test",
    });

  beforeAll(() => {
    const resourceSet = new MutableResourceSet({
      dataFactory: N3.DataFactory,
      dataset: new N3.Store(),
    });
    expectedLazilyResolvedBlankNodeOrIriObject.$toRdf({ resourceSet });
    expectedLazilyResolvedIriObject.$toRdf({ resourceSet });
    expectedLazilyResolvedObjectUnion.$toRdf({ resourceSet });

    emptyLazyPropertiesObject = kitchenSink.LazyPropertiesClass.$fromRdf({
      resource: new kitchenSink.LazyPropertiesClass({
        requiredLazyToResolvedClassProperty:
          expectedLazilyResolvedBlankNodeOrIriObject,
        requiredStubClassToResolvedClassProperty:
          expectedLazilyResolvedBlankNodeOrIriObject,
      }).$toRdf({ resourceSet }),
    }).unsafeCoerce();

    nonEmptyLazyPropertiesObject = kitchenSink.LazyPropertiesClass.$fromRdf({
      resource: new kitchenSink.LazyPropertiesClass({
        optionalLazyToResolvedClassProperty:
          expectedLazilyResolvedBlankNodeOrIriObject,
        optionalLazyToResolvedClassUnionProperty:
          expectedLazilyResolvedObjectUnion,
        optionalLazyToResolvedIriClassProperty: expectedLazilyResolvedIriObject,
        optionalStubClassToResolvedClassProperty:
          expectedLazilyResolvedBlankNodeOrIriObject,
        optionalStubClassToResolvedClassUnionProperty:
          expectedLazilyResolvedObjectUnion,
        optionalStubClassUnionToResolvedClassUnionProperty:
          new kitchenSink.$LazyOptionalObject({
            stub: Maybe.of(
              new kitchenSink.StubClassUnionMember1({
                $identifier: expectedLazilyResolvedObjectUnion.$identifier,
                lazilyResolvedStringProperty:
                  expectedLazilyResolvedObjectUnion.lazilyResolvedStringProperty,
              }),
            ),
            resolver: async () => Either.of(expectedLazilyResolvedObjectUnion),
          }),
        requiredLazyToResolvedClassProperty:
          expectedLazilyResolvedBlankNodeOrIriObject,
        requiredStubClassToResolvedClassProperty:
          expectedLazilyResolvedBlankNodeOrIriObject,
        setLazyToResolvedClassProperty: [
          expectedLazilyResolvedBlankNodeOrIriObject,
        ],
        setStubClassToResolvedClassProperty: [
          expectedLazilyResolvedBlankNodeOrIriObject,
        ],
      }).$toRdf({ resourceSet }),
    }).unsafeCoerce();
  });

  for (const propertyNameString of Object.keys(
    kitchenSink.LazyPropertiesClass.$properties,
  )) {
    const propertyName =
      propertyNameString as keyof typeof kitchenSink.LazyPropertiesClass.$properties;

    for (const empty of [false, true]) {
      it(`${propertyName} ${empty ? "empty" : "non-empty"}`, async ({
        expect,
      }) => {
        switch (propertyName) {
          case "optionalLazyToResolvedClassProperty": {
            if (empty) {
              expect(
                emptyLazyPropertiesObject.optionalLazyToResolvedClassProperty.stub.isNothing(),
              ).toStrictEqual(true);

              const resolvedObject = (
                await emptyLazyPropertiesObject.optionalLazyToResolvedClassProperty.resolve()
              ).unsafeCoerce();
              expect(resolvedObject.isNothing()).toStrictEqual(true);
            } else {
              expect(
                nonEmptyLazyPropertiesObject.optionalLazyToResolvedClassProperty.stub
                  .unsafeCoerce()
                  .$identifier.equals(
                    expectedLazilyResolvedBlankNodeOrIriObject.$identifier,
                  ),
              ).toStrictEqual(true);

              const resolvedObject = (
                await nonEmptyLazyPropertiesObject.optionalLazyToResolvedClassProperty.resolve()
              )
                .unsafeCoerce()
                .unsafeCoerce();
              expect(
                resolvedObject
                  .$equals(expectedLazilyResolvedBlankNodeOrIriObject)
                  .extract(),
              ).toStrictEqual(true);
            }
            break;
          }
          case "optionalLazyToResolvedClassUnionProperty": {
            if (empty) {
              expect(
                emptyLazyPropertiesObject.optionalLazyToResolvedClassUnionProperty.stub.isNothing(),
              ).toStrictEqual(true);

              const resolvedObject = (
                await emptyLazyPropertiesObject.optionalLazyToResolvedClassUnionProperty.resolve()
              ).unsafeCoerce();
              expect(resolvedObject.isNothing()).toStrictEqual(true);
            } else {
              expect(
                nonEmptyLazyPropertiesObject.optionalLazyToResolvedClassUnionProperty.stub
                  .unsafeCoerce()
                  .$identifier.equals(
                    expectedLazilyResolvedObjectUnion.$identifier,
                  ),
              ).toStrictEqual(true);

              const resolvedObject = (
                await nonEmptyLazyPropertiesObject.optionalLazyToResolvedClassUnionProperty.resolve()
              )
                .unsafeCoerce()
                .unsafeCoerce();
              invariant(
                resolvedObject.$type ===
                  expectedLazilyResolvedObjectUnion.$type,
              );
              expect(
                resolvedObject
                  .$equals(expectedLazilyResolvedObjectUnion)
                  .extract(),
              ).toStrictEqual(true);
            }
            break;
          }
          case "optionalLazyToResolvedIriClassProperty": {
            if (empty) {
              expect(
                emptyLazyPropertiesObject.optionalLazyToResolvedIriClassProperty.stub.isNothing(),
              ).toStrictEqual(true);

              const resolvedObject = (
                await emptyLazyPropertiesObject.optionalLazyToResolvedIriClassProperty.resolve()
              ).unsafeCoerce();
              expect(resolvedObject.isNothing()).toStrictEqual(true);
            } else {
              expect(
                nonEmptyLazyPropertiesObject.optionalLazyToResolvedIriClassProperty.stub
                  .unsafeCoerce()
                  .$identifier.equals(
                    expectedLazilyResolvedIriObject.$identifier,
                  ),
              ).toStrictEqual(true);

              const resolvedObject = (
                await nonEmptyLazyPropertiesObject.optionalLazyToResolvedIriClassProperty.resolve()
              )
                .unsafeCoerce()
                .unsafeCoerce();
              expect(
                resolvedObject
                  .$equals(expectedLazilyResolvedIriObject)
                  .extract(),
              ).toStrictEqual(true);
            }
            break;
          }
          case "optionalStubClassToResolvedClassProperty": {
            if (empty) {
              expect(
                emptyLazyPropertiesObject.optionalStubClassToResolvedClassProperty.stub.isNothing(),
              ).toStrictEqual(true);

              const resolvedObject = (
                await emptyLazyPropertiesObject.optionalStubClassToResolvedClassProperty.resolve()
              ).unsafeCoerce();
              expect(resolvedObject.isNothing()).toStrictEqual(true);
            } else {
              expect(
                nonEmptyLazyPropertiesObject.optionalStubClassToResolvedClassProperty.stub
                  .unsafeCoerce()
                  .$identifier.equals(
                    expectedLazilyResolvedBlankNodeOrIriObject.$identifier,
                  ),
              ).toStrictEqual(true);

              const resolvedObject = (
                await nonEmptyLazyPropertiesObject.optionalStubClassToResolvedClassProperty.resolve()
              )
                .unsafeCoerce()
                .unsafeCoerce();
              expect(
                resolvedObject
                  .$equals(expectedLazilyResolvedBlankNodeOrIriObject)
                  .extract(),
              ).toStrictEqual(true);
            }
            break;
          }
          case "optionalStubClassToResolvedClassUnionProperty": {
            if (empty) {
              expect(
                emptyLazyPropertiesObject.optionalStubClassToResolvedClassUnionProperty.stub.isNothing(),
              ).toStrictEqual(true);

              const resolvedObject = (
                await emptyLazyPropertiesObject.optionalStubClassToResolvedClassUnionProperty.resolve()
              ).unsafeCoerce();
              expect(resolvedObject.isNothing()).toStrictEqual(true);
            } else {
              expect(
                nonEmptyLazyPropertiesObject.optionalStubClassToResolvedClassUnionProperty.stub
                  .unsafeCoerce()
                  .$identifier.equals(
                    expectedLazilyResolvedObjectUnion.$identifier,
                  ),
              ).toStrictEqual(true);

              const resolvedObject = (
                await nonEmptyLazyPropertiesObject.optionalStubClassToResolvedClassUnionProperty.resolve()
              )
                .unsafeCoerce()
                .unsafeCoerce();
              expect(
                resolvedObject
                  .$equals(expectedLazilyResolvedObjectUnion as any)
                  .extract(),
              ).toStrictEqual(true);
            }

            break;
          }
          case "optionalStubClassUnionToResolvedClassUnionProperty": {
            if (empty) {
              expect(
                emptyLazyPropertiesObject.optionalStubClassUnionToResolvedClassUnionProperty.stub.isNothing(),
              ).toStrictEqual(true);

              const resolvedObject = (
                await emptyLazyPropertiesObject.optionalStubClassUnionToResolvedClassUnionProperty.resolve()
              ).unsafeCoerce();
              expect(resolvedObject.isNothing()).toStrictEqual(true);
            } else {
              expect(
                nonEmptyLazyPropertiesObject.optionalStubClassUnionToResolvedClassUnionProperty.stub
                  .unsafeCoerce()
                  .$identifier.equals(
                    expectedLazilyResolvedObjectUnion.$identifier,
                  ),
              ).toStrictEqual(true);

              const resolvedObject = (
                await nonEmptyLazyPropertiesObject.optionalStubClassUnionToResolvedClassUnionProperty.resolve()
              )
                .unsafeCoerce()
                .unsafeCoerce();
              expect(
                resolvedObject
                  .$equals(expectedLazilyResolvedObjectUnion as any)
                  .extract(),
              ).toStrictEqual(true);
            }

            break;
          }
          case "requiredLazyToResolvedClassProperty": {
            if (empty) {
            } else {
              expect(
                nonEmptyLazyPropertiesObject.requiredLazyToResolvedClassProperty.stub.$identifier.equals(
                  expectedLazilyResolvedBlankNodeOrIriObject.$identifier,
                ),
              ).toStrictEqual(true);

              const resolvedObject = (
                await nonEmptyLazyPropertiesObject.requiredLazyToResolvedClassProperty.resolve()
              ).unsafeCoerce();
              expect(
                resolvedObject
                  .$equals(expectedLazilyResolvedBlankNodeOrIriObject)
                  .extract(),
              ).toStrictEqual(true);
            }
            break;
          }
          case "requiredStubClassToResolvedClassProperty": {
            if (empty) {
            } else {
              expect(
                nonEmptyLazyPropertiesObject.requiredStubClassToResolvedClassProperty.stub.$identifier.equals(
                  expectedLazilyResolvedBlankNodeOrIriObject.$identifier,
                ),
              ).toStrictEqual(true);
              const resolvedObject = (
                await nonEmptyLazyPropertiesObject.requiredStubClassToResolvedClassProperty.resolve()
              ).unsafeCoerce();
              expect(
                resolvedObject
                  .$equals(expectedLazilyResolvedBlankNodeOrIriObject)
                  .extract(),
              ).toStrictEqual(true);
            }
            break;
          }
          case "setLazyToResolvedClassProperty": {
            if (empty) {
              expect(
                emptyLazyPropertiesObject.setLazyToResolvedClassProperty.stubs,
              ).toHaveLength(0);
              const resolvedObjects = (
                await emptyLazyPropertiesObject.setLazyToResolvedClassProperty.resolve()
              ).unsafeCoerce();
              expect(resolvedObjects).toHaveLength(0);
            } else {
              expect(
                nonEmptyLazyPropertiesObject.setLazyToResolvedClassProperty
                  .stubs,
              ).toHaveLength(1);
              expect(
                nonEmptyLazyPropertiesObject.setLazyToResolvedClassProperty.stubs[0].$identifier.equals(
                  expectedLazilyResolvedBlankNodeOrIriObject.$identifier,
                ),
              ).toStrictEqual(true);

              const resolvedObjects = (
                await nonEmptyLazyPropertiesObject.setLazyToResolvedClassProperty.resolve()
              ).unsafeCoerce();
              expect(resolvedObjects).toHaveLength(1);
              expect(
                resolvedObjects[0]
                  .$equals(expectedLazilyResolvedBlankNodeOrIriObject)
                  .extract(),
              ).toStrictEqual(true);
            }
            break;
          }
          case "setStubClassToResolvedClassProperty":
            {
              if (empty) {
                expect(
                  emptyLazyPropertiesObject.setStubClassToResolvedClassProperty
                    .stubs,
                ).toHaveLength(0);
                const resolvedObjects = (
                  await emptyLazyPropertiesObject.setStubClassToResolvedClassProperty.resolve()
                ).unsafeCoerce();
                expect(resolvedObjects).toHaveLength(0);
              } else {
                expect(
                  nonEmptyLazyPropertiesObject
                    .setStubClassToResolvedClassProperty.stubs,
                ).toHaveLength(1);
                expect(
                  nonEmptyLazyPropertiesObject.setStubClassToResolvedClassProperty.stubs[0].$identifier.equals(
                    expectedLazilyResolvedBlankNodeOrIriObject.$identifier,
                  ),
                ).toStrictEqual(true);

                const resolvedObjects = (
                  await nonEmptyLazyPropertiesObject.setStubClassToResolvedClassProperty.resolve()
                ).unsafeCoerce();
                expect(resolvedObjects).toHaveLength(1);
                expect(
                  resolvedObjects[0]
                    .$equals(expectedLazilyResolvedBlankNodeOrIriObject)
                    .extract(),
                ).toStrictEqual(true);
              }
            }
            break;
        }
      });
    }
  }
});
