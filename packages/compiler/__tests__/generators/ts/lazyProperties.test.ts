import * as kitchenSink from "@shaclmate/kitchen-sink-example";
import N3 from "n3";
import { MutableResourceSet } from "rdfjs-resource";
import { beforeAll, describe, it } from "vitest";

describe("lazyProperties", () => {
  let emptySut: kitchenSink.LazyPropertiesClass;
  let nonEmptySut: kitchenSink.LazyPropertiesClass;
  const expectedLazyResolvedBlankNodeOrIriObject =
    new kitchenSink.LazyResolvedBlankNodeOrIriClass({
      $identifier: N3.DataFactory.namedNode(
        "http://example.com/lazyResolvedBlankNodeOrIriObject",
      ),
      lazyResolvedStringProperty: "test",
    });
  const expectedLazyResolvedIriObject = new kitchenSink.LazyResolvedIriClass({
    $identifier: N3.DataFactory.namedNode(
      "http://example.com/lazyResolvedIriObject",
    ),
    lazyResolvedStringProperty: "test",
  });

  beforeAll(() => {
    const resourceSet = new MutableResourceSet({
      dataFactory: N3.DataFactory,
      dataset: new N3.Store(),
    });
    expectedLazyResolvedBlankNodeOrIriObject.$toRdf({ resourceSet });
    expectedLazyResolvedIriObject.$toRdf({ resourceSet });

    emptySut = kitchenSink.LazyPropertiesClass.$fromRdf({
      resource: new kitchenSink.LazyPropertiesClass({
        lazyRequiredObjectProperty: expectedLazyResolvedBlankNodeOrIriObject,
      }).$toRdf({ resourceSet }),
    }).unsafeCoerce();

    nonEmptySut = kitchenSink.LazyPropertiesClass.$fromRdf({
      resource: new kitchenSink.LazyPropertiesClass({
        lazyIriObjectProperty: expectedLazyResolvedIriObject,
        lazyOptionalObjectProperty: expectedLazyResolvedBlankNodeOrIriObject,
        lazyRequiredObjectProperty: expectedLazyResolvedBlankNodeOrIriObject,
        lazyObjectSetProperty: [expectedLazyResolvedBlankNodeOrIriObject],
      }).$toRdf({ resourceSet }),
    }).unsafeCoerce();
  });

  it("lazy IRI", async ({ expect }) => {
    expect(
      nonEmptySut.lazyIriObjectProperty.stub
        .unsafeCoerce()
        .$identifier.equals(expectedLazyResolvedIriObject.$identifier),
    ).toStrictEqual(true);

    const resolvedObject = (await nonEmptySut.lazyIriObjectProperty.resolve())
      .unsafeCoerce()
      .unsafeCoerce();
    expect(
      resolvedObject.$equals(expectedLazyResolvedIriObject).extract(),
    ).toStrictEqual(true);
  });

  it("lazyObjectSet (empty)", async ({ expect }) => {
    expect(emptySut.lazyObjectSetProperty.stubs).toHaveLength(0);
    const resolvedObjects = (
      await emptySut.lazyObjectSetProperty.resolve()
    ).unsafeCoerce();
    expect(resolvedObjects).toHaveLength(0);
  });

  it("lazyObjectSet (non-empty)", async ({ expect }) => {
    expect(nonEmptySut.lazyObjectSetProperty.stubs).toHaveLength(1);
    expect(
      nonEmptySut.lazyObjectSetProperty.stubs[0].$identifier.equals(
        expectedLazyResolvedBlankNodeOrIriObject.$identifier,
      ),
    ).toStrictEqual(true);

    const resolvedObjects = (
      await nonEmptySut.lazyObjectSetProperty.resolve()
    ).unsafeCoerce();
    expect(resolvedObjects).toHaveLength(1);
    expect(
      resolvedObjects[0]
        .$equals(expectedLazyResolvedBlankNodeOrIriObject)
        .extract(),
    ).toStrictEqual(true);
  });

  it("lazyOptionalObjectProperty (empty)", async ({ expect }) => {
    expect(emptySut.lazyOptionalObjectProperty.stub.isNothing()).toStrictEqual(
      true,
    );

    const resolvedObject = (
      await emptySut.lazyOptionalObjectProperty.resolve()
    ).unsafeCoerce();
    expect(resolvedObject.isNothing()).toStrictEqual(true);
  });

  it("lazyOptionalObjectProperty (non-empty)", async ({ expect }) => {
    expect(
      nonEmptySut.lazyOptionalObjectProperty.stub
        .unsafeCoerce()
        .$identifier.equals(
          expectedLazyResolvedBlankNodeOrIriObject.$identifier,
        ),
    ).toStrictEqual(true);

    const resolvedObject = (
      await nonEmptySut.lazyOptionalObjectProperty.resolve()
    )
      .unsafeCoerce()
      .unsafeCoerce();
    expect(
      resolvedObject
        .$equals(expectedLazyResolvedBlankNodeOrIriObject)
        .extract(),
    ).toStrictEqual(true);
  });

  it("lazyRequiredObjectProperty", async ({ expect }) => {
    expect(
      nonEmptySut.lazyRequiredObjectProperty.stub.$identifier.equals(
        expectedLazyResolvedBlankNodeOrIriObject.$identifier,
      ),
    ).toStrictEqual(true);

    const resolvedObject = (
      await nonEmptySut.lazyRequiredObjectProperty.resolve()
    ).unsafeCoerce();
    expect(
      resolvedObject
        .$equals(expectedLazyResolvedBlankNodeOrIriObject)
        .extract(),
    ).toStrictEqual(true);
  });
});
