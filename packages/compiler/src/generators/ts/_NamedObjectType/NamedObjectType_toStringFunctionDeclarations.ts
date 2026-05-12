import type { NamedObjectType } from "../NamedObjectType.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { snippets } from "../this.snippets.js";
import { type Code, code, joinCode, literalOf } from "../ts-poet-wrapper.js";

export function NamedObjectType_toStringFunctionDeclarations(
  this: NamedObjectType,
): readonly Code[] {
  const propertiesToStringRecordProperties: Code[] = [];
  if (this.parentObjectTypes.length > 0) {
    for (const parentObjectType of this.parentObjectTypes) {
      propertiesToStringRecordProperties.push(
        code`...${parentObjectType.name}.${syntheticNamePrefix}propertiesToStrings(${this.thisVariable})`,
      );
    }
  }

  for (const property of this.properties) {
    property
      .toStringExpression({
        variables: {
          value: property.accessExpression({
            variables: { object: this.thisVariable },
          }),
        },
      })
      .ifJust((propertyToStringExpression) => {
        propertiesToStringRecordProperties.push(
          code`${literalOf(property.name)}: ${propertyToStringExpression}`,
        );
      });
  }
  const propertiesToStringsReturnExpression = code`${this.snippets.compactRecord}({${joinCode(propertiesToStringRecordProperties, { on: "," })}})`;
  const toStringReturnExpression = (propertiesToStrings: Code) =>
    code`\`${this.name}(\${JSON.stringify(${propertiesToStrings})})\``;

  return [
    // Use overloads to allow the function to be attached to an instance or used freestanding
    code`\
export function ${syntheticNamePrefix}propertiesToStrings(${this.thisVariable}: ${this.name}): Record<string, string> {
  return ${propertiesToStringsReturnExpression};
}`,

    code`\
export function ${syntheticNamePrefix}toString(this: ${this.name}): string;
export function ${syntheticNamePrefix}toString(${this.thisVariable}: ${this.name}): string;
export function ${syntheticNamePrefix}toString(this: ${this.name} | undefined, ${this.thisVariable}?: ${this.name}): string {
  return ${toStringReturnExpression(code`${syntheticNamePrefix}propertiesToStrings((${this.thisVariable} ?? this)!)`)};
}`,
  ];
}
