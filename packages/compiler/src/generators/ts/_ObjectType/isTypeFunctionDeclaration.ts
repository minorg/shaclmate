import { Maybe } from "purify-ts";
import { type FunctionDeclarationStructure, StructureKind } from "ts-morph";
import type { ObjectType } from "../ObjectType.js";

export function isTypeFunctionDeclaration(
  this: ObjectType,
): Maybe<FunctionDeclarationStructure> {
  const parameterObjectType = this.rootAncestorObjectType.extract();
  if (!parameterObjectType) {
    return Maybe.empty();
  }

  return Maybe.of({
    isExported: true,
    kind: StructureKind.Function,
    name: `is${this.name}`,
    parameters: [
      {
        name: "object",
        type: parameterObjectType.name,
      },
    ],
    returnType: `object is ${this.name}`,
    statements: [
      `switch (object.${this._discriminantProperty.name}) { ${this._discriminantProperty.descendantValues
        .concat(this._discriminantProperty.ownValues)
        .map((value) => `case "${value}":`)
        .join("\n")} return true; default: return false; }`,
    ],
  });
}
