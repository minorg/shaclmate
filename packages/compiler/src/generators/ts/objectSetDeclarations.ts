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
  objectTypes: objectTypesUnsorted,
  objectUnionTypes: objectUnionTypesUnsorted,
}: {
  dataFactoryVariable: string;
  objectTypes: readonly ObjectType[];
  objectUnionTypes: readonly ObjectUnionType[];
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

  const objectUnionTypes = objectUnionTypesUnsorted.toSorted((left, right) =>
    left.name.localeCompare(right.name),
  );

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
      }),
    );
  }

  if (objectTypesWithSparqlFeatureCount > 0) {
    statements.push(
      ...sparqlObjectSetClassDeclaration({
        dataFactoryVariable,
        objectTypes,
      }),
    );
  }

  return statements;
}
