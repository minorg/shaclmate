import type { NamedObjectType } from "../NamedObjectType.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { type Code, code, joinCode } from "../ts-poet-wrapper.js";

export function NamedObjectType_schemaVariableStatement(
  this: NamedObjectType,
): Code {
  return code`\
export const ${syntheticNamePrefix}schema = { properties: { ${joinCode(
    this.parentObjectTypes
      .map(
        (parentObjectType) =>
          code`...${parentObjectType.staticModuleName}.${syntheticNamePrefix}schema.properties`,
      )
      .concat(
        this.ownProperties.map(
          (property) => code`${property.name}: ${property.schema}`,
        ),
      ),
    { on: ", " },
  )} } } as const;`;
}
