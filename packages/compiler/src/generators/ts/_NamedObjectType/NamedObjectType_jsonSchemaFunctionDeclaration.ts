import { Maybe } from "purify-ts";
import { imports } from "../imports.js";
import type { NamedObjectType } from "../NamedObjectType.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { type Code, code, joinCode } from "../ts-poet-wrapper.js";

export function NamedObjectType_jsonSchemaFunctionDeclaration(
  this: NamedObjectType,
): Maybe<Code> {
  if (!this.features.has("json")) {
    return Maybe.empty();
  }

  let properties: Code[] = [];
  for (const parentObjectType of this.parentObjectTypes) {
    properties.push(
      code`...${parentObjectType.jsonSchema({ context: "type" })}.shape`,
    );
  }
  if (this.properties.length > 0) {
    properties = properties.concat(
      this.properties
        .flatMap((property) => property.jsonZchema.toList())
        .map(({ key, schema }) => code`"${key}": ${schema}`),
    );
  }

  // ${this.properties.every((property) => !property.mutable) ? `.readonly()` : ""}
  return Maybe.of(code`\
export function schema() {
  return ${imports.z}.object({${joinCode(properties, { on: "," })}}) satisfies ${imports.z}.ZodType<${syntheticNamePrefix}Json>;
}`);
}
