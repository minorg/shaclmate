import type { BlankNode, Literal, NamedNode, Variable } from "@rdfjs/types";
import { rdf, rdfs, xsd } from "@tpluscode/rdf-ns-builders";
import { type Code, code, literalOf } from "ts-poet";
import { logger } from "../../logger.js";
import { snippets_RdfVocabularies } from "./_snippets/snippets_RdfVocabularies.js";
import { imports } from "./imports.js";

export function rdfjsTermExpression(
  rdfjsTerm:
    | Omit<BlankNode, "equals">
    | Omit<Literal, "equals">
    | Omit<NamedNode, "equals">
    | Omit<Variable, "equals">,
): Code {
  switch (rdfjsTerm.termType) {
    case "BlankNode":
      return code`${imports.dataFactory}.blankNode(${literalOf(rdfjsTerm.value)})`;
    case "Literal":
      if (rdfjsTerm.datatype.equals(xsd.string)) {
        if (rdfjsTerm.language.length === 0) {
          return code`${imports.dataFactory}.literal(${literalOf(rdfjsTerm.value)})`;
        }
        return code`${imports.dataFactory}.literal(${literalOf(rdfjsTerm.value)}, ${literalOf(rdfjsTerm.language)})`;
      }
      return code`${imports.dataFactory}.literal(${literalOf(rdfjsTerm.value)}, ${rdfjsTermExpression(rdfjsTerm.datatype)})`;
    case "NamedNode": {
      if (rdfjsTerm.value.startsWith(rdf[""].value)) {
        const unqualifiedName = rdfjsTerm.value.substring(rdf[""].value.length);
        switch (unqualifiedName) {
          case "first":
          case "nil":
          case "rest":
          case "subject":
          case "type":
            return code`${snippets_RdfVocabularies}.rdf.${unqualifiedName}`;
          default:
            logger.warn("unrecognized rdf IRI: %s", rdfjsTerm.value);
        }
      } else if (rdfjsTerm.value.startsWith(rdfs[""].value)) {
        const unqualifiedName = rdfjsTerm.value.substring(
          rdfs[""].value.length,
        );
        switch (unqualifiedName) {
          case "subClassOf":
            return code`${snippets_RdfVocabularies}.rdfs.${unqualifiedName}`;
          default:
            logger.warn("unrecognized rdfs IRI: %s", rdfjsTerm.value);
        }
      } else if (rdfjsTerm.value.startsWith(xsd[""].value)) {
        const unqualifiedName = rdfjsTerm.value.substring(xsd[""].value.length);
        switch (unqualifiedName) {
          case "boolean":
          case "date":
          case "dateTime":
          case "decimal":
          case "double":
          case "integer":
            return code`${snippets_RdfVocabularies}.xsd.${unqualifiedName}`;
          default:
            logger.warn("unrecognized xsd IRI: %s", rdfjsTerm.value);
        }
      }

      return code`${imports.dataFactory}.namedNode(${literalOf(rdfjsTerm.value)})`;
    }
    case "Variable":
      return code`${imports.dataFactory}.variable!(${literalOf(rdfjsTerm.value)})`;
  }
}
