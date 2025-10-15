import { type FunctionDeclarationStructure, StructureKind } from "ts-morph";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";

export function sparqlConstructQueryFunctionDeclaration(this: {
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
        type: '{ ignoreRdfType?: boolean; prefixes?: { [prefix: string]: string }; preferredLanguages?: readonly string[]; subject?: sparqljs.Triple["subject"]; } & Omit<sparqljs.ConstructQuery, "prefixes" | "queryType" | "type">',
      },
    ],
    returnType: "sparqljs.ConstructQuery",
    statements: [
      "const { ignoreRdfType, preferredLanguages, subject, ...queryParameters } = parameters ?? {}",
      `return { ...queryParameters, prefixes: parameters?.prefixes ?? {}, queryType: "CONSTRUCT", template: (queryParameters.template ?? []).concat(${this.staticModuleName}.${syntheticNamePrefix}sparqlConstructTemplateTriples({ ignoreRdfType, subject })), type: "query", where: (queryParameters.where ?? []).concat(${this.staticModuleName}.${syntheticNamePrefix}sparqlWherePatterns({ ignoreRdfType, preferredLanguages, subject })) };`,
    ],
  };
}
