import type { ObjectType } from "../ObjectType.js";
import { type Code, code } from "../ts-poet-wrapper.js";
import { ObjectType_toRdfResourceFunctionExpression } from "./ObjectType_toRdfResourceFunctionExpression.js";

export function ObjectType_toRdfResourceValuesFunctionExpression(
  this: ObjectType,
): Code {
  return code`${this.reusables.snippets.wrap_ToRdfResourceFunction}<${this.identifierType.expression}, ${this.expression}>(${ObjectType_toRdfResourceFunctionExpression.call(this)})`;
}
