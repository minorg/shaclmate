import { Maybe } from "purify-ts";
import type { OptionalKind, VariableStatementStructure } from "ts-morph";
import type { ObjectType } from "./ObjectType.js";
import { objectInitializer } from "./objectInitializer.js";

function graphqlQueryObjectType({
  objectTypes,
}: {
  objectTypes: readonly ObjectType[];
}): string {
  return `new graphql.GraphQLObjectType<null, { objectSet: $ObjectSet }>({ name: "Query", fields: ${objectInitializer(
    objectTypes.reduce(
      (fields, objectType) => {
        fields[objectType.objectSetMethodNames.object] = objectInitializer({
          args: objectInitializer({
            id: objectInitializer({
              type: "new graphql.GraphQLNonNull(graphql.GraphQLID)",
            }),
          }),
          resolve: `\
async (_, { id }: { id: string }, { objectSet }): Promise<${objectType.name}> => (await purify.EitherAsync<Error, ${objectType.name}>(async ({ liftEither }) => liftEither(await objectSet.${objectType.objectSetMethodNames.object}(await liftEither(${objectType.staticModuleName}.Identifier.fromString(id)))))).mapLeft((error) => new graphql.GraphQLError(error.message, { originalError: error })).unsafeCoerce()`,
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
