import { Maybe } from "purify-ts";
import type { NamedObjectType } from "../NamedObjectType.js";
import { type Code, code, joinCode } from "../ts-poet-wrapper.js";

export function NamedObjectType_filterFunctionDeclaration(
  this: NamedObjectType,
): Maybe<Code> {
  if (!this.configuration.features.has("Object.filter")) {
    return Maybe.empty();
  }

  const statements: Code[] = [];
  for (const parentObjectType of this.parentObjectTypes) {
    statements.push(
      code`if (!${parentObjectType.filterFunction}(filter, value)) { return false; }`,
    );
  }

  if (this.properties.length > 0) {
    for (const property of this.properties) {
      property.filterProperty.ifJust(({ name }) => {
        statements.push(
          code`if (filter.${name} !== undefined && !${property.type.filterFunction}(filter.${name}, ${property.accessExpression({ variables: { object: code`value` } })})) { return false; }`,
        );
      });
    }
  }

  statements.push(code`return true;`);

  return Maybe.of(code`\
export function filter(filter: ${this.filterType}, value: ${this.name}): boolean {
  ${joinCode(statements)}
}`);
}
