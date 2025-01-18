import { Maybe } from "purify-ts";
import { type FunctionDeclarationStructure, StructureKind } from "ts-morph";
import type { ObjectType } from "../ObjectType.js";

export function jsonSchemaFunctionDeclaration(
  this: ObjectType,
): Maybe<FunctionDeclarationStructure> {
  if (!this.features.has("jsonSchema")) {
    return Maybe.empty();
  }

  if (this.extern) {
    return Maybe.empty();
  }

  return Maybe.of({
    isExported: true,
    kind: StructureKind.Function,
    name: "jsonSchema",
    statements: [
      `return zodToJsonSchema(${this.jsonZodSchemaFunctionName}());`,
    ],
  });
}
