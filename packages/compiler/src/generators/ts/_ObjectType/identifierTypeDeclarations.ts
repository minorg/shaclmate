import { codeEquals } from "../codeEquals.js";
import type { ObjectType } from "../ObjectType.js";
import { type Code, code } from "../ts-poet-wrapper.js";

export function identifierTypeDeclarations(this: ObjectType): readonly Code[] {
  if (!this.configuration.features.has("Object.type")) {
    return [];
  }

  const ancestorObjectTypeWithSameIdentifierType =
    this.ancestorObjectTypes.find(
      (ancestorObjectType) =>
        ancestorObjectType.identifierType.kind === this.identifierType.kind &&
        codeEquals(
          ancestorObjectType.identifierType.expression,
          this.identifierType.expression,
        ),
    );

  if (ancestorObjectTypeWithSameIdentifierType) {
    // This object type's identifier type has the same identifier type as an ancestor object type,
    // so just reuse the latter.
    return [
      code`export type Identifier = ${ancestorObjectTypeWithSameIdentifierType.identifierTypeAlias};`,
      code`export const Identifier = ${ancestorObjectTypeWithSameIdentifierType.identifierTypeAlias};`,
    ];
  }

  // Bespoke identifier type and associated functions
  return [
    code`export type Identifier = ${this.identifierType.expression};`,
    code`\
export namespace Identifier {
  export const parse = ${this.identifierType.parseFunction};
  export const stringify = ${this.identifierType.stringifyFunction};
}`,
  ];
}
