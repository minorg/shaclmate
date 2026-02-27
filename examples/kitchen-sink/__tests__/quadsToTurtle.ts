import dataFactory from "@rdfjs/data-model";
import PrefixMap from "@rdfjs/prefix-map/PrefixMap.js";
import Serializer from "@rdfjs/serializer-turtle";
import type { Quad } from "@rdfjs/types";
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

const serializer = new Serializer({ prefixes: prefixMap });

export function quadsToTurtle(quads: Iterable<Quad>): string {
  return serializer.transform(quads);
}
