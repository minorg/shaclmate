import { Maybe } from "purify-ts";
import type { ObjectType } from "../ObjectType.js";
import { type Code, code, joinCode } from "../ts-poet-wrapper.js";

export function ObjectType_jsonUiSchemaFunctionDeclaration(
  this: ObjectType,
): Maybe<Code> {
  if (!this.configuration.features.has("Object.JSON.uiSchema")) {
    return Maybe.empty();
  }

  const variables = { scopePrefix: code`scopePrefix` };
  const elements: Code[] = this.properties.flatMap((property) =>
    property.jsonUiSchemaElement({ variables }).toList(),
  );

  return Maybe.of(code`\
export function uiSchema(parameters?: { scopePrefix?: string }): any {
  const scopePrefix = parameters?.scopePrefix ?? "#";
  return { "elements": [ ${joinCode(elements, { on: "," })} ], label: "${this.label.orDefault(this.name.unsafeCoerce())}", type: "Group" };
}`);
}
