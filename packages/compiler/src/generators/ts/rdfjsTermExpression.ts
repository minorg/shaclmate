import type { BlankNode, Literal, NamedNode, Variable } from "@rdfjs/types";
import { rdf, rdfs, xsd } from "@tpluscode/rdf-ns-builders";
import type { Logger } from "ts-log";
import type { Imports } from "./Imports.js";
import type { Snippets } from "./Snippets.js";
import { type Code, code, literalOf } from "./ts-poet-wrapper.js";

export function rdfjsTermExpression(
  this: { imports: Imports; logger: Logger; snippets: Snippets },
  rdfjsTerm:
    | Omit<BlankNode, "equals">
    | Omit<Literal, "equals">
    | Omit<NamedNode, "equals">
    | Omit<Variable, "equals">,
): Code {
  switch (rdfjsTerm.termType) {
    case "BlankNode":
      return code`${this.imports.dataFactory}.blankNode(${literalOf(rdfjsTerm.value)})`;
    case "Literal":
      if (rdfjsTerm.datatype.equals(xsd.string)) {
        if (rdfjsTerm.language.length === 0) {
          return code`${this.imports.dataFactory}.literal(${literalOf(rdfjsTerm.value)})`;
        }
        return code`${this.imports.dataFactory}.literal(${literalOf(rdfjsTerm.value)}, ${literalOf(rdfjsTerm.language)})`;
      }
      return code`${this.imports.dataFactory}.literal(${literalOf(rdfjsTerm.value)}, ${rdfjsTermExpression.call(this, rdfjsTerm.datatype)})`;
    case "NamedNode": {
      if (rdfjsTerm.value.startsWith(rdf[""].value)) {
        const unqualifiedName = rdfjsTerm.value.substring(rdf[""].value.length);
        switch (unqualifiedName) {
          case "first":
          case "langString":
          case "nil":
          case "rest":
          case "subject":
          case "type":
            return code`${this.snippets.RdfVocabularies}.rdf.${unqualifiedName}`;
          default:
            this.logger.warn("unrecognized rdf IRI: %s", rdfjsTerm.value);
        }
      } else if (rdfjsTerm.value.startsWith(rdfs[""].value)) {
        const unqualifiedName = rdfjsTerm.value.substring(
          rdfs[""].value.length,
        );
        switch (unqualifiedName) {
          case "subClassOf":
            return code`${this.snippets.RdfVocabularies}.rdfs.${unqualifiedName}`;
          default:
            this.logger.warn("unrecognized rdfs IRI: %s", rdfjsTerm.value);
        }
      } else if (rdfjsTerm.value.startsWith(xsd[""].value)) {
        const unqualifiedName = rdfjsTerm.value.substring(xsd[""].value.length);
        switch (unqualifiedName) {
          case "boolean":
          case "byte":
          case "float":
          case "date":
          case "dateTime":
          case "dateTimeStamp":
          case "decimal":
          case "double":
          case "int":
          case "integer":
          case "long":
          case "negativeInteger":
          case "nonNegativeInteger":
          case "nonPositiveInteger":
          case "positiveInteger":
          case "short":
          case "string":
          case "unsignedByte":
          case "unsignedInt":
          case "unsignedLong":
          case "unsignedShort":
            return code`${this.snippets.RdfVocabularies}.xsd.${unqualifiedName}`;
          default:
            this.logger.warn("unrecognized xsd IRI: %s", rdfjsTerm.value);
        }
      }

      return code`${this.imports.dataFactory}.namedNode(${literalOf(rdfjsTerm.value)})`;
    }
    case "Variable":
      return code`${this.imports.dataFactory}.variable!(${literalOf(rdfjsTerm.value)})`;
  }
}
