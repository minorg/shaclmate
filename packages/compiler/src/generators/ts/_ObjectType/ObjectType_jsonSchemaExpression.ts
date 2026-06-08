import type { ObjectType } from "../ObjectType.js";
import { type Code, code, joinCode } from "../ts-poet-wrapper.js";

export function ObjectType_jsonSchemaExpression(this: ObjectType): Code {
  const properties = this.properties
    .flatMap((property) => property.jsonSchema.toList())
    .map(({ key, schema }) => code`"${key}": ${schema}`);

  // ${this.properties.every((property) => !property.mutable) ? `.readonly()` : ""}
  let expression = code`${this.reusables.imports.z}.object({${joinCode(properties, { on: "," })}})`;

  const meta: Record<string, string> = {
    // id: this.name,
  };
  this.comment.ifJust((description) => {
    meta["description"] = description;
  });
  this.label.ifJust((label) => {
    meta["title"] = label;
  });
  if (Object.keys(meta).length > 0) {
    expression = code`${expression}.meta(${meta})`;
  }

  return expression;
}
