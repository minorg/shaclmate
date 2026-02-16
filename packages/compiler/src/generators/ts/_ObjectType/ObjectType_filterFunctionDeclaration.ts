import type { ObjectType } from "../ObjectType.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { type Code, code, joinCode } from "../ts-poet-wrapper.js";

export function ObjectType_filterFunctionDeclaration(this: ObjectType): Code {
  const statements: Code[] = [];
  for (const parentObjectType of this.parentObjectTypes) {
    statements.push(
      code`if (!${parentObjectType.filterFunction}(filter, value)) { return false; }`,
    );
  }

  if (this.ownProperties.length > 0) {
    for (const ownProperty of this.ownProperties) {
      ownProperty.filterProperty.ifJust(({ name }) => {
        statements.push(
          code`if (typeof filter.${name} !== "undefined" && !${ownProperty.type.filterFunction}(filter.${name}, value.${ownProperty.name})) { return false; }`,
        );
      });
    }
  }

  statements.push(code`return true;`);

  return code`\
export function ${syntheticNamePrefix}filter(filter: ${this.filterType}, value: ${this.name}): boolean {
  ${joinCode(statements)}
}`;
}
