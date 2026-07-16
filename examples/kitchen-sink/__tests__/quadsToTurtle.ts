import type { Quad } from "@rdfjs/types";
import { PrefixMap } from "@rdfx/collection";
import dataFactory from "@rdfx/data-factory";
import { TurtleSerializer } from "@rdfx/serializers";
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

const serializer = new TurtleSerializer({ prefixes: prefixMap });

export function quadsToTurtle(quads: Iterable<Quad>): string {
  return serializer.transform(quads);
}
