import { Maybe } from "purify-ts";
import {
  StructureKind,
  VariableDeclarationKind,
  type VariableStatementStructure,
} from "ts-morph";
import type { ObjectType } from "../ObjectType.js";
import { objectInitializer } from "../objectInitializer.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";

export function graphqlTypeVariableStatement(
  this: ObjectType,
): Maybe<VariableStatementStructure> {
  if (!this.features.has("graphql")) {
    return Maybe.empty();
  }

  if (this.synthetic) {
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
                    fields[field.name] = objectInitializer({
                      args: field.args
                        .map((args) =>
                          objectInitializer(
                            Object.entries(args).reduce(
                              (argObjects, [argName, arg]) => {
                                argObjects[argName] = objectInitializer(arg);
                                return argObjects;
                              },
                              {} as Record<string, string>,
                            ),
                          ),
                        )
                        .extract(),
                      description: field.description
                        .map(JSON.stringify)
                        .extract(),
                      name: JSON.stringify(field.name),
                      resolve: field.resolve,
                      type: field.type,
                    });
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
