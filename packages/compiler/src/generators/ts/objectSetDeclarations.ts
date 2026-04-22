import type { NamedObjectUnionType } from "./NamedObjectUnionType.js";
import type { ObjectType } from "./ObjectType.js";
import { objectSetInterfaceDeclaration } from "./objectSetInterfaceDeclaration.js";
import { rdfjsDatasetObjectSetClassDeclaration } from "./rdfjsDatasetObjectSetClassDeclaration.js";
import { sparqlObjectSetClassDeclaration } from "./sparqlObjectSetClassDeclaration.js";
import type { Code } from "./ts-poet-wrapper.js";

export function objectSetDeclarations({
  namedObjectUnionTypes,
  ...parameters
}: {
  objectTypes: readonly ObjectType[];
  namedObjectUnionTypes: readonly NamedObjectUnionType[];
}): readonly Code[] {
  const objectTypes = parameters.objectTypes.filter(
    (objectType) =>
      !objectType.abstract && !objectType.extern && !objectType.synthetic,
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

  let namedObjectUnionTypesWithRdfFeatureCount = 0;
  let namedObjectUnionTypesWithSparqlFeatureCount = 0;
  for (const namedObjectUnionType of namedObjectUnionTypes) {
    if (
      !namedObjectUnionType.features.has("rdf") &&
      !namedObjectUnionType.features.has("sparql")
    ) {
      continue;
    }
    if (namedObjectUnionType.features.has("rdf")) {
      namedObjectUnionTypesWithRdfFeatureCount++;
    }
    if (namedObjectUnionType.features.has("sparql")) {
      namedObjectUnionTypesWithSparqlFeatureCount++;
    }
  }

  if (
    objectTypesWithRdfFeatureCount === 0 &&
    objectTypesWithSparqlFeatureCount === 0 &&
    namedObjectUnionTypesWithRdfFeatureCount === 0 &&
    namedObjectUnionTypesWithSparqlFeatureCount === 0
  ) {
    return [];
  }

  const declarations: Code[] = [
    objectSetInterfaceDeclaration({
      objectTypes,
      namedObjectUnionTypes,
    }),
  ];

  if (objectTypesWithRdfFeatureCount > 0) {
    declarations.push(
      rdfjsDatasetObjectSetClassDeclaration({
        objectTypes,
        namedObjectUnionTypes,
      }),
    );
  }

  if (objectTypesWithSparqlFeatureCount > 0) {
    declarations.push(
      sparqlObjectSetClassDeclaration({
        objectTypes,
        namedObjectUnionTypes,
      }),
    );
  }

  return declarations;
}
