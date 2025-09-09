import * as kitchenSink from "@shaclmate/kitchen-sink-example";
import N3 from "n3";
import { MutableResourceSet } from "rdfjs-resource";
import { beforeAll, describe, it } from "vitest";

describe("lazyProperties", () => {
  let emptySut: kitchenSink.LazyPropertiesClass;
  let nonEmptySut: kitchenSink.LazyPropertiesClass;
  const expectedLazyObject = new kitchenSink.NonClass({
    $identifier: N3.DataFactory.namedNode("http://example.com/lazyObject"),
    nonClassProperty: "test",
  });

  beforeAll(() => {
    const resourceSet = new MutableResourceSet({
      dataFactory: N3.DataFactory,
      dataset: new N3.Store(),
    });
    expectedLazyObject.$toRdf({ resourceSet });

    emptySut = kitchenSink.LazyPropertiesClass.$fromRdf({
      resource: new kitchenSink.LazyPropertiesClass({
        lazyRequiredObjectProperty: expectedLazyObject,
      }).$toRdf({ resourceSet }),
    }).unsafeCoerce();

    nonEmptySut = kitchenSink.LazyPropertiesClass.$fromRdf({
      resource: new kitchenSink.LazyPropertiesClass({
        lazyOptionalObjectProperty: expectedLazyObject,
        lazyRequiredObjectProperty: expectedLazyObject,
        lazyObjectSetProperty: [expectedLazyObject],
      }).$toRdf({ resourceSet }),
    }).unsafeCoerce();
  });

  it("lazyObjectSet (empty)", async ({ expect }) => {
    expect(emptySut.lazyObjectSetProperty.identifiers).toHaveLength(0);
    const actualLazyObjects = (
      await emptySut.lazyObjectSetProperty.objects()
    ).unsafeCoerce();
    expect(actualLazyObjects).toHaveLength(0);
  });

  it("lazyObjectSet (non-empty)", async ({ expect }) => {
    expect(nonEmptySut.lazyObjectSetProperty.identifiers).toHaveLength(1);
    expect(
      nonEmptySut.lazyObjectSetProperty.identifiers[0].equals(
        expectedLazyObject.$identifier,
      ),
    ).toStrictEqual(true);

    const actualLazyObjects = (
      await nonEmptySut.lazyObjectSetProperty.objects()
    ).unsafeCoerce();
    expect(actualLazyObjects).toHaveLength(1);
    expect(
      actualLazyObjects[0].$equals(expectedLazyObject).extract(),
    ).toStrictEqual(true);
  });

  it("lazyOptionalObjectProperty (empty)", async ({ expect }) => {
    expect(
      emptySut.lazyOptionalObjectProperty.identifier.isNothing(),
    ).toStrictEqual(true);

    const actualLazyObject = (
      await emptySut.lazyOptionalObjectProperty.object()
    ).unsafeCoerce();
    expect(actualLazyObject.isNothing()).toStrictEqual(true);
  });

  it("lazyOptionalObjectProperty (non-empty)", async ({ expect }) => {
    expect(
      nonEmptySut.lazyOptionalObjectProperty.identifier
        .unsafeCoerce()
        .equals(expectedLazyObject.$identifier),
    ).toStrictEqual(true);

    const actualLazyObject = (
      await nonEmptySut.lazyOptionalObjectProperty.object()
    )
      .unsafeCoerce()
      .unsafeCoerce();
    expect(
      actualLazyObject.$equals(expectedLazyObject).extract(),
    ).toStrictEqual(true);
  });

  it("lazyRequiredObjectProperty", async ({ expect }) => {
    expect(
      nonEmptySut.lazyRequiredObjectProperty.identifier.equals(
        expectedLazyObject.$identifier,
      ),
    ).toStrictEqual(true);

    const actualLazyObject = (
      await nonEmptySut.lazyRequiredObjectProperty.object()
    ).unsafeCoerce();
    expect(
      actualLazyObject.$equals(expectedLazyObject).extract(),
    ).toStrictEqual(true);
  });
});
