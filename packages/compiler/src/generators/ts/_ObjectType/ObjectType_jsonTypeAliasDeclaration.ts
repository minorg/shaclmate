import { Maybe } from "purify-ts";
import type { ObjectType } from "../ObjectType.js";
import { type Code, code, joinCode } from "../ts-poet-wrapper.js";

export function ObjectType_jsonTypeAliasDeclaration(
  this: ObjectType,
): Maybe<Code> {
  if (!this.configuration.features.has("Object.JSON.type")) {
    return Maybe.empty();
  }

  return Maybe.of(
    code`export type Json = { ${joinCode(
      this.properties.flatMap((property) => property.jsonSignature.toList()),
      { on: ";" },
    )} }`,
  );
}
