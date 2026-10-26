import type { AbstractIntersectionType } from "../AbstractIntersectionType.js";
import type { ObjectIntersectionType } from "../ObjectIntersectionType.js";

export function ObjectIntersectionType_jsonType(
  this: ObjectIntersectionType,
): AbstractIntersectionType.JsonType {
  return this.jsonTypeFactory.createJsonIntersectionType(
    this.members.map((member) => member.type.jsonType({ form: "compact" })),
    {
      name: this.name.map((name) => [name, "Json"]).extract(),
      recursive: this.recursive,
    },
  );
}
