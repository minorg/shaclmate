import { Maybe } from "purify-ts";
import { StructureKind, type VariableStatementStructure } from "ts-morph";
import type { ObjectType } from "../ObjectType.js";

export function jsonVariableStatement(
  this: ObjectType,
): Maybe<VariableStatementStructure> {
  if (!this.features.has("json")) {
    return Maybe.empty();
  }

  if (this.extern) {
    return Maybe.empty();
  }

  return Maybe.of({
    kind: StructureKind.VariableStatement,
    declarations: [
      {
        name: "Json",
        initializer:
          "{ parse: jsonParse, parseProperties: jsonParseProperties, schema: jsonSchema, uiSchema: jsonUiSchema, unparse: jsonUnparse, zodSchema: jsonZodSchema }",
      },
    ],
    isExported: true,
  });
}
