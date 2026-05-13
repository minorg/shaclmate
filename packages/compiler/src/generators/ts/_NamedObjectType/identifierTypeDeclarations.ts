import type { NamedObjectType } from "../NamedObjectType.js";
import { type Code, code } from "../ts-poet-wrapper.js";

export function identifierTypeDeclarations(
  this: NamedObjectType,
): readonly Code[] {
  const ancestorObjectTypeWithSameIdentifierType =
    this.ancestorObjectTypes.find(
      (ancestorObjectType) =>
        ancestorObjectType.identifierType.name === this.identifierType.name,
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
    code`export type Identifier = ${this.identifierType.name};`,
    code`\
export namespace Identifier {
  export const parse = ${this.identifierType.parseFunction};
  export const stringify = ${this.identifierType.stringifyFunction};
}`,
  ];
}
