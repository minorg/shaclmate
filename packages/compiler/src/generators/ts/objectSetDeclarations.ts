import type { NamedObjectType } from "./NamedObjectType.js";
import type { NamedObjectUnionType } from "./NamedObjectUnionType.js";
import { objectSetInterfaceDeclaration } from "./objectSetInterfaceDeclaration.js";
import { rdfjsDatasetObjectSetClassDeclaration } from "./rdfjsDatasetObjectSetClassDeclaration.js";
import { sparqlObjectSetClassDeclaration } from "./sparqlObjectSetClassDeclaration.js";
import type { TsGenerator } from "./TsGenerator.js";
import type { Code } from "./ts-poet-wrapper.js";

export function objectSetDeclarations(
  this: TsGenerator,
  {
    namedObjectUnionTypes,
    ...parameters
  }: {
    namedObjectTypes: readonly NamedObjectType[];
    namedObjectUnionTypes: readonly NamedObjectUnionType[];
  },
): readonly Code[] {
  const namedObjectTypes = parameters.namedObjectTypes.filter(
    (namedObjectType) => !namedObjectType.extern && !namedObjectType.synthetic,
  );

  if (
    !this.configuration.features.has("rdf") &&
    !this.configuration.features.has("sparql")
  ) {
    return [];
  }

  const declarations: Code[] = [
    objectSetInterfaceDeclaration.call(this, {
      namedObjectTypes: namedObjectTypes,
      namedObjectUnionTypes,
    }),
  ];

  if (this.configuration.features.has("rdf")) {
    declarations.push(
      rdfjsDatasetObjectSetClassDeclaration.call(this, {
        namedObjectTypes: namedObjectTypes,
        namedObjectUnionTypes,
      }),
    );
  }

  if (this.configuration.features.has("sparql")) {
    declarations.push(
      sparqlObjectSetClassDeclaration.call(this, {
        namedObjectTypes: namedObjectTypes,
        namedObjectUnionTypes,
      }),
    );
  }

  return declarations;
}
