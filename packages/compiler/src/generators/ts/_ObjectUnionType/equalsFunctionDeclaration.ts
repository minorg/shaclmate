import { Maybe } from "purify-ts";
import { type Code, code, joinCode } from "ts-poet";
import type { ObjectUnionType } from "../ObjectUnionType.js";
import { snippets } from "../snippets.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";

export function equalsFunctionDeclaration(this: ObjectUnionType): Maybe<Code> {
  if (!this.features.has("equals")) {
    return Maybe.empty();
  }

  return Maybe.of(code`\
export function ${syntheticNamePrefix}equals(left: ${this.name}, right: ${this.name}): ${snippets.EqualsResult} {
    return ${syntheticNamePrefix}strictEquals(left.${syntheticNamePrefix}type, right.${syntheticNamePrefix}type).chain(() => {
      ${joinCode(
        this.concreteMemberTypes
          .map((memberType) => {
            let returnExpression: Code;
            switch (memberType.declarationType) {
              case "class":
                returnExpression = code`left.${syntheticNamePrefix}equals(right as unknown as ${memberType.name})`;
                break;
              case "interface":
                returnExpression = code`${memberType.staticModuleName}.${syntheticNamePrefix}equals(left, right as unknown as ${memberType.name})`;
                break;
            }
            return code`if (${memberType.staticModuleName}.is${memberType.name}(left)) { return ${returnExpression}; }`;
          })
          .concat(code`return ${snippets.EqualsResult}.Equal;`),
      )}
      });
}`);
}
