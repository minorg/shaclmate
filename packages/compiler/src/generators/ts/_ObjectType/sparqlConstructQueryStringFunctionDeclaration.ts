import { type FunctionDeclarationStructure, StructureKind } from "ts-morph";

export function sparqlConstructQueryStringFunctionDeclaration(this: {
  readonly staticModuleName: string;
}): FunctionDeclarationStructure {
  return {
    isExported: true,
    kind: StructureKind.Function,
    name: "sparqlConstructQueryString",
    parameters: [
      {
        hasQuestionToken: true,
        name: "parameters",
        type: '{ ignoreRdfType?: boolean; subject?: sparqljs.Triple["subject"]; variablePrefix?: string; } & Omit<sparqljs.ConstructQuery, "prefixes" | "queryType" | "type"> & sparqljs.GeneratorOptions',
      },
    ],
    returnType: "string",
    statements: [
      `return new sparqljs.Generator(parameters).stringify(${this.staticModuleName}.sparqlConstructQuery(parameters));`,
    ],
  };
}
