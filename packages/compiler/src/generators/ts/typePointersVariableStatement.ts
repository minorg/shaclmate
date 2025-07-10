import {
  StructureKind,
  VariableDeclarationKind,
  type VariableStatementStructure,
} from "ts-morph";
import type { ObjectType } from "./ObjectType.js";
import type { ObjectUnionType } from "./ObjectUnionType.js";
import { objectInitializer } from "./objectInitializer.js";

export function typePointersVariableStatement({
  objectTypes,
  objectUnionTypes,
}: {
  objectTypes: readonly ObjectType[];
  objectUnionTypes: readonly ObjectUnionType[];
}): VariableStatementStructure {
  return {
    declarationKind: VariableDeclarationKind.Const,
    declarations: [
      {
        kind: StructureKind.VariableDeclaration,
        name: "$ObjectTypes",
        initializer: objectInitializer(
          objectTypes
            .toSorted((left, right) => left.name.localeCompare(right.name))
            .reduce(
              (pointers, objectType) => {
                pointers[objectType.name!] = objectType.staticModuleName;
                return pointers;
              },
              {} as Record<string, string>,
            ),
        ),
      },
      {
        kind: StructureKind.VariableDeclaration,
        name: "$ObjectUnionTypes",
        initializer: objectInitializer(
          objectUnionTypes
            .toSorted((left, right) => left.name.localeCompare(right.name))
            .reduce(
              (pointers, objectUnionType) => {
                pointers[objectUnionType.name!] =
                  objectUnionType.staticModuleName;
                return pointers;
              },
              {} as Record<string, string>,
            ),
        ),
      },
      {
        kind: StructureKind.VariableDeclaration,
        name: "$Types",
        initializer: "{ ...$ObjectTypes, ...$ObjectUnionTypes }",
      },
    ],
    isExported: true,
    kind: StructureKind.VariableStatement,
  } satisfies VariableStatementStructure;
}
