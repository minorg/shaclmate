import type { NamedObjectType } from "../NamedObjectType.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { type Code, code, joinCode } from "../ts-poet-wrapper.js";

export function NamedObjectType_toStringFunctionOrMethodDeclarations(
  this: NamedObjectType,
): readonly Code[] {
  switch (this.declarationType) {
    case "class": {
      const propertiesToStringExpressions: Code[] = [];
      let propertiesToStringsPreamble: string = "";
      let toStringPreamble: string = "";
      if (this.parentObjectTypes.length > 0) {
        propertiesToStringExpressions.push(
          code`...super.${syntheticNamePrefix}propertiesToString()`,
        );
        propertiesToStringsPreamble = "override ";
        toStringPreamble = "override ";
      }
      for (const ownProperty of this.ownProperties) {
        propertiesToStringExpressions.push(
          ...ownProperty
            .toStringExpression({
              variables: { value: code`this.${ownProperty.name}` },
            })
            .toList(),
        );
      }
      propertiesToStringsPreamble = `protected ${propertiesToStringsPreamble}`;

      return [
        code`${propertiesToStringsPreamble}${syntheticNamePrefix}propertiesToStrings(): readonly string[] { return [${joinCode(propertiesToStringExpressions, { on: "," })}]; }`,
        code`${toStringPreamble}toString(): string { return \`${this.name}(\${this.${syntheticNamePrefix}propertiesToStrings().join(", ")})\`; }`,
      ];
    }
    case "interface": {
      const propertiesToStringExpressions: Code[] = [];
      for (const parentObjectType of this.parentObjectTypes) {
        propertiesToStringExpressions.push(
          code`...${parentObjectType}.${this.staticModuleName}.${syntheticNamePrefix}propertiesToStrings(${this.thisVariable})`,
        );
      }
      for (const ownProperty of this.ownProperties) {
        propertiesToStringExpressions.push(
          ...ownProperty
            .toStringExpression({
              variables: {
                value: code`${this.thisVariable}.${ownProperty.name}`,
              },
            })
            .toList(),
        );
      }
      return [
        // Use overloads to allow the function to be attached to an instance or used freestanding
        code`\
export function ${syntheticNamePrefix}propertiesToStrings(this: ${this.name}): readonly string[];
export function ${syntheticNamePrefix}propertiesToStrings(${this.thisVariable}: ${this.name}): readonly string[];
export function ${syntheticNamePrefix}propertiesToStrings(this: ${this.name} | undefined, ${this.thisVariable}?: ${this.name}): readonly string[] {
  if (!${this.thisVariable}) {
    ${this.thisVariable} = this!;
  }
  return [${joinCode(propertiesToStringExpressions, { on: "," })}];
}`,

        code`\
export function ${syntheticNamePrefix}toString(this: ${this.name}): string;
export function ${syntheticNamePrefix}toString(${this.thisVariable}: ${this.name}): string;
export function ${syntheticNamePrefix}toString(this: ${this.name} | undefined, ${this.thisVariable}?: ${this.name}): string {
  return \`${this.name}(\${(this ? ${syntheticNamePrefix}propertiesToStrings.call(this) : ${syntheticNamePrefix}propertiesToStrings.call(undefined, ${this.thisVariable})).join(", ")})\`;
}`,
      ];
    }
  }
}
