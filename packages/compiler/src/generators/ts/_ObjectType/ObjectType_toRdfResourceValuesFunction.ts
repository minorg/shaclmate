import type { ObjectType } from "../ObjectType.js";
import { type Code, code } from "../ts-poet-wrapper.js";

export function ObjectType_toRdfResourceValuesFunctionExpression(
  this: ObjectType,
): Code {
  return code`(value, options) => [${this.toRdfResourceFunction.unannotatedUsage}(value, { graph: options.graph, resourceSet: options.resourceSet }).identifier]`;
}

export function ObjectType_toRdfResourceValuesFunctionType(
  this: ObjectType,
): Code {
  return code`${this.reusables.snippets.ToRdfResourceValuesFunction}<${this.propertySubsetExpression((property) => property.kind !== "Discriminant")}, ${this.toRdfResourceValueTypesExpression}>`;
}
