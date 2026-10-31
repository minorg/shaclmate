import type { ObjectType } from "../ObjectType.js";
import { type Code, code } from "../ts-poet-wrapper.js";

export function ObjectType_fromRdfResourceValuesFunctionExpression(
  this: ObjectType,
): Code {
  return code`(values, options) => values.chainMap(value => value.toResource().chain(resource => ${this.fromRdfResourceFunction.annotatedUsage}(resource, options)))`;
}

export function ObjectType_fromRdfResourceValuesFunctionType(
  this: ObjectType,
): Code {
  return code`${this.reusables.snippets.FromRdfResourceValuesFunction}<${this.discriminatedExpression}, ${this.schemaType}>`;
}
