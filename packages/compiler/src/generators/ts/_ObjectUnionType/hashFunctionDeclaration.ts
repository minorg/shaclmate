import { Maybe } from "purify-ts";
import { type Code, code, joinCode } from "ts-poet";
import type { ObjectUnionType } from "../ObjectUnionType.js";
import { sharedSnippets } from "../sharedSnippets.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";

const hasherVariable = code`_hasher`;

export function hashFunctionDeclaration(this: ObjectUnionType): Maybe<Code> {
  if (!this.features.has("hash")) {
    return Maybe.empty();
  }

  return Maybe.of(code`\
export function ${syntheticNamePrefix}hash<HasherT extends ${sharedSnippets.Hasher}>(${this.thisVariable}: ${this.name}, ${hasherVariable}: HasherT): HasherT {
${joinCode(
  this.concreteMemberTypes
    .map((memberType) => {
      let returnExpression: Code;
      switch (memberType.declarationType) {
        case "class":
          returnExpression = code`${this.thisVariable}.${syntheticNamePrefix}hash(${hasherVariable})`;
          break;
        case "interface":
          returnExpression = code`${memberType.staticModuleName}.${syntheticNamePrefix}hash(${this.thisVariable}, ${hasherVariable})`;
          break;
      }
      return code`if (${memberType.staticModuleName}.is${memberType.name}(${this.thisVariable})) { return ${returnExpression}; }`;
    })
    .concat(code`throw new Error("unrecognized type");`),
)}
}`);
}
