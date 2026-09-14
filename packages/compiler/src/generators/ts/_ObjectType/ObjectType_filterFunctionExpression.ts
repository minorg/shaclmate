import { invariant } from "ts-invariant";
import type { ObjectType } from "../ObjectType.js";
import { type Code, code, joinCode } from "../ts-poet-wrapper.js";

const variables = {
  filter: code`filter`,
  object: code`object`,
};

export function ObjectType_filterFunctionExpression(this: ObjectType): Code {
  const statements: Code[] = [];
  for (const property of this.properties) {
    const filterExpression = property.filterExpression({ variables }).extract();
    const filterProperty = property.filterProperty.extract();
    if (filterExpression && filterProperty) {
      statements.push(
        code`if (${variables.filter}.${filterProperty.name} !== undefined && !${filterExpression}) { return false; }`,
      );
    } else {
      invariant(!filterExpression && !filterProperty);
    }
  }
  statements.push(code`return true;`);

  return code`((filter, value) => { ${joinCode(statements)} })`;
}
