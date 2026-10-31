import type { ObjectIntersectionType } from "../ObjectIntersectionType.js";
import { type Code, code } from "../ts-poet-wrapper.js";

export function ObjectIntersectionType_fromRdfResourceValuesFunctionExpression(
  this: ObjectIntersectionType,
): Code {
  return code`(values, options) => values.chainMap(value => value.toResource().chain(resource => ${this.fromRdfResourceFunction.annotatedUsage}(resource, options)))`;
}
