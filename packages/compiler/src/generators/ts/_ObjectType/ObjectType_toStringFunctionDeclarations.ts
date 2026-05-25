import type { NamedObjectType } from "../NamedObjectType.js";
import { type Code, code, joinCode } from "../ts-poet-wrapper.js";

export function ObjectType_toStringFunctionDeclarations(
  this: NamedObjectType,
): readonly Code[] {
  if (!this.configuration.features.has("Object.toString")) {
    return [];
  }

  let propertiesToStringInitializers: Code[] = [];
  if (this.parentObjectTypes.length > 0) {
    for (const parentObjectType of this.parentObjectTypes) {
      propertiesToStringInitializers.push(
        code`...${parentObjectType.name}._propertiesToStrings(${this.thisVariable})`,
      );
    }
  }

  propertiesToStringInitializers = propertiesToStringInitializers.concat(
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
  );

  const propertiesToStringsReturnExpression = code`${this.reusables.snippets.compactRecord}({${joinCode(propertiesToStringInitializers, { on: "," })}})`;
  const toStringReturnExpression = (propertiesToStrings: Code) =>
    code`\`${this.name}(\${JSON.stringify(${propertiesToStrings})})\``;

  const syntheticNamePrefix = this.configuration.syntheticNamePrefix;
  return [
    // Use overloads to allow the function to be attached to an instance or used freestanding
    code`\
export function _propertiesToStrings(${this.thisVariable}: ${this.name}): Record<string, string> {
  return ${propertiesToStringsReturnExpression};
}`,

    code`\
export function ${syntheticNamePrefix}toString(${this.thisVariable}: ${this.name}): string {
  return ${toStringReturnExpression(code`_propertiesToStrings(${this.thisVariable})`)};
}`,
  ];
}
