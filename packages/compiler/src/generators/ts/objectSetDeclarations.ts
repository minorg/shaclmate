import type { NamedObjectType } from "./NamedObjectType.js";
import type { NamedObjectUnionType } from "./NamedObjectUnionType.js";
import { objectSetInterfaceDeclaration } from "./objectSetInterfaceDeclaration.js";
import { rdfjsDatasetObjectSetClassDeclaration } from "./rdfjsDatasetObjectSetClassDeclaration.js";
import { sparqlObjectSetClassDeclaration } from "./sparqlObjectSetClassDeclaration.js";
import type { Code } from "./ts-poet-wrapper.js";

export function objectSetDeclarations({
  namedObjectUnionTypes,
  ...parameters
}: {
  namedObjectTypes: readonly NamedObjectType[];
  namedObjectUnionTypes: readonly NamedObjectUnionType[];
}): readonly Code[] {
  const namedObjectTypes = parameters.namedObjectTypes.filter(
    (namedObjectType) =>
      !namedObjectType.abstract &&
      !namedObjectType.extern &&
      !namedObjectType.synthetic,
  );
  let namedObjectTypesWithRdfFeatureCount = 0;
  let namedObjectTypesWithSparqlFeatureCount = 0;
  for (const namedObjectType of namedObjectTypes) {
    if (
      !namedObjectType.features.has("rdf") &&
      !namedObjectType.features.has("sparql")
    ) {
      continue;
    }
    if (namedObjectType.features.has("rdf")) {
      namedObjectTypesWithRdfFeatureCount++;
    }
    if (namedObjectType.features.has("sparql")) {
      namedObjectTypesWithSparqlFeatureCount++;
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
    namedObjectTypesWithRdfFeatureCount === 0 &&
    namedObjectTypesWithSparqlFeatureCount === 0 &&
    namedObjectUnionTypesWithRdfFeatureCount === 0 &&
    namedObjectUnionTypesWithSparqlFeatureCount === 0
  ) {
    return [];
  }

  const declarations: Code[] = [
    objectSetInterfaceDeclaration({
      namedObjectTypes: namedObjectTypes,
      namedObjectUnionTypes,
    }),
  ];

  if (namedObjectTypesWithRdfFeatureCount > 0) {
    declarations.push(
      rdfjsDatasetObjectSetClassDeclaration({
        namedObjectTypes: namedObjectTypes,
        namedObjectUnionTypes,
      }),
    );
  }

  if (namedObjectTypesWithSparqlFeatureCount > 0) {
    declarations.push(
      sparqlObjectSetClassDeclaration({
        namedObjectTypes: namedObjectTypes,
        namedObjectUnionTypes,
      }),
    );
  }

  return declarations;
}
