import {
  type FunctionDeclarationStructure,
  type ModuleDeclarationStructure,
  StructureKind,
  type TypeAliasDeclarationStructure,
  type VariableStatementStructure,
} from "ts-morph";
import type { ObjectUnionType } from "../ObjectUnionType.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";

export function identifierTypeDeclarations(
  this: ObjectUnionType,
): readonly (
  | FunctionDeclarationStructure
  | ModuleDeclarationStructure
  | TypeAliasDeclarationStructure
  | VariableStatementStructure
)[] {
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
