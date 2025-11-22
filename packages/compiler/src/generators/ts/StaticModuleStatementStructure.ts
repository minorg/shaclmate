import { invariant } from "ts-invariant";
import {
  type FunctionDeclarationStructure,
  type ModuleDeclarationStructure,
  StructureKind,
  type TypeAliasDeclarationStructure,
  type VariableStatementStructure,
} from "ts-morph";

export type StaticModuleStatementStructure =
  | FunctionDeclarationStructure
  | ModuleDeclarationStructure
  | TypeAliasDeclarationStructure
  | VariableStatementStructure;

export namespace StaticModuleStatementStructure {
  export function compare(
    left: StaticModuleStatementStructure,
    right: StaticModuleStatementStructure,
  ): number {
    const leftName =
      left.kind === StructureKind.VariableStatement
        ? left.declarations[0].name
        : left.name;
    const rightName =
      right.kind === StructureKind.VariableStatement
        ? right.declarations[0].name
        : right.name;
    invariant(leftName);
    invariant(rightName);
    return leftName.localeCompare(rightName);
  }
}
