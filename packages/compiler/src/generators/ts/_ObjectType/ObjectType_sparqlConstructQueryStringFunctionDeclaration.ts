import { Maybe } from "purify-ts";
import type { Reusables } from "../Reusables.js";
import type { TsGenerator } from "../TsGenerator.js";
import { type Code, code } from "../ts-poet-wrapper.js";

export function ObjectType_sparqlConstructQueryStringFunctionDeclaration(this: {
  readonly alias: string;
  readonly configuration: TsGenerator.Configuration;
  readonly filterType: Code;
  readonly reusables: Reusables;
}): Maybe<Code> {
  if (!this.configuration.features.has("Object.SPARQL")) {
    return Maybe.empty();
  }

  return Maybe.of(code`\
export function sparqlConstructQueryString(parameters: Parameters<typeof ${this.alias}.sparqlConstructQuery>[0] & ${this.reusables.imports.sparqljs}.GeneratorOptions): string {
  return new ${this.reusables.imports.sparqljs}.Generator(parameters).stringify(${this.alias}.sparqlConstructQuery(parameters));
}`);
}
