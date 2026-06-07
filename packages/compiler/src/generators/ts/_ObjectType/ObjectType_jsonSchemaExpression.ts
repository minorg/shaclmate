import type { ObjectType } from "../ObjectType.js";
import { type Code, code, joinCode } from "../ts-poet-wrapper.js";

export function ObjectType_jsonSchemaExpression(this: ObjectType): Code {
  const properties = this.properties
    .flatMap((property) => property.jsonSchema.toList())
    .map(({ key, schema }) => code`"${key}": ${schema}`);

  const meta: Record<string, string> = {
    // id: this.name,
  };
  this.comment.ifJust((description) => {
    meta["description"] = description;
  });
  this.label.ifJust((label) => {
    meta["title"] = label;
  });

  // ${this.properties.every((property) => !property.mutable) ? `.readonly()` : ""}
  return code`${this.reusables.imports.z}.object({${joinCode(properties, { on: "," })}}).meta(${meta})`;
}
