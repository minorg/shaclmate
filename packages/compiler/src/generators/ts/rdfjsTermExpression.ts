import type { BlankNode, Literal, NamedNode, Variable } from "@rdfjs/types";
import { rdf, rdfs, xsd } from "@tpluscode/rdf-ns-builders";
import { logger } from "../../logger.js";
import { syntheticNamePrefix } from "./syntheticNamePrefix.js";

export function rdfjsTermExpression(
  rdfjsTerm:
    | Omit<BlankNode, "equals">
    | Omit<Literal, "equals">
    | Omit<NamedNode, "equals">
    | Omit<Variable, "equals">,
): string {
  switch (rdfjsTerm.termType) {
    case "BlankNode":
      return `dataFactory.blankNode("${rdfjsTerm.value}")`;
    case "Literal":
      if (rdfjsTerm.datatype.equals(xsd.string)) {
        if (rdfjsTerm.language.length === 0) {
          return `dataFactory.literal("${rdfjsTerm.value}")`;
        }
        return `dataFactory.literal("${rdfjsTerm.value}", "${rdfjsTerm.language}")`;
      }
      return `dataFactory.literal("${rdfjsTerm.value}", ${rdfjsTermExpression(rdfjsTerm.datatype)})`;
    case "NamedNode": {
      if (rdfjsTerm.value.startsWith(rdf[""].value)) {
        const unqualifiedName = rdfjsTerm.value.substring(rdf[""].value.length);
        switch (unqualifiedName) {
          case "first":
          case "nil":
          case "rest":
          case "subject":
          case "type":
            return `${syntheticNamePrefix}RdfVocabularies.rdf.${unqualifiedName}`;
          default:
            logger.warn("unrecognized rdf IRI: %s", rdfjsTerm.value);
        }
      } else if (rdfjsTerm.value.startsWith(rdfs[""].value)) {
        const unqualifiedName = rdfjsTerm.value.substring(
          rdfs[""].value.length,
        );
        switch (unqualifiedName) {
          case "subClassOf":
            return `${syntheticNamePrefix}RdfVocabularies.rdfs.${unqualifiedName}`;
          default:
            logger.warn("unrecognized rdfs IRI: %s", rdfjsTerm.value);
        }
      } else if (rdfjsTerm.value.startsWith(xsd[""].value)) {
        const unqualifiedName = rdfjsTerm.value.substring(xsd[""].value.length);
        switch (unqualifiedName) {
          case "boolean":
          case "date":
          case "dateTime":
          case "integer":
            return `${syntheticNamePrefix}RdfVocabularies.xsd.${unqualifiedName}`;
          default:
            logger.warn("unrecognized xsd IRI: %s", rdfjsTerm.value);
        }
      }

      return `dataFactory.namedNode("${rdfjsTerm.value}")`;
    }
    case "Variable":
      return `dataFactory.variable!("${rdfjsTerm.value}")`;
  }
}
