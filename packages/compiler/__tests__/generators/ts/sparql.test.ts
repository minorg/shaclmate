import type { NamedNode, Quad } from "@rdfjs/types";
import N3, { DataFactory as dataFactory } from "n3";
import * as oxigraph from "oxigraph";
import { MutableResourceSet } from "rdfjs-resource";
import { describe, it } from "vitest";
import { harnesses } from "./harnesses.js";
import { quadsToTurtle } from "./quadsToTurtle.js";

describe("sparql", () => {
  for (const [id, harness] of Object.entries(harnesses)) {
    if (harness.instance.$identifier.termType !== "NamedNode") {
      continue;
    }

    it(`SPARQL: ${id}`, async ({ expect }) => {
      const toRdfDataset = harness.toRdf().dataset;
      const toRdfQuads: Quad[] = [];

      const oxigraphStore = new oxigraph.Store();
      for (const quad of toRdfDataset) {
        oxigraphStore.add(quad);
        toRdfQuads.push(quad);
      }

      const constructQueryString = harness.sparqlConstructQueryString();

      // Add to a Dataset to deduplicate the quads
      const constructResultDataset = new N3.Store(
        oxigraphStore.query(constructQueryString) as Quad[],
      );
      const constructInstance = harness
        .fromRdf(
          new MutableResourceSet({
            dataFactory,
            dataset: constructResultDataset,
          }).namedResource(harness.instance.$identifier as NamedNode),
          {
            extra: 1,
          },
        )
        .unsafeCoerce();
      const equalsResult = harness.equals(constructInstance as any).extract();
      if (equalsResult !== true) {
        const toRdfString = await quadsToTurtle(toRdfQuads);
        const constructResultString = await quadsToTurtle([
          ...constructResultDataset,
        ]);
        console.log("not equal:\n", toRdfString, "\n", constructResultString);
      }
      expect(equalsResult).toStrictEqual(true);
    });
  }
});
