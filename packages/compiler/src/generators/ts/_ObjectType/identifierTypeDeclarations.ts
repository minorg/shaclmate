import type { ObjectType } from "../ObjectType.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { type Code, code, joinCode } from "../ts-poet-wrapper.js";

export function identifierTypeDeclarations(this: ObjectType): readonly Code[] {
  const ancestorObjectTypeWithSameIdentifierType =
    this.ancestorObjectTypes.find(
      (ancestorObjectType) =>
        ancestorObjectType.identifierType.name === this.identifierType.name,
    );

  if (ancestorObjectTypeWithSameIdentifierType) {
    // This object type's identifier type has the same identifier type as an ancestor object type,
    // so just reuse the latter.
    return [
      code`export type ${syntheticNamePrefix}Identifier = ${ancestorObjectTypeWithSameIdentifierType.identifierTypeAlias};`,
      code`export const ${syntheticNamePrefix}Identifier = ${ancestorObjectTypeWithSameIdentifierType.identifierTypeAlias};`,
    ];
  }

  // Bespoke identifier type and associated functions
  return [
    code`export type ${syntheticNamePrefix}Identifier = ${this.identifierType.name};`,
    code`export namespace ${syntheticNamePrefix}Identifier { ${joinCode([this.identifierType.fromStringFunction, this.identifierType.toStringFunction])} }`,
  ];
}
