import { type FunctionDeclarationStructure, StructureKind } from "ts-morph";

export function sparqlConstructQueryFunctionDeclaration(this: {
  readonly staticModuleName: string;
}): FunctionDeclarationStructure {
  return {
    isExported: true,
    kind: StructureKind.Function,
    name: "sparqlConstructQuery",
    parameters: [
      {
        hasQuestionToken: true,
        name: "parameters",
        type: '{ ignoreRdfType?: boolean; prefixes?: { [prefix: string]: string }; subject?: sparqljs.Triple["subject"]; } & Omit<sparqljs.ConstructQuery, "prefixes" | "queryType" | "type">',
      },
    ],
    returnType: "sparqljs.ConstructQuery",
    statements: [
      "const { ignoreRdfType, subject, ...queryParameters } = parameters ?? {}",
      `return { ...queryParameters, prefixes: parameters?.prefixes ?? {}, queryType: "CONSTRUCT", template: (queryParameters.template ?? []).concat(${this.staticModuleName}.sparqlConstructTemplateTriples({ ignoreRdfType, subject })), type: "query", where: (queryParameters.where ?? []).concat(${this.staticModuleName}.sparqlWherePatterns({ ignoreRdfType, subject })) };`,
    ],
  };
}
