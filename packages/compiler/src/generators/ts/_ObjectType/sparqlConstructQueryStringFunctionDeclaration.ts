import { type Code, code } from "ts-poet";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";

export function sparqlConstructQueryStringFunctionDeclaration(this: {
  readonly filterType: Code;
  readonly staticModuleName: string;
}): Code {
  return code`\
export function ${syntheticNamePrefix}sparqlConstructQueryString(parameters?: { filter?: ${this.filterType}; ignoreRdfType?: boolean; preferredLanguages?: readonly string[]; subject?: sparqljs.Triple["subject"]; variablePrefix?: string; } & Omit<sparqljs.ConstructQuery, "prefixes" | "queryType" | "type"> & sparqljs.GeneratorOptions): string {
  return new sparqljs.Generator(parameters).stringify(${this.staticModuleName}.${syntheticNamePrefix}sparqlConstructQuery(parameters));
}`;
}
