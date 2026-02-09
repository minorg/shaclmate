import type { BlankNode, Literal, NamedNode, Variable } from "@rdfjs/types";
import { rdf, rdfs, xsd } from "@tpluscode/rdf-ns-builders";
import { type Code, code, literalOf } from "ts-poet";
import { logger } from "../../logger.js";
import { sharedImports } from "./sharedImports.js";
import { sharedSnippets } from "./sharedSnippets.js";

export function rdfjsTermExpression(
  rdfjsTerm:
    | Omit<BlankNode, "equals">
    | Omit<Literal, "equals">
    | Omit<NamedNode, "equals">
    | Omit<Variable, "equals">,
): Code {
  switch (rdfjsTerm.termType) {
    case "BlankNode":
      return code`${sharedImports.dataFactory}.blankNode(${literalOf(rdfjsTerm.value)})`;
    case "Literal":
      if (rdfjsTerm.datatype.equals(xsd.string)) {
        if (rdfjsTerm.language.length === 0) {
          return code`${sharedImports.dataFactory}.literal(${literalOf(rdfjsTerm.value)})`;
        }
        return code`${sharedImports.dataFactory}.literal(${literalOf(rdfjsTerm.value)}, ${literalOf(rdfjsTerm.language)})`;
      }
      return code`${sharedImports.dataFactory}.literal(${literalOf(rdfjsTerm.value)}, ${rdfjsTermExpression(rdfjsTerm.datatype)})`;
    case "NamedNode": {
      if (rdfjsTerm.value.startsWith(rdf[""].value)) {
        const unqualifiedName = rdfjsTerm.value.substring(rdf[""].value.length);
        switch (unqualifiedName) {
          case "first":
          case "nil":
          case "rest":
          case "subject":
          case "type":
            return code`${sharedSnippets.RdfVocabularies}rdf.${unqualifiedName}`;
          default:
            logger.warn("unrecognized rdf IRI: %s", rdfjsTerm.value);
        }
      } else if (rdfjsTerm.value.startsWith(rdfs[""].value)) {
        const unqualifiedName = rdfjsTerm.value.substring(
          rdfs[""].value.length,
        );
        switch (unqualifiedName) {
          case "subClassOf":
            return code`${sharedSnippets.RdfVocabularies}.rdfs.${unqualifiedName}`;
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
            return code`${sharedSnippets.RdfVocabularies}.xsd.${unqualifiedName}`;
          default:
            logger.warn("unrecognized xsd IRI: %s", rdfjsTerm.value);
        }
      }

      return code`${sharedImports.dataFactory}.namedNode(${literalOf(rdfjsTerm.value)})`;
    }
    case "Variable":
      return code`${sharedImports.dataFactory}.variable!(${literalOf(rdfjsTerm.value)})`;
  }
}
