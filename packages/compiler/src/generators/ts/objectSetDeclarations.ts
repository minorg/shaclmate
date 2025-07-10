import {
  type ClassDeclarationStructure,
  type InterfaceDeclarationStructure,
  StructureKind,
} from "ts-morph";
import type { ObjectType } from "./ObjectType.js";

function objectSetInterfaceDeclaration({
  objectTypes,
}: { objectTypes: readonly ObjectType[] }): InterfaceDeclarationStructure {
  const objectTypeDiscriminatorValues = objectTypes
    .flatMap((objectType) => objectType._discriminatorProperty.ownValues)
    .map((value) => `"${value}"`)
    .join(" | ");

  return {
    isExported: true,
    kind: StructureKind.Interface,
    methods: [
      {
        name: "objectByIdentifier",
        parameters: [
          {
            name: "identifier",
            type: "rdfjs.NamedNode",
          },
          {
            name: "type",
            type: objectTypeDiscriminatorValues,
          },
        ],
        typeParameters: [
          {
            name: "ObjectT",
          },
        ],
        returnType: "Promise<purify.Either<Error, ObjectT>>",
      },
      {
        name: "objectIdentifiers",
        parameters: [
          {
            name: "type",
            type: objectTypeDiscriminatorValues,
          },
          {
            hasQuestionToken: true,
            name: "options",
            type: "{ limit?: number; offset?: number }",
          },
        ],
        returnType: "Promise<purify.Either<Error, readonly rdfjs.NamedNode[]>>",
      },
      {
        name: "objectsByIdentifiers",
        parameters: [
          {
            name: "identifiers",
            type: "readonly rdfjs.NamedNode[]",
          },
          {
            name: "type",
            type: objectTypeDiscriminatorValues,
          },
        ],
        typeParameters: [
          {
            name: "ObjectT",
          },
        ],
        returnType: "Promise<readonly purify.Either<Error, ObjectT>[]>",
      },
      {
        name: "objectsCount",
        parameters: [
          {
            name: "type",
            type: objectTypeDiscriminatorValues,
          },
        ],
        returnType: "Promise<purify.Either<Error, number>>",
      },
    ],
    name: "$ObjectSet",
  };
}

export function objectSetDeclarations({
  objectTypes,
}: {
  objectTypes: readonly ObjectType[];
}): readonly (ClassDeclarationStructure | InterfaceDeclarationStructure)[] {
  if (
    !objectTypes.some(
      (objectType) =>
        objectType.features.has("rdf") || objectType.features.has("sparql"),
    )
  ) {
    return [];
  }

  return [objectSetInterfaceDeclaration({ objectTypes })];
}
