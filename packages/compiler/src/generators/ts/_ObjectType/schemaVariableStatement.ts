import {
  StructureKind,
  VariableDeclarationKind,
  type VariableStatementStructure,
} from "ts-morph";

import type { ObjectType } from "../ObjectType.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";

export function schemaVariableStatement(
  this: ObjectType,
): VariableStatementStructure {
  return {
    declarationKind: VariableDeclarationKind.Const,
    kind: StructureKind.VariableStatement,
    declarations: [
      {
        name: `${syntheticNamePrefix}schema`,
        initializer: `{ properties: { ${this.parentObjectTypes
          .map(
            (parentObjectType) =>
              `...${parentObjectType.staticModuleName}.${syntheticNamePrefix}schema.properties`,
          )
          .concat(
            this.ownProperties.map(
              (property) => `${property.name}: ${property.schema}`,
            ),
          )
          .join(", ")} } } as const`,
      },
    ],
    isExported: true,
  };
}
