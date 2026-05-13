import type { NamedObjectType } from "../NamedObjectType.js";
import { type Code, code, joinCode } from "../ts-poet-wrapper.js";

export function NamedObjectType_schemaVariableStatement(
  this: NamedObjectType,
): Code {
  return code`\
export const schema = { properties: { ${joinCode(
    this.parentObjectTypes
      .map(
        (parentObjectType) =>
          code`...${parentObjectType.name}.schema.properties`,
      )
      .concat(
        this.properties.map(
          (property) => code`${property.name}: ${property.schema}`,
        ),
      ),
    { on: ", " },
  )} } } as const;`;
}
