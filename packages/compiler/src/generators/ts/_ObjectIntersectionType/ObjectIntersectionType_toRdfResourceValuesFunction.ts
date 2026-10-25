import type { ObjectIntersectionType } from "../ObjectIntersectionType.js";
import { type Code, code } from "../ts-poet-wrapper.js";

export function ObjectIntersectionType_toRdfResourceValuesFunctionExpression(
  this: ObjectIntersectionType,
): Code {
  return code`(value, options) => [${this.toRdfResourceFunction.unannotatedUsage}(value, { graph: options.graph, resourceSet: options.resourceSet }).identifier]`;
}
