import { Maybe } from "purify-ts";
import type { OptionalKind, VariableStatementStructure } from "ts-morph";
import type { ObjectType } from "./ObjectType.js";
import { objectInitializer } from "./objectInitializer.js";

function graphqlQueryObjectType({
  objectTypes,
}: { objectTypes: readonly ObjectType[] }): string {
  return `new graphql.GraphQLObjectType<null, { objectSet: $ObjectSet }>({ name: "Query", fields: ${objectInitializer(
    objectTypes.reduce(
      (fields, objectType) => {
        fields[objectType.objectSetMethodNames.object] = objectInitializer({
          args: objectInitializer({
            id: objectInitializer({
              type: "new graphql.GraphQLNonNull(graphql.GraphQLID)",
            }),
          }),
          resolve: `(_, { id }, { objectSet }) => objectSet.${objectType.objectSetMethodNames.object}(id)`,
          type: `${objectType.staticModuleName}.GraphQL`,
        });
        return fields;
      },
      {} as Record<string, string>,
    ),
  )} })`;
}

export function graphqlSchemaVariableStatement({
  objectTypes: objectTypesUnsorted,
}: { objectTypes: readonly ObjectType[] }): Maybe<
  OptionalKind<VariableStatementStructure>
> {
  const objectTypes = objectTypesUnsorted
    .filter((objectType) => objectType.features.has("graphql"))
    .toSorted((left, right) => left.name.localeCompare(right.name));

  if (objectTypes.length === 0) {
    return Maybe.empty();
  }

  return Maybe.of({
    isExported: true,
    declarations: [
      {
        name: "graphqlSchema",
        initializer: `new graphql.GraphQLSchema({ query: ${graphqlQueryObjectType({ objectTypes })} })`,
      },
    ],
  });
}
