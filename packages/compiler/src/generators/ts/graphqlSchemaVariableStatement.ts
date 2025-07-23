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
            identifier: objectInitializer({
              type: "new graphql.GraphQLNonNull(graphql.GraphQLID)",
            }),
          }),
          resolve: `\
async (_, args: { identifier: string }, { objectSet }): Promise<${objectType.name}> => 
  (await purify.EitherAsync<Error, ${objectType.name}>(async ({ liftEither }) => 
    liftEither(await objectSet.${objectType.objectSetMethodNames.object}(await liftEither(${objectType.staticModuleName}.Identifier.fromString(args.identifier))))
  )).unsafeCoerce()`,
          type: `${objectType.staticModuleName}.GraphQL`,
        });

        fields[objectType.objectSetMethodNames.objects] = objectInitializer({
          args: objectInitializer({
            identifiers: objectInitializer({
              type: "new graphql.GraphQLList(new graphql.GraphQLNonNull(graphql.GraphQLID))",
            }),
            limit: objectInitializer({
              type: "graphql.GraphQLInt",
            }),
            offset: objectInitializer({
              type: "graphql.GraphQLInt",
            }),
          }),
          resolve: `\
async (_, args: { identifiers: readonly string[] | null; limit: number | null; offset: number | null; }, { objectSet }): Promise<readonly ${objectType.name}[]> =>
(await purify.EitherAsync<Error, readonly ${objectType.name}[]>(async ({ liftEither }) => {
  let where: $ObjectSet.Where<${objectType.staticModuleName}.Identifier> | undefined;
  if (args.identifiers) {
    const identifiers: ${objectType.staticModuleName}.Identifier[] = [];
    for (const identifierArg of args.identifiers) {
      identifiers.push(await liftEither(${objectType.staticModuleName}.Identifier.fromString(identifierArg)));
    }
    where = { identifiers, type: "identifiers" };
  }
  const objects: ${objectType.name}[] = [];
  for (const objectEither of await objectSet.${objectType.objectSetMethodNames.objects}({ limit: args.limit !== null ? args.limit : undefined, offset: args.offset !== null ? args.offset : undefined, where })) {
    objects.push(await liftEither(objectEither));
  }
  return objects;
})).unsafeCoerce()`,
          type: `new graphql.GraphQLNonNull(new graphql.GraphQLList(new graphql.GraphQLNonNull(${objectType.staticModuleName}.GraphQL)))`,
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
