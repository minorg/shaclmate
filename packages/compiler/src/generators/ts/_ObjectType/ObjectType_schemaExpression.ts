import { invariant } from "ts-invariant";
import type { ObjectType } from "../ObjectType.js";
import { arrayOf, type Code, code } from "../ts-poet-wrapper.js";

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

  if (this.toRdfTypes.length > 0) {
    schema["toRdfTypes"] = arrayOf(
      ...this.toRdfTypes.map((toRdfType) =>
        this.rdfjsTermExpression(toRdfType),
      ),
    );
  }

  return code`${schema} as const`;
}
