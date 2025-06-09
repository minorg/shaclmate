import { Maybe } from "purify-ts";
import { StructureKind, type VariableStatementStructure } from "ts-morph";
import type { TsFeature } from "../../../enums/TsFeature.js";
import { objectInitializer } from "../objectInitializer.js";

export function sparqlVariableStatement(this: {
  extern: boolean;
  features: Set<TsFeature>;
}): Maybe<VariableStatementStructure> {
  if (!this.features.has("sparql")) {
    return Maybe.empty();
  }

  if (this.extern) {
    return Maybe.empty();
  }

  return Maybe.of({
    kind: StructureKind.VariableStatement,
    declarations: [
      {
        initializer: objectInitializer({
          constructQuery: "sparqlConstructQuery",
          constructQueryString: "sparqlConstructQueryString",
          constructTemplateTriples: "sparqlConstructTemplateTriples",
          wherePatterns: "sparqlWherePatterns",
        }),
        name: "Sparql",
      },
    ],
    isExported: true,
  });
}
