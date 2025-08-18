import {
  StructureKind,
  VariableDeclarationKind,
  type VariableStatementStructure,
} from "ts-morph";

import { Maybe } from "purify-ts";
import type { ObjectType } from "../ObjectType.js";
import { OptionType } from "../OptionType.js";
import { objectInitializer } from "../objectInitializer.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { ShaclProperty } from "./ShaclProperty.js";

export function graphqlTypeVariableStatement(
  this: ObjectType,
): Maybe<VariableStatementStructure> {
  if (!this.features.has("graphql")) {
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
        name: `${syntheticNamePrefix}GraphQL`,
        initializer: `new graphql.GraphQLObjectType<${this.name}, { objectSet: ${syntheticNamePrefix}ObjectSet }>(${objectInitializer(
          {
            description: this.comment.map(JSON.stringify).extract(),
            fields: `() => (${objectInitializer(
              this.properties.reduce(
                (fields, property) => {
                  property.graphqlField.ifJust((field) => {
                    if (
                      property instanceof ShaclProperty &&
                      !(property.type instanceof OptionType)
                    ) {
                      field.type = `new graphql.GraphQLNonNull(${field.type})`;
                    }
                    fields[property.name] = objectInitializer(field);
                  });
                  return fields;
                },
                {} as Record<string, string>,
              ),
            )})`,
            name: `"${this.name}"`,
          },
        )})`,
      },
    ],
    isExported: true,
  } satisfies VariableStatementStructure);
}
