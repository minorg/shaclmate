import { type FunctionDeclarationStructure, StructureKind } from "ts-morph";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";

export function sparqlConstructQueryStringFunctionDeclaration(this: {
  readonly filterType: string;
  readonly staticModuleName: string;
}): FunctionDeclarationStructure {
  return {
    isExported: true,
    kind: StructureKind.Function,
    name: `${syntheticNamePrefix}sparqlConstructQueryString`,
    parameters: [
      {
        hasQuestionToken: true,
        name: "parameters",
        type: `{ filter?: ${this.filterType}; ignoreRdfType?: boolean; preferredLanguages?: readonly string[]; subject?: sparqljs.Triple["subject"]; variablePrefix?: string; } & Omit<sparqljs.ConstructQuery, "prefixes" | "queryType" | "type"> & sparqljs.GeneratorOptions`,
      },
    ],
    returnType: "string",
    statements: [
      `return new sparqljs.Generator(parameters).stringify(${this.staticModuleName}.${syntheticNamePrefix}sparqlConstructQuery(parameters));`,
    ],
  };
}
