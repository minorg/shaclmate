import { type Code, code, joinCode } from "ts-poet";
import type { ObjectType } from "../ObjectType.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";

export function filterTypeDeclaration(this: ObjectType): Code {
  const members: Code[] = [];
  if (this.properties.length > 0) {
    const filterProperties: Record<string, Code> = {};
    for (const property of this.properties) {
      property.filterProperty.ifJust(({ name, type }) => {
        filterProperties[name] = type;
      });
    }
    if (Object.entries(filterProperties).length > 0) {
      members.push(
        code`{ ${joinCode(
          Object.entries(filterProperties).map(
            ([name, type]) => code`readonly ${name}?: ${type}`,
          ),
          { on: ";" },
        )} }`,
      );
    }
  }
  for (const parentObjectType of this.parentObjectTypes) {
    members.push(
      code`${parentObjectType.staticModuleName}.${syntheticNamePrefix}Filter`,
    );
  }

  return code`\
export type ${syntheticNamePrefix}Filter = ${members.length > 0 ? joinCode(members, { on: " & " }) : "object"};`;
}
