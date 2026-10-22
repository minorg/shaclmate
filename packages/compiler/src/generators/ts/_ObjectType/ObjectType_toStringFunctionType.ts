import type { ObjectType } from "../ObjectType.js";
import { type Code, code, joinCode, literalOf } from "../ts-poet-wrapper.js";

export function ObjectType_toStringFunctionType(this: ObjectType): Code {
  const omitPropertyNames: string[] = [];
  for (const property of this.properties) {
    if (
      property
        .toStringInitializer({ variables: { object: code`object` } })
        .isNothing()
    ) {
      omitPropertyNames.push(property.name);
    }
  }
  if (omitPropertyNames.length === 0) {
    return code`${this.reusables.snippets.ToStringFunction}<${this.expression}>`;
  }

  return code`${this.reusables.snippets.ToStringFunction}<Omit<${this.expression}, ${joinCode(
    omitPropertyNames.map((propertyName) => code`${literalOf(propertyName)}`),
    { on: "|" },
  )}>`;
}
