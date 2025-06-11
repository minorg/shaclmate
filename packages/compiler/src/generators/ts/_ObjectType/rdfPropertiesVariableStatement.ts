import { Maybe } from "purify-ts";
import {
  StructureKind,
  VariableDeclarationKind,
  type VariableStatementStructure,
} from "ts-morph";

import type { ObjectType } from "../ObjectType.js";
import { objectInitializer } from "../objectInitializer.js";
import { ShaclProperty } from "./ShaclProperty.js";

export function rdfPropertiesVariableStatement(
  this: ObjectType,
): Maybe<VariableStatementStructure> {
  if (!this.features.has("rdf")) {
    return Maybe.empty();
  }

  if (this.extern) {
    return Maybe.empty();
  }

  return Maybe.of({
    declarationKind: VariableDeclarationKind.Const,
    kind: StructureKind.VariableStatement,
    declarations: [
      {
        name: "rdfProperties",
        initializer: `[${this.parentObjectTypes
          .map(
            (parentObjectType) =>
              `...${parentObjectType.staticModuleName}.rdfProperties`,
          )
          .concat(
            this.properties.flatMap((property) => {
              if (!(property instanceof ShaclProperty)) {
                return [];
              }
              return [
                objectInitializer({
                  path: this.rdfjsTermExpression(property.path),
                }),
              ];
            }),
          )
          .join(", ")}]`,
      },
    ],
    isExported: true,
  } satisfies VariableStatementStructure);
}
