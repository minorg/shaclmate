import PrefixMap from "@rdfjs/prefix-map/PrefixMap.js";
import Serializer from "@rdfjs/serializer-turtle";
import type { Quad } from "@rdfjs/types";
import { rdf, rdfs, sh, xsd } from "@tpluscode/rdf-ns-builders";
import { DataFactory } from "n3";

const prefixMap = new PrefixMap(
  [
    ["rdf", rdf[""]],
    ["rdfs", rdfs[""]],
    ["sh", sh[""]],
    ["xsd", xsd[""]],
  ],
  { factory: DataFactory },
);

const serializer = new Serializer({ prefixes: prefixMap });

export function quadsToTurtle(quads: Iterable<Quad>): string {
  return serializer.transform(quads);
}
