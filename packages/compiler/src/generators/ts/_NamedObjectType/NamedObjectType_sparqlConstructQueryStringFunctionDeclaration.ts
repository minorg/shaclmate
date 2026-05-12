import { Maybe } from "purify-ts";
import type { Imports } from "../Imports.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import type { TsFeature } from "../TsFeature.js";
import { type Code, code } from "../ts-poet-wrapper.js";

export function NamedObjectType_sparqlConstructQueryStringFunctionDeclaration(this: {
  readonly imports: Imports;
  readonly features: ReadonlySet<TsFeature>;
  readonly filterType: Code;
  readonly name: string;
}): Maybe<Code> {
  if (!this.features.has("sparql")) {
    return Maybe.empty();
  }

  return Maybe.of(code`\
export function ${syntheticNamePrefix}sparqlConstructQueryString(parameters: Parameters<typeof ${this.name}.${syntheticNamePrefix}sparqlConstructQuery>[0] & ${this.imports.sparqljs}.GeneratorOptions): string {
  return new ${this.imports.sparqljs}.Generator(parameters).stringify(${this.name}.${syntheticNamePrefix}sparqlConstructQuery(parameters));
}`);
}
