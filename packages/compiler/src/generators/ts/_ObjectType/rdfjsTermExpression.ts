import type { BlankNode, Literal, NamedNode, Variable } from "@rdfjs/types";
import { xsd } from "@tpluscode/rdf-ns-builders";
import { logger } from "../../../logger.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";

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
      if (rdfjsTerm.datatype.value.startsWith(xsd[""].value)) {
        const xsdName = rdfjsTerm.datatype.value.substring(
          xsd[""].value.length,
        );
        switch (xsdName) {
          case "boolean":
          case "date":
          case "dateTime":
          case "integer":
            return `${dataFactoryVariable}.literal("${rdfjsTerm.value}", ${syntheticNamePrefix}RdfVocabularies.xsd.${xsdName})`;
          default:
            logger.warn(
              "unrecognized XSD literal datatype: %s",
              rdfjsTerm.datatype.value,
            );
        }
      }
      return `${dataFactoryVariable}.literal("${rdfjsTerm.value}", ${dataFactoryVariable}.namedNode("${rdfjsTerm.datatype.value}"))`;
    case "NamedNode":
      return `${dataFactoryVariable}.namedNode("${rdfjsTerm.value}")`;
    case "Variable":
      return `${dataFactoryVariable}.variable!("${rdfjsTerm.value}")`;
  }
}
