import { Maybe } from "purify-ts";
import { invariant } from "ts-invariant";
import type { AbstractType } from "../AbstractType.js";
import type { ObjectType } from "../ObjectType.js";

export function ObjectType_jsonType(
  this: ObjectType,
  { discriminantProperty }: Parameters<AbstractType["jsonType"]>[0],
): AbstractType.JsonType {
  const jsonObjectTypeMembers = this.properties.flatMap((property) =>
    property.jsonObjectMember.toList(),
  );

  if (discriminantProperty) {
    const discriminantPropertyName = Object.keys(discriminantProperty)[0];
    invariant(discriminantPropertyName);
    const discriminantPropertyType =
      discriminantProperty[discriminantPropertyName].type;
    invariant(discriminantPropertyType);

    invariant(
      discriminantPropertyType.kind === "JsonNumber" ||
        discriminantPropertyType.kind === "JsonString",
    );
    const discriminantPropertyValue = discriminantPropertyType.in_[0];
    invariant(typeof discriminantPropertyValue !== "undefined");

    const thisDiscriminantProperty = this.discriminantProperty.extract();
    if (thisDiscriminantProperty) {
      if (
        discriminantPropertyName !== thisDiscriminantProperty.name ||
        discriminantPropertyValue !== thisDiscriminantProperty.value
      ) {
        throw new Error(
          `${this.shapeIdentifier}: overriding the discriminant property is unsupported`,
        );
      }
    } else {
      jsonObjectTypeMembers.unshift({
        description: Maybe.empty(),
        label: Maybe.empty(),
        name: discriminantPropertyName,
        optional: false,
        recursive: false,
        type: discriminantPropertyType,
        uiSchemaElement: Maybe.empty(),
      });
    }
  }

  return this.jsonTypeFactory.createJsonObjectType(jsonObjectTypeMembers, {
    name: this.name.map((name) => [name, "Json"]).extract(),
  });
}
