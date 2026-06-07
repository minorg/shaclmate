import type { Reusables } from "../Reusables.js";
import type { TsGenerator } from "../TsGenerator.js";
import { type Code, code } from "../ts-poet-wrapper.js";

export function ObjectType_sparqlConstructQueryStringFunctionDeclaration(this: {
  readonly name: string;
  readonly configuration: TsGenerator.Configuration;
  readonly filterType: Code;
  readonly reusables: Reusables;
}): Code {
  return code`\
export function sparqlConstructQueryString(parameters: Parameters<typeof ${this.name}.sparqlConstructQuery>[0] & ${this.reusables.imports.sparqljs}.GeneratorOptions): string {
  return new ${this.reusables.imports.sparqljs}.Generator(parameters).stringify(${this.name}.sparqlConstructQuery(parameters));
}`;
}
