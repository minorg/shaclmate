import type { NamedNode } from "@rdfjs/types";
import * as kitchenSink from "@shaclmate/kitchen-sink-example";
import N3, { DataFactory as dataFactory } from "n3";
import { MutableResourceSet } from "rdfjs-resource";
import { beforeAll, describe, it } from "vitest";
import { harnesses } from "./harnesses.js";

describe("RdfjsDatasetObjectSet", () => {
  const dataset = new N3.Store();
  const resourceSet = new MutableResourceSet({ dataFactory, dataset });
  const objectSet = new kitchenSink.$RdfjsDatasetObjectSet(dataset);

  beforeAll(() => {
    harnesses.concreteChildClassNodeShape.instance.toRdf({
      resourceSet,
      mutateGraph: dataFactory.defaultGraph(),
    });
    harnesses.concreteParentClassNodeShape.instance.toRdf({
      resourceSet,
      mutateGraph: dataFactory.defaultGraph(),
    });
  });

  it("object", ({ expect }) => {
    expect(
      objectSet
        .objectSync<kitchenSink.ConcreteChildClassNodeShape>(
          harnesses.concreteChildClassNodeShape.instance
            .identifier as NamedNode,
          "ConcreteChildClassNodeShape",
        )
        .unsafeCoerce()
        .equals(harnesses.concreteChildClassNodeShape.instance)
        .unsafeCoerce(),
    ).toBe(true);
  });
});
