import { Maybe } from "purify-ts";
import type { OptionalKind, VariableStatementStructure } from "ts-morph";
import type { ObjectType } from "./ObjectType.js";
import type { ObjectUnionType } from "./ObjectUnionType.js";
import { objectInitializer } from "./objectInitializer.js";

function graphqlQueryObjectType({
  objectTypes,
  objectUnionTypes,
}: {
  objectTypes: readonly ObjectType[];
  objectUnionTypes: readonly ObjectUnionType[];
}): string {
  return `new graphql.GraphQLObjectType<null, { objectSet: $ObjectSet }>({ name: "Query", fields: ${objectInitializer(
    [...objectTypes, ...objectUnionTypes].reduce(
      (fields, objectType) => {
        fields[objectType.objectSetMethodNames.object] = objectInitializer({
          args: objectInitializer({
            identifier: objectInitializer({
              type: "new graphql.GraphQLNonNull(graphql.GraphQLID)",
            }),
          }),
          resolve: `\
async (_source, args: { identifier: string }, { objectSet }): Promise<${objectType.name}> => 
  (await purify.EitherAsync<Error, ${objectType.name}>(async ({ liftEither }) => 
    liftEither(await objectSet.${objectType.objectSetMethodNames.object}(await liftEither(${objectType.identifierTypeAlias}.fromString(args.identifier))))
  )).unsafeCoerce()`,
          type: `${objectType.staticModuleName}.GraphQL`,
        });

        fields[objectType.objectSetMethodNames.objectIdentifiers] =
          objectInitializer({
            args: objectInitializer({
              limit: objectInitializer({
                type: "graphql.GraphQLInt",
              }),
              offset: objectInitializer({
                type: "graphql.GraphQLInt",
              }),
            }),
            resolve: `\
 async (_source, args: { limit: number | null; offset: number | null; }, { objectSet }): Promise<readonly string[]> =>
  (await objectSet.${objectType.objectSetMethodNames.objectIdentifiers}({ limit: args.limit !== null ? args.limit : undefined, offset: args.offset !== null ? args.offset : undefined })).unsafeCoerce().map(${objectType.identifierTypeAlias}.toString)`,
            type: "new graphql.GraphQLNonNull(new graphql.GraphQLList(graphql.GraphQLString))",
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
async (_source, args: { identifiers: readonly string[] | null; limit: number | null; offset: number | null; }, { objectSet }): Promise<readonly ${objectType.name}[]> =>
(await purify.EitherAsync<Error, readonly ${objectType.name}[]>(async ({ liftEither }) => {
  let where: $ObjectSet.Where<${objectType.identifierTypeAlias}> | undefined;
  if (args.identifiers) {
    const identifiers: ${objectType.identifierTypeAlias}[] = [];
    for (const identifierArg of args.identifiers) {
      identifiers.push(await liftEither(${objectType.identifierTypeAlias}.fromString(identifierArg)));
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

        fields[objectType.objectSetMethodNames.objectsCount] =
          objectInitializer({
            resolve: `\
async (_source, _args, { objectSet }): Promise<number> => (await objectSet.${objectType.objectSetMethodNames.objectsCount}()).unsafeCoerce()`,
            type: "new graphql.GraphQLNonNull(graphql.GraphQLInt)",
          });

        return fields;
      },
      {} as Record<string, string>,
    ),
  )} })`;
}

export function graphqlSchemaVariableStatement(parameters: {
  objectTypes: readonly ObjectType[];
  objectUnionTypes: ObjectUnionType[];
}): Maybe<OptionalKind<VariableStatementStructure>> {
  const objectTypes = parameters.objectTypes.filter((objectType) =>
    objectType.features.has("graphql"),
  );
  const objectUnionTypes = parameters.objectUnionTypes.filter(
    (objectUnionType) => objectUnionType.features.has("graphql"),
  );

  if (objectTypes.length === 0) {
    return Maybe.empty();
  }

  return Maybe.of({
    isExported: true,
    declarations: [
      {
        name: "graphqlSchema",
        initializer: `new graphql.GraphQLSchema({ query: ${graphqlQueryObjectType({ objectTypes, objectUnionTypes })} })`,
      },
    ],
  });
}
