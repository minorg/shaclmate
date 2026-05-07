import type { NamedObjectType } from "../NamedObjectType.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { type Code, code, joinCode, literalOf } from "../ts-poet-wrapper.js";

export function NamedObjectType_toStringFunctionOrMethodDeclarations(
  this: NamedObjectType,
): readonly Code[] {
  const propertiesToStringRecordProperties: Code[] = [];
  if (this.parentObjectTypes.length > 0) {
    switch (this.declarationType) {
      case "class": {
        propertiesToStringRecordProperties.push(
          code`...super.${syntheticNamePrefix}propertiesToStrings()`,
        );
        break;
      }
      case "interface": {
        for (const parentObjectType of this.parentObjectTypes) {
          propertiesToStringRecordProperties.push(
            code`...${parentObjectType.staticModuleName}.${syntheticNamePrefix}propertiesToStrings(${this.thisVariable})`,
          );
        }
        break;
      }
    }
  }
  for (const ownProperty of this.ownProperties) {
    ownProperty
      .toStringExpression({
        variables: { value: code`${this.thisVariable}.${ownProperty.name}` },
      })
      .ifJust((ownPropertyToStringExpression) => {
        propertiesToStringRecordProperties.push(
          code`${literalOf(ownProperty.name)}: ${ownPropertyToStringExpression}`,
        );
      });
  }
  const propertiesToStringsReturnExpression = code`Object.entries({${joinCode(propertiesToStringRecordProperties, { on: "," })}}).reduce((definedPropertiesToString, [propertyName, propertyValue]) => { if (propertyValue !== undefined) { definedPropertiesToString[propertyName] = propertyValue; } return definedPropertiesToString; }, {} as Record<string, string>)`;
  const toStringReturnExpression = (propertiesToStrings: Code) =>
    code`\`${this.name}(\${JSON.stringify(${propertiesToStrings})})\``;

  switch (this.declarationType) {
    case "class": {
      let propertiesToStringsPreamble: string = "";
      let toStringPreamble: string = "";
      if (this.parentObjectTypes.length > 0) {
        propertiesToStringsPreamble = "override ";
        toStringPreamble = "override ";
      }
      propertiesToStringsPreamble = `protected ${propertiesToStringsPreamble}`;

      return [
        code`${propertiesToStringsPreamble}${syntheticNamePrefix}propertiesToStrings(): Record<string, string> { return ${propertiesToStringsReturnExpression}; }`,
        code`${toStringPreamble}toString(): string { return ${toStringReturnExpression(code`this.${syntheticNamePrefix}propertiesToStrings()`)}; }`,
      ];
    }
    case "interface": {
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
  }
}
