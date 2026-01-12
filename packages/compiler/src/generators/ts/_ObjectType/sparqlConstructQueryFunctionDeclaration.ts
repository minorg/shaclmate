import { type FunctionDeclarationStructure, StructureKind } from "ts-morph";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import type { Type } from "../Type.js";

export function sparqlConstructQueryFunctionDeclaration(this: {
  readonly filterType: Type.CompositeFilterTypeReference;
  readonly staticModuleName: string;
}): FunctionDeclarationStructure {
  return {
    kind: StructureKind.Function,
    isExported: true,
    name: `${syntheticNamePrefix}sparqlConstructQuery`,
    parameters: [
      {
        hasQuestionToken: true,
        name: "parameters",
        type: `{ filter?: ${this.filterType.name}; ignoreRdfType?: boolean; prefixes?: { [prefix: string]: string }; preferredLanguages?: readonly string[]; subject?: sparqljs.Triple["subject"]; } & Omit<sparqljs.ConstructQuery, "prefixes" | "queryType" | "type">`,
      },
    ],
    returnType: "sparqljs.ConstructQuery",
    statements: [
      "const { filter, ignoreRdfType, preferredLanguages, subject, ...queryParameters } = parameters ?? {}",
      `return { ...queryParameters, prefixes: parameters?.prefixes ?? {}, queryType: "CONSTRUCT", template: (queryParameters.template ?? []).concat(${this.staticModuleName}.${syntheticNamePrefix}sparqlConstructTriples({ ignoreRdfType, subject })), type: "query", where: (queryParameters.where ?? []).concat(${this.staticModuleName}.${syntheticNamePrefix}sparqlWherePatterns({ filter, ignoreRdfType, preferredLanguages, subject })) };`,
    ],
  };
}
