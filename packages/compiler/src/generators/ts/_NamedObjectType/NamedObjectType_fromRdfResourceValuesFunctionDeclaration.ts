import { Maybe } from "purify-ts";
import type { NamedObjectType } from "../NamedObjectType.js";
import { type Code, code } from "../ts-poet-wrapper.js";

export function NamedObjectType_fromRdfResourceValuesFunctionDeclaration(
  this: NamedObjectType,
): Maybe<Code> {
  if (!this.configuration.features.has("Object.fromRdf")) {
    return Maybe.empty();
  }

  return Maybe.of(code`\
export const fromRdfResourceValues: ${this.reusables.snippets.FromRdfResourceValuesFunction}<${this.name}> = (values, options) => 
  values.chain(
    values => values.chainMap(
      value => value.toResource().chain(resource => ${this.name}.fromRdfResource(resource, options))
    )
  );`);
}
