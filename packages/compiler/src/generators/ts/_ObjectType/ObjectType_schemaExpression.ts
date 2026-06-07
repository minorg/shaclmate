import { invariant } from "ts-invariant";
import type { ObjectType } from "../ObjectType.js";
import { type Code, code } from "../ts-poet-wrapper.js";

export function ObjectType_schemaExpression(this: ObjectType): Code {
  const schema: Record<string, unknown> = {};

  this.fromRdfType.ifJust((fromRdfType) => {
    schema["fromRdfType"] = this.rdfjsTermExpression(fromRdfType);
  });

  const properties: Record<string, Code> = {};
  for (const property of this.properties) {
    property.schema.ifJust((propertySchema) => {
      properties[property.name] = propertySchema;
    });
  }
  invariant(Object.keys(properties).length > 0);
  schema["properties"] = properties;

  return code`${schema} as const`;
}
