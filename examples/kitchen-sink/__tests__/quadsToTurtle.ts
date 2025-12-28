import type { Quad } from "@rdfjs/types";
import { rdf, rdfs, sh, xsd } from "@tpluscode/rdf-ns-builders";
import N3 from "n3";

export function quadsToTurtle(quads: Iterable<Quad>): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new N3.Writer({
      format: "text/turtle",
      prefixes: {
        rdf: rdf[""].value,
        rdfs: rdfs[""].value,
        sh: sh[""].value,
        xsd: xsd[""].value,
      },
    });
    for (const quad of quads) {
      writer.addQuad(quad);
    }
    writer.end((error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
}
