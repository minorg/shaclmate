import { Maybe } from "purify-ts";
import type { Reusables } from "../Reusables.js";
import type { TsFeature } from "../TsFeature.js";
import { type Code, code } from "../ts-poet-wrapper.js";

export function NamedObjectType_sparqlConstructQueryStringFunctionDeclaration(this: {
  readonly features: ReadonlySet<TsFeature>;
  readonly filterType: Code;
  readonly name: string;
  readonly reusables: Reusables;
}): Maybe<Code> {
  if (!this.features.has("sparql")) {
    return Maybe.empty();
  }

  return Maybe.of(code`\
export function sparqlConstructQueryString(parameters: Parameters<typeof ${this.name}.sparqlConstructQuery>[0] & ${this.reusables.imports.sparqljs}.GeneratorOptions): string {
  return new ${this.reusables.imports.sparqljs}.Generator(parameters).stringify(${this.name}.sparqlConstructQuery(parameters));
}`);
}
