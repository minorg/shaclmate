import {
  type InterfaceDeclarationStructure,
  type ModuleDeclarationStructure,
  StructureKind,
} from "ts-morph";
import type { ObjectType } from "./ObjectType.js";
import type { ObjectUnionType } from "./ObjectUnionType.js";
import { objectSetMethodSignatures } from "./objectSetMethodSignatures.js";
import { syntheticNamePrefix } from "./syntheticNamePrefix.js";

export function objectSetInterfaceDeclaration({
  objectTypes,
  objectUnionTypes,
}: {
  objectTypes: readonly ObjectType[];
  objectUnionTypes: readonly ObjectUnionType[];
}): readonly (InterfaceDeclarationStructure | ModuleDeclarationStructure)[] {
  return [
    {
      isExported: true,
      kind: StructureKind.Interface,
      methods: objectTypes
        .flatMap((objectType) =>
          Object.values(objectSetMethodSignatures({ objectType })),
        )
        .concat(
          objectUnionTypes.flatMap((objectUnionType) =>
            Object.values(
              objectSetMethodSignatures({ objectType: objectUnionType }),
            ),
          ),
        ),
      name: `${syntheticNamePrefix}ObjectSet`,
    },
    {
      isExported: true,
      kind: StructureKind.Module,
      name: `${syntheticNamePrefix}ObjectSet`,
      statements: [
        {
          kind: StructureKind.TypeAlias,
          isExported: true,
          name: "Query",
          type: `{ readonly filter?: FilterT; readonly limit?: number; readonly offset?: number; }`,
          typeParameters: [
            {
              constraint:
                "{ readonly $identifier?: { readonly in?: readonly string[] } }",
              name: "FilterT",
            },
          ],
        },
      ],
    },
  ];
}
