import type { Quad } from "@rdfjs/types";
import type { $ObjectSet } from "@shaclmate/kitchen-sink-example";
import N3 from "n3";
import { MutableResourceSet } from "rdfjs-resource";
import { beforeAll } from "vitest";
import { harnesses } from "./harnesses.js";

export function behavesLikeObjectSet<ObjectSetT extends $ObjectSet>({
  addQuad,
  objectSet,
}: { addQuad: (quad: Quad) => void; objectSet: ObjectSetT }) {
  beforeAll(() => {
    const dataset = new N3.Store();
    const mutateGraph = N3.DataFactory.defaultGraph();
    const resourceSet = new MutableResourceSet({
      dataFactory: N3.DataFactory,
      dataset,
    });
    harnesses.concreteChildClassNodeShape.instance.toRdf({
      resourceSet,
      mutateGraph,
    });
    harnesses.concreteParentClassNodeShape.instance.toRdf({
      resourceSet,
      mutateGraph,
    });
    for (const quad of dataset) {
      addQuad(quad);
    }
  });
}
