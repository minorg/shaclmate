import * as kitchenSink from "@shaclmate/kitchen-sink-example";
import N3 from "n3";
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
        lazyRequiredObjectProperty: expectedLazilyResolvedBlankNodeOrIriObject,
        stubRequiredObjectProperty: expectedLazilyResolvedBlankNodeOrIriObject,
      }).$toRdf({ resourceSet }),
    }).unsafeCoerce();

    nonEmptyLazyPropertiesObject = kitchenSink.LazyPropertiesClass.$fromRdf({
      resource: new kitchenSink.LazyPropertiesClass({
        lazyIriObjectProperty: expectedLazilyResolvedIriObject,
        lazyOptionalObjectProperty: expectedLazilyResolvedBlankNodeOrIriObject,
        lazyRequiredObjectProperty: expectedLazilyResolvedBlankNodeOrIriObject,
        lazyObjectSetProperty: [expectedLazilyResolvedBlankNodeOrIriObject],
        lazyObjectUnionProperty: expectedLazilyResolvedObjectUnion,
        stubOptionalObjectProperty: expectedLazilyResolvedBlankNodeOrIriObject,
        stubObjectSetProperty: [expectedLazilyResolvedBlankNodeOrIriObject],
        stubRequiredObjectProperty: expectedLazilyResolvedBlankNodeOrIriObject,
      }).$toRdf({ resourceSet }),
    }).unsafeCoerce();
  });

  it("lazy IRI", async ({ expect }) => {
    expect(
      nonEmptyLazyPropertiesObject.lazyIriObjectProperty.stub
        .unsafeCoerce()
        .$identifier.equals(expectedLazilyResolvedIriObject.$identifier),
    ).toStrictEqual(true);

    const resolvedObject = (
      await nonEmptyLazyPropertiesObject.lazyIriObjectProperty.resolve()
    )
      .unsafeCoerce()
      .unsafeCoerce();
    expect(
      resolvedObject.$equals(expectedLazilyResolvedIriObject).extract(),
    ).toStrictEqual(true);
  });

  it("lazy object union", async ({ expect }) => {
    expect(
      nonEmptyLazyPropertiesObject.lazyObjectUnionProperty.stub
        .unsafeCoerce()
        .$identifier.equals(expectedLazilyResolvedObjectUnion.$identifier),
    ).toStrictEqual(true);

    const resolvedObject = (
      await nonEmptyLazyPropertiesObject.lazyObjectUnionProperty.resolve()
    )
      .unsafeCoerce()
      .unsafeCoerce();
    invariant(resolvedObject.$type === expectedLazilyResolvedObjectUnion.$type);
    expect(
      resolvedObject.$equals(expectedLazilyResolvedObjectUnion).extract(),
    ).toStrictEqual(true);
  });

  it("lazy object set (empty)", async ({ expect }) => {
    expect(emptyLazyPropertiesObject.lazyObjectSetProperty.stubs).toHaveLength(
      0,
    );
    const resolvedObjects = (
      await emptyLazyPropertiesObject.lazyObjectSetProperty.resolve()
    ).unsafeCoerce();
    expect(resolvedObjects).toHaveLength(0);
  });

  it("lazy object set (non-empty)", async ({ expect }) => {
    expect(
      nonEmptyLazyPropertiesObject.lazyObjectSetProperty.stubs,
    ).toHaveLength(1);
    expect(
      nonEmptyLazyPropertiesObject.lazyObjectSetProperty.stubs[0].$identifier.equals(
        expectedLazilyResolvedBlankNodeOrIriObject.$identifier,
      ),
    ).toStrictEqual(true);

    const resolvedObjects = (
      await nonEmptyLazyPropertiesObject.lazyObjectSetProperty.resolve()
    ).unsafeCoerce();
    expect(resolvedObjects).toHaveLength(1);
    expect(
      resolvedObjects[0]
        .$equals(expectedLazilyResolvedBlankNodeOrIriObject)
        .extract(),
    ).toStrictEqual(true);
  });

  it("lazy optional object (empty)", async ({ expect }) => {
    expect(
      emptyLazyPropertiesObject.lazyOptionalObjectProperty.stub.isNothing(),
    ).toStrictEqual(true);

    const resolvedObject = (
      await emptyLazyPropertiesObject.lazyOptionalObjectProperty.resolve()
    ).unsafeCoerce();
    expect(resolvedObject.isNothing()).toStrictEqual(true);
  });

  it("lazy optional object (non-empty)", async ({ expect }) => {
    expect(
      nonEmptyLazyPropertiesObject.lazyOptionalObjectProperty.stub
        .unsafeCoerce()
        .$identifier.equals(
          expectedLazilyResolvedBlankNodeOrIriObject.$identifier,
        ),
    ).toStrictEqual(true);

    const resolvedObject = (
      await nonEmptyLazyPropertiesObject.lazyOptionalObjectProperty.resolve()
    )
      .unsafeCoerce()
      .unsafeCoerce();
    expect(
      resolvedObject
        .$equals(expectedLazilyResolvedBlankNodeOrIriObject)
        .extract(),
    ).toStrictEqual(true);
  });

  it("lazy required object", async ({ expect }) => {
    expect(
      nonEmptyLazyPropertiesObject.lazyRequiredObjectProperty.stub.$identifier.equals(
        expectedLazilyResolvedBlankNodeOrIriObject.$identifier,
      ),
    ).toStrictEqual(true);

    const resolvedObject = (
      await nonEmptyLazyPropertiesObject.lazyRequiredObjectProperty.resolve()
    ).unsafeCoerce();
    expect(
      resolvedObject
        .$equals(expectedLazilyResolvedBlankNodeOrIriObject)
        .extract(),
    ).toStrictEqual(true);
  });

  it("stub object set (empty)", async ({ expect }) => {
    expect(emptyLazyPropertiesObject.stubObjectSetProperty.stubs).toHaveLength(
      0,
    );
    const resolvedObjects = (
      await emptyLazyPropertiesObject.stubObjectSetProperty.resolve()
    ).unsafeCoerce();
    expect(resolvedObjects).toHaveLength(0);
  });

  it("stub object set (non-empty)", async ({ expect }) => {
    expect(
      nonEmptyLazyPropertiesObject.stubObjectSetProperty.stubs,
    ).toHaveLength(1);
    expect(
      nonEmptyLazyPropertiesObject.stubObjectSetProperty.stubs[0].$identifier.equals(
        expectedLazilyResolvedBlankNodeOrIriObject.$identifier,
      ),
    ).toStrictEqual(true);

    const resolvedObjects = (
      await nonEmptyLazyPropertiesObject.stubObjectSetProperty.resolve()
    ).unsafeCoerce();
    expect(resolvedObjects).toHaveLength(1);
    expect(
      resolvedObjects[0]
        .$equals(expectedLazilyResolvedBlankNodeOrIriObject)
        .extract(),
    ).toStrictEqual(true);
  });

  it("stub optional object (empty)", async ({ expect }) => {
    expect(
      emptyLazyPropertiesObject.stubOptionalObjectProperty.stub.isNothing(),
    ).toStrictEqual(true);

    const resolvedObject = (
      await emptyLazyPropertiesObject.stubOptionalObjectProperty.resolve()
    ).unsafeCoerce();
    expect(resolvedObject.isNothing()).toStrictEqual(true);
  });

  it("stub optional object (non-empty)", async ({ expect }) => {
    expect(
      nonEmptyLazyPropertiesObject.stubOptionalObjectProperty.stub
        .unsafeCoerce()
        .$identifier.equals(
          expectedLazilyResolvedBlankNodeOrIriObject.$identifier,
        ),
    ).toStrictEqual(true);

    const resolvedObject = (
      await nonEmptyLazyPropertiesObject.stubOptionalObjectProperty.resolve()
    )
      .unsafeCoerce()
      .unsafeCoerce();
    expect(
      resolvedObject
        .$equals(expectedLazilyResolvedBlankNodeOrIriObject)
        .extract(),
    ).toStrictEqual(true);
  });

  it("stub required object", async ({ expect }) => {
    expect(
      nonEmptyLazyPropertiesObject.stubRequiredObjectProperty.stub.$identifier.equals(
        expectedLazilyResolvedBlankNodeOrIriObject.$identifier,
      ),
    ).toStrictEqual(true);

    const resolvedObject = (
      await nonEmptyLazyPropertiesObject.stubRequiredObjectProperty.resolve()
    ).unsafeCoerce();
    expect(
      resolvedObject
        .$equals(expectedLazilyResolvedBlankNodeOrIriObject)
        .extract(),
    ).toStrictEqual(true);
  });
});
