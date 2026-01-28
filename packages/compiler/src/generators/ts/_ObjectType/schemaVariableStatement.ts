import {
  StructureKind,
  VariableDeclarationKind,
  type VariableStatementStructure,
} from "ts-morph";

import type { ObjectType } from "../ObjectType.js";
import { objectInitializer } from "../objectInitializer.js";
import { rdfjsTermExpression } from "../rdfjsTermExpression.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";

export function schemaVariableStatement(
  this: ObjectType,
): VariableStatementStructure {
  const propertiesObject: string[] = [];
  for (const parentObjectType of this.parentObjectTypes) {
    propertiesObject.push(
      `...${parentObjectType.staticModuleName}.${syntheticNamePrefix}schema`,
    );
  }
  for (const property of this.ownShaclProperties) {
    const propertyObject: Record<string, string> = {};
    if (this.features.has("rdf")) {
      propertyObject["identifier"] = rdfjsTermExpression(property.path);
    }
    propertiesObject.push(
      `${property.name}: ${objectInitializer(propertyObject)}`,
    );
  }

  return {
    declarationKind: VariableDeclarationKind.Const,
    kind: StructureKind.VariableStatement,
    declarations: [
      {
        name: `${syntheticNamePrefix}schema`,
        initializer: `${propertiesObject.join(", ")}`,
      },
    ],
    isExported: true,
  };
}
