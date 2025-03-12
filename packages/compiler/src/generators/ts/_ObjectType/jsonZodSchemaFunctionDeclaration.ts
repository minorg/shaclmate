import { Maybe } from "purify-ts";
import { type FunctionDeclarationStructure, StructureKind } from "ts-morph";
import type { ObjectType } from "../ObjectType.js";

export function jsonZodSchemaFunctionDeclaration(
  this: ObjectType,
): Maybe<FunctionDeclarationStructure> {
  if (!this.features.has("fromJson") && !this.features.has("jsonSchema")) {
    return Maybe.empty();
  }

  if (this.extern) {
    return Maybe.empty();
  }

  const variables = { zod: "zod" };
  const mergeZodObjectSchemas: string[] = [];
  for (const parentObjectType of this.parentObjectTypes) {
    mergeZodObjectSchemas.push(
      `${parentObjectType.jsonZodSchema({ variables })}`,
    );
  }
  if (this.properties.length > 0) {
    mergeZodObjectSchemas.push(
      `${variables.zod}.object({ ${this.properties
        .map((property) => property.jsonZodSchema({ variables }))
        .map(({ key, schema }) => `"${key}": ${schema}`)
        .join(",")} })`,
    );
  }

  return Maybe.of({
    isExported: true,
    kind: StructureKind.Function,
    name: this.jsonZodSchemaFunctionName,
    statements: [
      `return ${
        mergeZodObjectSchemas.length > 0
          ? mergeZodObjectSchemas.reduce((merged, zodObjectSchema) => {
              if (merged.length === 0) {
                return zodObjectSchema;
              }
              return `${merged}.merge(${zodObjectSchema})`;
            }, "")
          : `${variables.zod}.object()`
      };`,
    ],
  });
}
