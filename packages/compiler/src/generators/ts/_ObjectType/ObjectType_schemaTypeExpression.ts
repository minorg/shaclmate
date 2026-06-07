import { invariant } from "ts-invariant";
import type { ObjectType } from "../ObjectType.js";
import { type Code, code } from "../ts-poet-wrapper.js";

export function ObjectType_schemaTypeExpression(this: ObjectType): Code {
  const schemaType: Record<string, unknown> = {};

  this.fromRdfType.ifJust(() => {
    schemaType["fromRdfType"] = code`${this.reusables.imports.NamedNode}`;
  });

  const properties: Record<string, Code> = {};
  for (const property of this.properties) {
    property.schemaType.ifJust((propertySchemaType) => {
      properties[property.name] = propertySchemaType;
    });
  }
  invariant(Object.keys(properties).length > 0);
  schemaType["properties"] = properties;

  return code`${schemaType}`;
}
