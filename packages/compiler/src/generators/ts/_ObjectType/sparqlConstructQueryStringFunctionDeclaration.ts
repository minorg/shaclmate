import { type Code, code } from "ts-poet";
import { sharedImports } from "../sharedImports.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";

export function sparqlConstructQueryStringFunctionDeclaration(this: {
  readonly filterType: Code;
  readonly staticModuleName: string;
}): Code {
  return code`\
export function ${syntheticNamePrefix}sparqlConstructQueryString(parameters?: { filter?: ${this.filterType}; ignoreRdfType?: boolean; preferredLanguages?: readonly string[]; subject?: ${sharedImports.sparqljs}.Triple["subject"]; variablePrefix?: string; } & Omit<${sharedImports.sparqljs}.ConstructQuery, "prefixes" | "queryType" | "type"> & ${sharedImports.sparqljs}.GeneratorOptions): string {
  return new ${sharedImports.sparqljs}.Generator(parameters).stringify(${this.staticModuleName}.${syntheticNamePrefix}sparqlConstructQuery(parameters));
}`;
}
