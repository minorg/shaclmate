import { Maybe } from "purify-ts";
import type { ObjectType } from "../ObjectType.js";
import { type Code, code, joinCode } from "../ts-poet-wrapper.js";

export function ObjectType_filterTypeDeclaration(
  this: ObjectType,
): Maybe<Code> {
  if (!this.configuration.features.has("Object.filter")) {
    return Maybe.empty();
  }

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
    members.push(code`${parentObjectType.name}.Filter`);
  }

  return Maybe.of(code`\
export type Filter = ${members.length > 0 ? joinCode(members, { on: " & " }) : "object"};`);
}
