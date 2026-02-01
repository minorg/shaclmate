import { Maybe } from "purify-ts";
import { type FunctionDeclarationStructure, StructureKind } from "ts-morph";
import type { ObjectUnionType } from "../ObjectUnionType.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";

export function isTypeFunctionDeclaration(
  this: ObjectUnionType,
): Maybe<FunctionDeclarationStructure> {
  if (this.name === `${syntheticNamePrefix}Object`) {
    return Maybe.empty();
  }

  return Maybe.of({
    isExported: true,
    kind: StructureKind.Function,
    name: `is${this.name}`,
    parameters: [
      {
        name: "object",
        type: `${syntheticNamePrefix}Object`,
      },
    ],
    returnType: `object is ${this.name}`,
    statements: [
      `return ${this.memberTypes.map((memberType) => `${memberType.staticModuleName}.is${memberType.name}(object)`).join(" || ")};`,
    ],
  });
}
