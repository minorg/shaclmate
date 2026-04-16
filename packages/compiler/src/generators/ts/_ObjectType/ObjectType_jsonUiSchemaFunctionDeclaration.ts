import type { ObjectType } from "../ObjectType.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { type Code, code, joinCode } from "../ts-poet-wrapper.js";

export function ObjectType_jsonUiSchemaFunctionDeclaration(
  this: ObjectType,
): Code {
  const variables = { scopePrefix: code`scopePrefix` };
  const elements: Code[] = this.parentObjectTypes
    .map(
      (parentObjectType) =>
        code`${parentObjectType.staticModuleName}.${syntheticNamePrefix}jsonUiSchema({ scopePrefix })`,
    )
    .concat(
      this.ownProperties.flatMap((property) =>
        property.jsonUiSchemaElement({ variables }).toList(),
      ),
    );

  return code`\
export function ${syntheticNamePrefix}jsonUiSchema(parameters?: { scopePrefix?: string }): any {
  const scopePrefix = parameters?.scopePrefix ?? "#";
  return { "elements": [ ${joinCode(elements, { on: "," })} ], label: "${this.label.orDefault(this.name)}", type: "Group" };
}`;
}
