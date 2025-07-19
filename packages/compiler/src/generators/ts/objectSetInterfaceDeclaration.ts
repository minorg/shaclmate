import {
  type InterfaceDeclarationStructure,
  type ModuleDeclarationStructure,
  StructureKind,
} from "ts-morph";
import type { ObjectSetInterfaceMethodSignaturesByObjectTypeName } from "./objectSetInterfaceMethodSignaturesByObjectTypeName.js";

export function objectSetInterfaceDeclaration({
  objectSetInterfaceMethodSignaturesByObjectTypeName,
}: {
  objectSetInterfaceMethodSignaturesByObjectTypeName: ObjectSetInterfaceMethodSignaturesByObjectTypeName;
}): readonly (InterfaceDeclarationStructure | ModuleDeclarationStructure)[] {
  return [
    {
      isExported: true,
      kind: StructureKind.Interface,
      methods: Object.values(
        objectSetInterfaceMethodSignaturesByObjectTypeName,
      ).flatMap(Object.values),
      name: "$ObjectSet",
    },
    {
      isExported: true,
      kind: StructureKind.Module,
      name: "$ObjectSet",
      statements: [
        {
          kind: StructureKind.TypeAlias,
          isExported: true,
          name: "Query",
          type: "{ readonly limit?: number; readonly offset?: number; readonly where?: Where<ObjectIdentifierT> }",
          typeParameters: [
            {
              constraint: "rdfjs.BlankNode | rdfjs.NamedNode",
              name: "ObjectIdentifierT",
            },
          ],
        },
        {
          kind: StructureKind.TypeAlias,
          isExported: true,
          name: "Where",
          type: `{ readonly identifiers: readonly ObjectIdentifierT[]; readonly type: "identifiers" }`,
          typeParameters: [
            {
              constraint: "rdfjs.BlankNode | rdfjs.NamedNode",
              name: "ObjectIdentifierT",
            },
          ],
        },
      ],
    },
  ];
}
