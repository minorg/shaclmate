import { Maybe } from "purify-ts";
import { imports } from "../imports.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import type { TsFeature } from "../TsFeature.js";
import { type Code, code } from "../ts-poet-wrapper.js";

export function NamedObjectType_sparqlConstructQueryStringFunctionDeclaration(this: {
  readonly features: ReadonlySet<TsFeature>;
  readonly filterType: Code;
  readonly name: string;
}): Maybe<Code> {
  if (!this.features.has("sparql")) {
    return Maybe.empty();
  }

  return Maybe.of(code`\
export function ${syntheticNamePrefix}sparqlConstructQueryString(parameters: Parameters<typeof ${this.name}.${syntheticNamePrefix}sparqlConstructQuery>[0] & ${imports.sparqljs}.GeneratorOptions): string {
  return new ${imports.sparqljs}.Generator(parameters).stringify(${this.name}.${syntheticNamePrefix}sparqlConstructQuery(parameters));
}`);
}
