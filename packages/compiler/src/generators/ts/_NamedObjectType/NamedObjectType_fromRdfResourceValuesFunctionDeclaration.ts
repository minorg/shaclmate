import { Maybe } from "purify-ts";
import type { NamedObjectType } from "../NamedObjectType.js";
import { snippets } from "../snippets.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { type Code, code } from "../ts-poet-wrapper.js";

export function NamedObjectType_fromRdfResourceValuesFunctionDeclaration(
  this: NamedObjectType,
): Maybe<Code> {
  if (!this.features.has("rdf")) {
    return Maybe.empty();
  }

  if (this.abstract) {
    return Maybe.empty();
  }

  return Maybe.of(code`\
export const ${syntheticNamePrefix}fromRdfResourceValues: ${snippets.FromRdfResourceValuesFunction}<${this.name}> = (values, options) => 
  values.chain(
    values => values.chainMap(
      value => value.toResource().chain(resource => ${this.staticModuleName}.${syntheticNamePrefix}fromRdfResource(resource, options))
    )
  );`);
}
