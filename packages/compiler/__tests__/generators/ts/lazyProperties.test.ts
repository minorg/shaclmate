import * as kitchenSink from "@shaclmate/kitchen-sink-example";
import N3 from "n3";
import { MutableResourceSet } from "rdfjs-resource";
import { invariant } from "ts-invariant";
import { beforeAll, describe, it } from "vitest";

describe("lazyProperties", () => {
  let emptySut: kitchenSink.LazyPropertiesClass;
  let nonEmptySut: kitchenSink.LazyPropertiesClass;
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
  const expectedLazilyResolvedObjectUnion = new kitchenSink.ClassUnionMember1({
    $identifier: N3.DataFactory.namedNode(
      "http://example.com/lazilyResolvedObjectUnion",
    ),
    classUnionMember1Property: "test",
  });

  beforeAll(() => {
    const resourceSet = new MutableResourceSet({
      dataFactory: N3.DataFactory,
      dataset: new N3.Store(),
    });
    expectedLazilyResolvedBlankNodeOrIriObject.$toRdf({ resourceSet });
    expectedLazilyResolvedIriObject.$toRdf({ resourceSet });
    expectedLazilyResolvedObjectUnion.$toRdf({ resourceSet });

    emptySut = kitchenSink.LazyPropertiesClass.$fromRdf({
      resource: new kitchenSink.LazyPropertiesClass({
        lazyRequiredObjectProperty: expectedLazilyResolvedBlankNodeOrIriObject,
      }).$toRdf({ resourceSet }),
    }).unsafeCoerce();

    nonEmptySut = kitchenSink.LazyPropertiesClass.$fromRdf({
      resource: new kitchenSink.LazyPropertiesClass({
        lazyIriObjectProperty: expectedLazilyResolvedIriObject,
        lazyOptionalObjectProperty: expectedLazilyResolvedBlankNodeOrIriObject,
        lazyRequiredObjectProperty: expectedLazilyResolvedBlankNodeOrIriObject,
        lazyObjectSetProperty: [expectedLazilyResolvedBlankNodeOrIriObject],
        lazyObjectUnionProperty: expectedLazilyResolvedObjectUnion,
      }).$toRdf({ resourceSet }),
    }).unsafeCoerce();
  });

  it("lazy IRI", async ({ expect }) => {
    expect(
      nonEmptySut.lazyIriObjectProperty.stub
        .unsafeCoerce()
        .$identifier.equals(expectedLazilyResolvedIriObject.$identifier),
    ).toStrictEqual(true);

    const resolvedObject = (await nonEmptySut.lazyIriObjectProperty.resolve())
      .unsafeCoerce()
      .unsafeCoerce();
    expect(
      resolvedObject.$equals(expectedLazilyResolvedIriObject).extract(),
    ).toStrictEqual(true);
  });

  it("lazy object union", async ({ expect }) => {
    expect(
      nonEmptySut.lazyObjectUnionProperty.stub
        .unsafeCoerce()
        .$identifier.equals(expectedLazilyResolvedObjectUnion.$identifier),
    ).toStrictEqual(true);

    const resolvedObject = (await nonEmptySut.lazyObjectUnionProperty.resolve())
      .unsafeCoerce()
      .unsafeCoerce();
    invariant(resolvedObject.$type === expectedLazilyResolvedObjectUnion.$type);
    expect(
      resolvedObject.$equals(expectedLazilyResolvedObjectUnion).extract(),
    ).toStrictEqual(true);
  });

  it("lazy object set (empty)", async ({ expect }) => {
    expect(emptySut.lazyObjectSetProperty.stubs).toHaveLength(0);
    const resolvedObjects = (
      await emptySut.lazyObjectSetProperty.resolve()
    ).unsafeCoerce();
    expect(resolvedObjects).toHaveLength(0);
  });

  it("lazy object set (non-empty)", async ({ expect }) => {
    expect(nonEmptySut.lazyObjectSetProperty.stubs).toHaveLength(1);
    expect(
      nonEmptySut.lazyObjectSetProperty.stubs[0].$identifier.equals(
        expectedLazilyResolvedBlankNodeOrIriObject.$identifier,
      ),
    ).toStrictEqual(true);

    const resolvedObjects = (
      await nonEmptySut.lazyObjectSetProperty.resolve()
    ).unsafeCoerce();
    expect(resolvedObjects).toHaveLength(1);
    expect(
      resolvedObjects[0]
        .$equals(expectedLazilyResolvedBlankNodeOrIriObject)
        .extract(),
    ).toStrictEqual(true);
  });

  it("lazy optional object (empty)", async ({ expect }) => {
    expect(emptySut.lazyOptionalObjectProperty.stub.isNothing()).toStrictEqual(
      true,
    );

    const resolvedObject = (
      await emptySut.lazyOptionalObjectProperty.resolve()
    ).unsafeCoerce();
    expect(resolvedObject.isNothing()).toStrictEqual(true);
  });

  it("lazy optional object (non-empty)", async ({ expect }) => {
    expect(
      nonEmptySut.lazyOptionalObjectProperty.stub
        .unsafeCoerce()
        .$identifier.equals(
          expectedLazilyResolvedBlankNodeOrIriObject.$identifier,
        ),
    ).toStrictEqual(true);

    const resolvedObject = (
      await nonEmptySut.lazyOptionalObjectProperty.resolve()
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
      nonEmptySut.lazyRequiredObjectProperty.stub.$identifier.equals(
        expectedLazilyResolvedBlankNodeOrIriObject.$identifier,
      ),
    ).toStrictEqual(true);

    const resolvedObject = (
      await nonEmptySut.lazyRequiredObjectProperty.resolve()
    ).unsafeCoerce();
    expect(
      resolvedObject
        .$equals(expectedLazilyResolvedBlankNodeOrIriObject)
        .extract(),
    ).toStrictEqual(true);
  });
});
