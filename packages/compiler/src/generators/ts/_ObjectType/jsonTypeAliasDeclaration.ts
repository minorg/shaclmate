import { Maybe } from "purify-ts";
import { type Code, code, joinCode } from "ts-poet";
import type { ObjectType } from "../ObjectType.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";

export function jsonTypeAliasDeclaration(this: ObjectType): Maybe<Code> {
  if (!this.features.has("json")) {
    return Maybe.empty();
  }

  const members: Code[] = [];
  if (this.ownProperties.length > 0) {
    members.push(
      code`{ ${joinCode(
        this.ownProperties.flatMap((property) =>
          property.jsonSignature.toList(),
        ),
        { on: ";" },
      )} }`,
    );
  }
  for (const parentObjectType of this.parentObjectTypes) {
    members.push(code`${parentObjectType.jsonType().name}`);
  }

  return Maybe.of(
    code`export type ${syntheticNamePrefix}Json = ${members.length > 0 ? joinCode(members, { on: " & " }) : "object"}`,
  );
}
