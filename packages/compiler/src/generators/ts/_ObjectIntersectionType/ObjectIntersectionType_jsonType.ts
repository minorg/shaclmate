import type { AbstractIntersectionType } from "../AbstractIntersectionType.js";
import type { ObjectIntersectionType } from "../ObjectIntersectionType.js";
import { code, literalOf } from "../ts-poet-wrapper.js";

export function ObjectIntersectionType_jsonType(
  this: ObjectIntersectionType,
): AbstractIntersectionType.JsonType {
  return this.jsonTypeFactory.createJsonIntersectionType(
    this.members.map((member) => member.type.jsonType({ form: "compact" })),
    {
      memberTypeExpression: (memberType) =>
        code`Omit<${memberType.expression}, ${literalOf(this.configuration.objectDiscriminantProperty.jsonName)}>`,
      memberTypeSchema: (memberType) =>
        code`${memberType.schema}.omit({ ${this.configuration.objectDiscriminantProperty.jsonName}: true })`,
      name: this.name.map((name) => [name, "Json"]).extract(),
      recursive: this.recursive,
    },
  );
}
