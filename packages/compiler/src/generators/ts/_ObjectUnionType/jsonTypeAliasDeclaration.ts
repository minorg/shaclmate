import { Maybe } from "purify-ts";
import type { ObjectUnionType } from "../ObjectUnionType.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { type Code, code, joinCode } from "../ts-poet-wrapper.js";

export function jsonTypeAliasDeclaration(this: ObjectUnionType): Maybe<Code> {
  if (!this.features.has("json")) {
    return Maybe.empty();
  }

  return Maybe.of(
    code`export type ${syntheticNamePrefix}Json = ${joinCode(
      this.concreteMemberTypes.map(
        (memberType) => code`${memberType.jsonType().name}`,
      ),
      { on: " | " },
    )};`,
  );
}
