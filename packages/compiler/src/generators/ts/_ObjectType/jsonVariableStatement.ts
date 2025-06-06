import { Maybe } from "purify-ts";
import { StructureKind, type VariableStatementStructure } from "ts-morph";
import type { ObjectType } from "../ObjectType.js";
import { objectInitializer } from "../objectInitializer.js";

export function jsonVariableStatement(
  this: ObjectType,
): Maybe<VariableStatementStructure> {
  if (!this.features.has("json")) {
    return Maybe.empty();
  }

  if (this.extern) {
    return Maybe.empty();
  }

  const initializer: Record<string, string> = {
    parse: "jsonParse",
    parseProperties: "jsonParseProperties",
    schema: "jsonSchema",
    uiSchema: "jsonUiSchema",
    zodSchema: "jsonZodSchema",
  };
  if (this.declarationType === "interface") {
    initializer["unparse"] = "jsonUnparse";
  }

  return Maybe.of({
    kind: StructureKind.VariableStatement,
    declarations: [
      {
        name: "Json",
        initializer: objectInitializer(initializer),
      },
    ],
    isExported: true,
  });
}
