import type { ObjectType } from "../ObjectType.js";
import { type Code, code, joinCode } from "../ts-poet-wrapper.js";

export function ObjectType_toStringFunctionDeclarations(
  this: ObjectType,
): readonly Code[] {
  if (!this.configuration.features.has("Object.toString")) {
    return [];
  }

  const propertiesToStringsReturnExpression = code`${this.reusables.snippets.compactRecord}({${joinCode(
    this.properties.flatMap((property) =>
      property
        .toStringInitializer({
          variables: {
            value: property.accessExpression({
              variables: { object: this.thisVariable },
            }),
          },
        })
        .toList(),
    ),
    { on: "," },
  )}})`;

  const toStringReturnExpression = (propertiesToStrings: Code) =>
    code`\`${this.name.unsafeCoerce()}(\${JSON.stringify(${propertiesToStrings})})\``;

  const syntheticNamePrefix = this.configuration.syntheticNamePrefix;
  return [
    // Use overloads to allow the function to be attached to an instance or used freestanding
    code`\
export function _propertiesToStrings(${this.thisVariable}: ${this.expression}): Record<string, string> {
  return ${propertiesToStringsReturnExpression};
}`,

    code`\
export function ${syntheticNamePrefix}toString(${this.thisVariable}: ${this.expression}): string {
  return ${toStringReturnExpression(code`_propertiesToStrings(${this.thisVariable})`)};
}`,
  ];
}
