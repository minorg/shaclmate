import type { BlankNode, Literal, NamedNode, Variable } from "@rdfjs/types";
import { xsd } from "@tpluscode/rdf-ns-builders";

export function rdfjsTermExpression({
  dataFactoryVariable,
  rdfjsTerm,
}: {
  dataFactoryVariable: string;
  rdfjsTerm:
    | Omit<BlankNode, "equals">
    | Omit<Literal, "equals">
    | Omit<NamedNode, "equals">
    | Omit<Variable, "equals">;
}): string {
  switch (rdfjsTerm.termType) {
    case "BlankNode":
      return `${dataFactoryVariable}.blankNode("${rdfjsTerm.value}")`;
    case "Literal":
      if (rdfjsTerm.datatype.equals(xsd.string)) {
        if (rdfjsTerm.language.length === 0) {
          return `${dataFactoryVariable}.literal("${rdfjsTerm.value}")`;
        }
        return `${dataFactoryVariable}.literal("${rdfjsTerm.value}", "${rdfjsTerm.language}")`;
      }
      return `${dataFactoryVariable}.literal("${rdfjsTerm.value}", ${dataFactoryVariable}.namedNode("${rdfjsTerm.datatype.value}"))`;
    case "NamedNode":
      return `${dataFactoryVariable}.namedNode("${rdfjsTerm.value}")`;
    case "Variable":
      return `${dataFactoryVariable}.variable!("${rdfjsTerm.value}")`;
  }
}
