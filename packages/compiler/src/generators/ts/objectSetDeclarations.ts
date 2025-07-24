import {} from "@tpluscode/rdf-ns-builders";
import type {
  ClassDeclarationStructure,
  InterfaceDeclarationStructure,
  ModuleDeclarationStructure,
} from "ts-morph";
import type { ObjectType } from "./ObjectType.js";
import { objectSetInterfaceDeclaration } from "./objectSetInterfaceDeclaration.js";
import { objectSetInterfaceMethodSignaturesByObjectTypeName as objectSetInterfaceMethodSignaturesByObjectTypeName_ } from "./objectSetInterfaceMethodSignaturesByObjectTypeName.js";
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

  const objectSetInterfaceMethodSignaturesByObjectTypeName =
    objectSetInterfaceMethodSignaturesByObjectTypeName_({ objectTypes });

  const statements: (
    | ClassDeclarationStructure
    | InterfaceDeclarationStructure
    | ModuleDeclarationStructure
  )[] = [
    ...objectSetInterfaceDeclaration({
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
