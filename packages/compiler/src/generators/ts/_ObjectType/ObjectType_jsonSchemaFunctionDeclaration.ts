import { Maybe } from "purify-ts";
import { imports } from "../imports.js";
import type { ObjectType } from "../ObjectType.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { type Code, code, joinCode } from "../ts-poet-wrapper.js";

export function ObjectType_jsonSchemaFunctionDeclaration(
  this: ObjectType,
): Maybe<Code> {
  if (!this.features.has("json")) {
    return Maybe.empty();
  }

  const mergeZodObjectSchemas: Code[] = [];
  for (const parentObjectType of this.parentObjectTypes) {
    mergeZodObjectSchemas.push(
      parentObjectType.jsonSchema({ context: "type" }),
    );
  }
  if (this.properties.length > 0) {
    mergeZodObjectSchemas.push(
      code`${imports.z}.object({ ${joinCode(
        this.properties
          .flatMap((property) => property.jsonZodSchema.toList())
          .map(({ key, schema }) => code`"${key}": ${schema}`),
        { on: "," },
      )} })`,
    );
  }

  return Maybe.of(code`\
export function schema() {
  return ${
    mergeZodObjectSchemas.length > 0
      ? mergeZodObjectSchemas.reduce(
          (merged, zodObjectSchema) => {
            if (merged === null) {
              return zodObjectSchema;
            }
            return code`${merged}.merge(${zodObjectSchema})`;
          },
          null as Code | null,
        )
      : `${imports.z}.object()`
  } satisfies ${imports.z}.ZodType<${syntheticNamePrefix}Json>;
}`);
}
