import { Maybe } from "purify-ts";
import {
  StructureKind,
  VariableDeclarationKind,
  type VariableStatementStructure,
} from "ts-morph";

import type { ObjectType } from "../ObjectType.js";
import { objectInitializer } from "../objectInitializer.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { ShaclProperty } from "./ShaclProperty.js";

export function propertiesVariableStatement(
  this: ObjectType,
): Maybe<VariableStatementStructure> {
  if (this.extern) {
    return Maybe.empty();
  }

  const propertiesObject: string[] = [];
  for (const parentObjectType of this.parentObjectTypes) {
    propertiesObject.push(
      `...${parentObjectType.staticModuleName}.${syntheticNamePrefix}properties`,
    );
  }
  for (const property of this.properties) {
    if (!(property instanceof ShaclProperty)) {
      continue;
    }
    const propertyObject: Record<string, string> = {};
    if (this.features.has("rdf")) {
      propertyObject["identifier"] = this.rdfjsTermExpression(property.path);
    }
    propertiesObject.push(
      `${property.name}: ${objectInitializer(propertyObject)}`,
    );
  }

  return Maybe.of({
    declarationKind: VariableDeclarationKind.Const,
    kind: StructureKind.VariableStatement,
    declarations: [
      {
        name: `${syntheticNamePrefix}properties`,
        initializer: `{${propertiesObject.join(", ")}}`,
      },
    ],
    isExported: true,
  } satisfies VariableStatementStructure);
}
