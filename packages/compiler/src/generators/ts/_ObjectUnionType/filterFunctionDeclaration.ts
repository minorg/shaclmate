import { type Code, code, joinCode } from "ts-poet";
import type { ObjectUnionType } from "../ObjectUnionType.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";

export function filterFunctionDeclaration(this: ObjectUnionType): Code {
  return code`\
export function ${syntheticNamePrefix}filter(filter: ${this.filterType}, value: ${this.name}): boolean {
${joinCode([
  code`\
if (typeof filter.${syntheticNamePrefix}identifier !== "undefined" && !${this.identifierType.filterFunction}(filter.${syntheticNamePrefix}identifier, value.${syntheticNamePrefix}identifier)) {
  return false;
}`,
  ...this.memberTypes.map(
    (memberType) => code`\
if (${memberType.staticModuleName}.is${memberType.name}(value) && filter.on?.${memberType.name} && !${memberType.filterFunction}(filter.on.${memberType.name}, value as ${memberType.name})) {
  return false;
}`,
  ),
  code`return true;`,
])}
}`;
}
