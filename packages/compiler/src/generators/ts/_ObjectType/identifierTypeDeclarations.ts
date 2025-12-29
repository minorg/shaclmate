import {
  type FunctionDeclarationStructure,
  type ModuleDeclarationStructure,
  StructureKind,
  type TypeAliasDeclarationStructure,
  VariableDeclarationKind,
  type VariableStatementStructure,
} from "ts-morph";
import type { ObjectType } from "../ObjectType.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";

type IdentifierTypeDeclarations = readonly (
  | FunctionDeclarationStructure
  | ModuleDeclarationStructure
  | TypeAliasDeclarationStructure
  | VariableStatementStructure
)[];

export function identifierTypeDeclarations(
  this: ObjectType,
): IdentifierTypeDeclarations {
  if (this.extern) {
    return [];
  }

  const ancestorObjectTypeWithSameIdentifierType =
    this.ancestorObjectTypes.find(
      (ancestorObjectType) =>
        ancestorObjectType.identifierType.name === this.identifierType.name,
    );

  if (ancestorObjectTypeWithSameIdentifierType) {
    return reExportAncestorIdentifierTypeDeclarations(
      ancestorObjectTypeWithSameIdentifierType,
    );
  }

  // Bespoke identifier type and associated functions
  return [
    {
      isExported: true,
      kind: StructureKind.TypeAlias,
      name: `${syntheticNamePrefix}Identifier`,
      type: this.identifierType.name,
    },
    {
      isExported: true,
      kind: StructureKind.Module,
      name: `${syntheticNamePrefix}Identifier`,
      statements: [
        this.identifierType.fromStringFunctionDeclaration,
        this.identifierType.toStringFunctionDeclaration,
      ],
    },
  ];
}

function reExportAncestorIdentifierTypeDeclarations(
  ancestorObjectType: ObjectType,
): IdentifierTypeDeclarations {
  // This object type's identifier type has the same identifier type as an ancestor object type,
  // so just reuse the latter.
  return [
    {
      isExported: true,
      kind: StructureKind.TypeAlias,
      name: `${syntheticNamePrefix}Identifier`,
      type: ancestorObjectType.identifierTypeAlias,
    },
    {
      isExported: true,
      kind: StructureKind.VariableStatement,
      declarationKind: VariableDeclarationKind.Const,
      declarations: [
        {
          initializer: ancestorObjectType.identifierTypeAlias,
          name: `${syntheticNamePrefix}Identifier`,
        },
      ],
    },
  ];
}
