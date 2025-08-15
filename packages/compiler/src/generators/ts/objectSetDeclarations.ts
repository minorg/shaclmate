import {} from "@tpluscode/rdf-ns-builders";
import type {
  ClassDeclarationStructure,
  InterfaceDeclarationStructure,
  ModuleDeclarationStructure,
} from "ts-morph";
import type { ObjectType } from "./ObjectType.js";
import type { ObjectUnionType } from "./ObjectUnionType.js";
import { objectSetInterfaceDeclaration } from "./objectSetInterfaceDeclaration.js";
import { rdfjsDatasetObjectSetClassDeclaration } from "./rdfjsDatasetObjectSetClassDeclaration.js";
import { sparqlObjectSetClassDeclaration } from "./sparqlObjectSetClassDeclaration.js";

export function objectSetDeclarations({
  dataFactoryVariable,
  objectUnionTypes,
  ...parameters
}: {
  dataFactoryVariable: string;
  objectTypes: readonly ObjectType[];
  objectUnionTypes: readonly ObjectUnionType[];
}): readonly (
  | ClassDeclarationStructure
  | InterfaceDeclarationStructure
  | ModuleDeclarationStructure
)[] {
  const objectTypes = parameters.objectTypes.filter(
    (objectType) => !objectType.abstract,
  );
  let objectTypesWithRdfFeatureCount = 0;
  let objectTypesWithSparqlFeatureCount = 0;
  for (const objectType of objectTypes) {
    if (!objectType.features.has("rdf") && !objectType.features.has("sparql")) {
      continue;
    }
    if (objectType.features.has("rdf")) {
      objectTypesWithRdfFeatureCount++;
    }
    if (objectType.features.has("sparql")) {
      objectTypesWithSparqlFeatureCount++;
    }
  }

  let objectUnionTypesWithRdfFeatureCount = 0;
  let objectUnionTypesWithSparqlFeatureCount = 0;
  for (const objectUnionType of objectUnionTypes) {
    if (
      !objectUnionType.features.has("rdf") &&
      !objectUnionType.features.has("sparql")
    ) {
      continue;
    }
    if (objectUnionType.features.has("rdf")) {
      objectUnionTypesWithRdfFeatureCount++;
    }
    if (objectUnionType.features.has("sparql")) {
      objectUnionTypesWithSparqlFeatureCount++;
    }
  }

  if (
    objectTypesWithRdfFeatureCount === 0 &&
    objectTypesWithSparqlFeatureCount === 0 &&
    objectUnionTypesWithRdfFeatureCount === 0 &&
    objectUnionTypesWithSparqlFeatureCount === 0
  ) {
    return [];
  }

  const statements: (
    | ClassDeclarationStructure
    | InterfaceDeclarationStructure
    | ModuleDeclarationStructure
  )[] = [
    ...objectSetInterfaceDeclaration({
      objectTypes,
      objectUnionTypes,
    }),
  ];

  if (objectTypesWithRdfFeatureCount > 0) {
    statements.push(
      rdfjsDatasetObjectSetClassDeclaration({
        objectTypes,
        objectUnionTypes,
      }),
    );
  }

  if (objectTypesWithSparqlFeatureCount > 0) {
    statements.push(
      ...sparqlObjectSetClassDeclaration({
        dataFactoryVariable,
        objectTypes,
        objectUnionTypes,
      }),
    );
  }

  return statements;
}
