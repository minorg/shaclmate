import type { BlankNode, Literal, NamedNode, Variable } from "@rdfjs/types";
import type { Logger } from "@rdfx/logger";
import { xsd } from "@tpluscode/rdf-ns-builders";
import type { Imports } from "./Imports.js";
import type { Snippets } from "./Snippets.js";
import { type Code, code, literalOf } from "./ts-poet-wrapper.js";

export function rdfjsTermExpression(
  this: { imports: Imports; logger: Logger; snippets: Snippets },
  rdfjsTerm: BlankNode | Literal | NamedNode | Variable,
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
      return this.snippets
        .rdfjsNamedNode(rdfjsTerm)
        .map((snippet) => code`${snippet}`)
        .orDefault(
          code`${this.imports.dataFactory}.namedNode(${literalOf(rdfjsTerm.value)})`,
        );
    }
    case "Variable":
      return code`${this.imports.dataFactory}.variable!(${literalOf(rdfjsTerm.value)})`;
  }
}
