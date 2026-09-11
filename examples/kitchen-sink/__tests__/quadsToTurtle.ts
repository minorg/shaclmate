import type { Quad } from "@rdfjs/types";
import { PrefixMap } from "@rdfx/collection";
import dataFactory from "@rdfx/data-factory";
import { serializeSync } from "@rdfx/serializer";
import { rdf, rdfs, sh, xsd } from "@tpluscode/rdf-ns-builders";

const prefixMap = new PrefixMap(
  [
    ["rdf", rdf[""]],
    ["rdfs", rdfs[""]],
    ["sh", sh[""]],
    ["xsd", xsd[""]],
  ],
  { factory: dataFactory },
);

export function quadsToTurtle(quads: Iterable<Quad>): string {
  return serializeSync(quads, {
    format: "text/turtle",
    prefixes: prefixMap,
  }).unsafeCoerce();
}
