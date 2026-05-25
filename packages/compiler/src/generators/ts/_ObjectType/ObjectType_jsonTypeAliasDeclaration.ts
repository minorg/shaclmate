import { Maybe } from "purify-ts";
import type { NamedObjectType } from "../NamedObjectType.js";
import { type Code, code, joinCode } from "../ts-poet-wrapper.js";

export function ObjectType_jsonTypeAliasDeclaration(
  this: NamedObjectType,
): Maybe<Code> {
  if (!this.configuration.features.has("Object.JSON.type")) {
    return Maybe.empty();
  }

  const members: Code[] = [];
  if (this.properties.length > 0) {
    members.push(
      code`{ ${joinCode(
        this.properties.flatMap((property) => property.jsonSignature.toList()),
        { on: ";" },
      )} }`,
    );
  }
  for (const parentObjectType of this.parentObjectTypes) {
    members.push(code`${parentObjectType.jsonType().name}`);
  }

  return Maybe.of(
    code`export type Json = ${members.length > 0 ? joinCode(members, { on: " & " }) : "object"};`,
  );
}
