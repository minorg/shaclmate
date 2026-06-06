import type { ObjectType } from "../ObjectType.js";
import { arrayOf, type Code, code, literalOf } from "../ts-poet-wrapper.js";

export function ObjectType_jsonUiSchemaFunctionExpression(
  this: ObjectType,
): Code {
  const variables = { scopePrefix: code`scopePrefix` };

  const uiSchema: Record<string, Code | string> = {
    elements: code`${arrayOf(
      ...this.properties.flatMap((property) =>
        property.jsonUiSchemaElement({ variables }).toList(),
      ),
    )}`,
    type: "Group",
  };
  this.name.ifJust((name) => {
    uiSchema["label"] = code`${literalOf(name)}`;
  });

  return code`\
((parameters?: { scopePrefix?: string }): any => {
  const scopePrefix = parameters?.scopePrefix ?? "#";
  return ${uiSchema};
})`;
}
