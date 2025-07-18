import {} from "@tpluscode/rdf-ns-builders";
import type {
  ClassDeclarationStructure,
  InterfaceDeclarationStructure,
  ModuleDeclarationStructure,
} from "ts-morph";
import type { ObjectType } from "./ObjectType.js";
import {
  type ObjectSetInterfaceMethodSignaturesByObjectTypeName,
  objectSetInterfaceDeclaration,
} from "./objectSetInterfaceDeclaration.js";
import { rdfjsDatasetObjectSetClassDeclaration } from "./rdfjsDatasetObjectSetClassDeclaration.js";
import { sparqlObjectSetClassDeclaration } from "./sparqlObjectSetClassDeclaration.js";

export function objectSetDeclarations({
  dataFactoryVariable,
  objectTypes: objectTypesUnsorted,
}: {
  dataFactoryVariable: string;
  objectTypes: readonly ObjectType[];
}): readonly (
  | ClassDeclarationStructure
  | InterfaceDeclarationStructure
  | ModuleDeclarationStructure
)[] {
  const objectTypes = objectTypesUnsorted
    .filter((objectType) => !objectType.abstract)
    .toSorted((left, right) => left.name.localeCompare(right.name));
  let objectTypesWithRdfFeatureCount = 0;
  let objectTypesWithSparqlFeatureCount = 0;
  for (const objectType of objectTypes) {
    const objectTypeHasRdfFeature = objectType.features.has("rdf");
    const objectTypeHasSparqlFeature = objectType.features.has("sparql");

    if (!objectTypeHasRdfFeature && !objectTypeHasSparqlFeature) {
      continue;
    }
    if (objectTypeHasRdfFeature) {
      objectTypesWithRdfFeatureCount++;
    }
    if (objectTypeHasSparqlFeature) {
      objectTypesWithSparqlFeatureCount++;
    }
  }

  if (
    objectTypesWithRdfFeatureCount === 0 &&
    objectTypesWithSparqlFeatureCount === 0
  ) {
    return [];
  }

  const objectSetInterfaceMethodSignaturesByObjectTypeName = objectTypes.reduce(
    (result, objectType) => {
      const methodNames = objectType.objectSetMethodNames;
      result[objectType.name] = {
        object: {
          name: methodNames.object,
          parameters: [
            {
              name: "identifier",
              type: objectType.identifierType.name,
            },
          ],
          returnType: `Promise<purify.Either<Error, ${objectType.name}>>`,
        },
        objectIdentifiers: {
          name: methodNames.objectIdentifiers,
          parameters: [
            {
              hasQuestionToken: true,
              name: "options",
              type: "{ limit?: number; offset?: number }",
            },
          ],
          returnType: `Promise<purify.Either<Error, readonly ${objectType.identifierType.name}[]>>`,
        },
        objects: {
          name: methodNames.objects,
          parameters: [
            {
              name: "identifiers",
              type: `readonly ${objectType.identifierType.name}[]`,
            },
          ],
          returnType: `Promise<readonly purify.Either<Error, ${objectType.name}>[]>`,
        },
        objectsCount: {
          name: methodNames.objectsCount,
          returnType: "Promise<purify.Either<Error, number>>",
        },
      };
      return result;
    },
    {} as ObjectSetInterfaceMethodSignaturesByObjectTypeName,
  );

  const statements: (
    | ClassDeclarationStructure
    | InterfaceDeclarationStructure
    | ModuleDeclarationStructure
  )[] = [
    objectSetInterfaceDeclaration({
      objectSetInterfaceMethodSignaturesByObjectTypeName,
    }),
  ];

  if (objectTypesWithRdfFeatureCount > 0) {
    statements.push(
      rdfjsDatasetObjectSetClassDeclaration({
        objectSetInterfaceMethodSignaturesByObjectTypeName,
        objectTypes,
      }),
    );
  }

  if (objectTypesWithSparqlFeatureCount > 0) {
    statements.push(
      sparqlObjectSetClassDeclaration({
        dataFactoryVariable,
        objectSetInterfaceMethodSignaturesByObjectTypeName,
        objectTypes,
      }),
    );
  }

  return statements;
}
