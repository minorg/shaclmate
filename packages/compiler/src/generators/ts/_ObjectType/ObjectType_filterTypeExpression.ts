import type { ObjectType } from "../ObjectType.js";
import { type Code, code, joinCode } from "../ts-poet-wrapper.js";

export function ObjectType_filterTypeExpression(this: ObjectType): Code {
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

  if (members.length > 0) {
    return joinCode(members, { on: " & " });
  }
  return code`object`;
}
