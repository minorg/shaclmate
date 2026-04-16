import { imports } from "../imports.js";
import type { ObjectType } from "../ObjectType.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { type Code, code, joinCode } from "../ts-poet-wrapper.js";

export function ObjectType_jsonZodSchemaFunctionDeclaration(
  this: ObjectType,
): Code {
  const mergeZodObjectSchemas: Code[] = [];
  for (const parentObjectType of this.parentObjectTypes) {
    mergeZodObjectSchemas.push(
      parentObjectType.jsonZodSchema({ context: "type" }),
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

  return code`\
export function ${syntheticNamePrefix}jsonZodSchema() {
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
}`;
}
