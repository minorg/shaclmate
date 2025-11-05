import {
  type InterfaceDeclarationStructure,
  type ModuleDeclarationStructure,
  type OptionalKind,
  StructureKind,
  type TypeParameterDeclarationStructure,
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
  const typeParameters = {
    ObjectIdentifierT: {
      constraint: "rdfjs.BlankNode | rdfjs.NamedNode",
      name: "ObjectIdentifierT",
    } satisfies OptionalKind<TypeParameterDeclarationStructure>,
  };

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
          type: `{ readonly limit?: number; readonly offset?: number; readonly where?: readonly Where<${typeParameters.ObjectIdentifierT.name}>[] }`,
          typeParameters: [typeParameters.ObjectIdentifierT],
        },
        {
          kind: StructureKind.TypeAlias,
          isExported: true,
          name: "Where",
          type: [
            `{ readonly identifiers: readonly ${typeParameters.ObjectIdentifierT.name}[]; readonly type: "identifiers" }`,
            `{ readonly identifierType: "NamedNode"; readonly type: "identifier-type"; }`,
            `{ readonly predicate: rdfjs.NamedNode; readonly subject: rdfjs.BlankNode | rdfjs.NamedNode; readonly type: "triple-objects" } `,
          ].join(" | "),
          typeParameters: [typeParameters.ObjectIdentifierT],
        },
      ],
    },
  ];
}
