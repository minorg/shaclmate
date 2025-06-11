import {
  type ClassDeclarationStructure,
  type InterfaceDeclarationStructure,
  type ModuleDeclarationStructure,
  type StatementStructures,
  StructureKind,
  type TypeAliasDeclarationStructure,
} from "ts-morph";

export function pointers(this: {
  declarations: (
    | ClassDeclarationStructure
    | InterfaceDeclarationStructure
    | ModuleDeclarationStructure
    | TypeAliasDeclarationStructure
  )[];
  staticModuleName: string;
}): Record<string, string> {
  const pointers: Record<string, string> = {};
  for (const declaration of this.declarations) {
    if (declaration.kind === StructureKind.Module) {
      for (const statement of declaration.statements! as StatementStructures[]) {
        if (statement.kind === StructureKind.Function) {
          pointers[statement.name!] =
            `${this.staticModuleName}.${statement.name}`;
        }
      }
    }
  }
  return Object.keys(pointers)
    .sort()
    .reduce(
      (sortedPointers, key) => {
        sortedPointers[key] = pointers[key];
        return sortedPointers;
      },
      {} as Record<string, string>,
    );
}
