import type { ObjectType } from "../ObjectType.js";
import { type Code, code, joinCode } from "../ts-poet-wrapper.js";

const variables = {
  filter: code`filter`,
  object: code`value`,
};

export function ObjectType_filterFunctionExpression(this: ObjectType): Code {
  const statements: Code[] = [];
  for (const property of this.properties) {
    property
      .filterExpression({
        variables,
      })
      .ifJust((filterExpression) => {
        const filterProperty = property.filterProperty.unsafeCoerce();
        statements.push(
          code`if (${variables.filter}.${filterProperty.name} !== undefined && !${filterExpression}) { return false; }`,
        );
      });
  }
  statements.push(code`return true;`);

  return code`((filter, value) => { ${joinCode(statements)} })`;
}
