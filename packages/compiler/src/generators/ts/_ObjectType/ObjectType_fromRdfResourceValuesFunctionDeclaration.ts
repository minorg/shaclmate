import { Maybe } from "purify-ts";
import type { ObjectType } from "../ObjectType.js";
import { type Code, code } from "../ts-poet-wrapper.js";

export function ObjectType_fromRdfResourceValuesFunctionDeclaration(
  this: ObjectType,
): Maybe<Code> {
  if (!this.configuration.features.has("Object.fromRdf")) {
    return Maybe.empty();
  }

  return Maybe.of(code`\
export const fromRdfResourceValues: ${this.reusables.snippets.FromRdfResourceValuesFunction}<${this.name.unsafeCoerce()}, ${this.schemaType}> = (values, options) => 
  values.chain(
    values => values.chainMap(
      value => value.toResource().chain(resource => ${this.name.unsafeCoerce()}.fromRdfResource(resource, options))
    )
  );`);
}
