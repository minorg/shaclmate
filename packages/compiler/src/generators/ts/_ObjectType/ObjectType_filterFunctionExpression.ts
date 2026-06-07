import type { ObjectType } from "../ObjectType.js";
import { type Code, code, joinCode } from "../ts-poet-wrapper.js";

export function ObjectType_filterFunctionExpression(this: ObjectType): Code {
  const statements: Code[] = [];
  for (const property of this.properties) {
    property.filterProperty.ifJust(({ name }) => {
      statements.push(
        code`if (filter.${name} !== undefined && !${property.type.filterFunction}(filter.${name}, ${property.accessExpression({ variables: { object: code`value` } })})) { return false; }`,
      );
    });
  }
  statements.push(code`return true;`);

  return code`((filter, value) => { ${joinCode(statements)} })`;
}
