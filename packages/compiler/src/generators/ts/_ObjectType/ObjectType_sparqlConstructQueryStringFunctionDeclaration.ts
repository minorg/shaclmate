import { imports } from "../imports.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { type Code, code } from "../ts-poet-wrapper.js";

export function ObjectType_sparqlConstructQueryStringFunctionDeclaration(this: {
  readonly filterType: Code;
  readonly staticModuleName: string;
}): Code {
  return code`\
export function ${syntheticNamePrefix}sparqlConstructQueryString(parameters?: { filter?: ${this.filterType}; ignoreRdfType?: boolean; preferredLanguages?: readonly string[]; subject?: ${imports.sparqljs}.Triple["subject"]; variablePrefix?: string; } & Omit<${imports.sparqljs}.ConstructQuery, "prefixes" | "queryType" | "type"> & ${imports.sparqljs}.GeneratorOptions): string {
  return new ${imports.sparqljs}.Generator(parameters).stringify(${this.staticModuleName}.${syntheticNamePrefix}sparqlConstructQuery(parameters));
}`;
}
