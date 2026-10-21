import type { ObjectType } from "../ObjectType.js";
import { type Code, code } from "../ts-poet-wrapper.js";

export function ObjectType_toRdfResourceValuesFunctionExpression(
  this: ObjectType,
): Code {
  return code`(value, options) => [${this.toRdfResourceFunction}(value, { graph: options.graph, resourceSet: options.resourceSet }).identifier]`;
}
