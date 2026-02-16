import { Maybe } from "purify-ts";
import { imports } from "./imports.js";
import type { ObjectType } from "./ObjectType.js";
import type { ObjectUnionType } from "./ObjectUnionType.js";
import { syntheticNamePrefix } from "./syntheticNamePrefix.js";
import { type Code, code } from "./ts-poet-wrapper.js";

function graphqlQueryObjectType({
  objectTypes,
  objectUnionTypes,
}: {
  objectTypes: readonly ObjectType[];
  objectUnionTypes: readonly ObjectUnionType[];
}): Code {
  return code`new ${imports.GraphQLObjectType}<null, { objectSet: ${syntheticNamePrefix}ObjectSet }>({ name: "Query", fields: ${[
    ...objectTypes,
    ...objectUnionTypes,
  ].reduce(
    (fields, objectType) => {
      fields[objectType.objectSetMethodNames.object] = {
        args: {
          identifier: {
            type: code`new ${imports.GraphQLNonNull}(${imports.GraphQLID})`,
          },
        },
        resolve: code`\
async (_source, args: { identifier: string }, { objectSet }): Promise<${objectType.name}> => 
  (await ${imports.EitherAsync}<Error, ${objectType.name}>(async ({ liftEither }) => 
    liftEither(await objectSet.${objectType.objectSetMethodNames.object}(await liftEither(${objectType.identifierTypeAlias}.fromString(args.identifier))))
  )).unsafeCoerce()`,
        type: objectType.graphqlType.name,
      };

      fields[objectType.objectSetMethodNames.objectIdentifiers] = {
        args: {
          limit: {
            type: code`${imports.GraphQLInt}`,
          },
          offset: {
            type: code`${imports.GraphQLInt}`,
          },
        },
        resolve: code`\
 async (_source, args: { limit: number | null; offset: number | null; }, { objectSet }): Promise<readonly string[]> =>
  (await objectSet.${objectType.objectSetMethodNames.objectIdentifiers}({ limit: args.limit !== null ? args.limit : undefined, offset: args.offset !== null ? args.offset : undefined })).unsafeCoerce().map(${objectType.identifierTypeAlias}.toString)`,
        type: code`new ${imports.GraphQLNonNull}(new ${imports.GraphQLList}(${imports.GraphQLString}))`,
      };

      fields[objectType.objectSetMethodNames.objects] = {
        args: {
          identifiers: {
            type: code`new ${imports.GraphQLList}(new ${imports.GraphQLNonNull}(${imports.GraphQLID}))`,
          },
          limit: {
            type: code`${imports.GraphQLInt}`,
          },
          offset: {
            type: code`${imports.GraphQLInt}`,
          },
        },
        resolve: code`\
async (_source, args: { identifiers: readonly string[] | null; limit: number | null; offset: number | null; }, { objectSet }): Promise<readonly ${objectType.name}[]> =>
(await ${imports.EitherAsync}<Error, readonly ${objectType.name}[]>(async ({ liftEither }) => {
  let filter: ${objectType.filterType} | undefined;
  if (args.identifiers) {
    const identifiers: ${objectType.identifierTypeAlias}[] = [];
    for (const identifierArg of args.identifiers) {
      identifiers.push(await liftEither(${objectType.identifierTypeAlias}.fromString(identifierArg)));
    }
    filter = { ${syntheticNamePrefix}identifier: { in: identifiers } };
  }
  return await liftEither(await objectSet.${objectType.objectSetMethodNames.objects}({ filter, limit: args.limit !== null ? args.limit : undefined, offset: args.offset !== null ? args.offset : undefined }));
})).unsafeCoerce()`,
        type: code`new ${imports.GraphQLNonNull}(new ${imports.GraphQLList}(${objectType.graphqlType.name}))`,
      };

      fields[objectType.objectSetMethodNames.objectsCount] = {
        resolve: code`\
async (_source, _args, { objectSet }): Promise<number> => (await objectSet.${objectType.objectSetMethodNames.objectsCount}()).unsafeCoerce()`,
        type: code`new ${imports.GraphQLNonNull}(${imports.GraphQLInt})`,
      };

      return fields;
    },
    {} as Record<string, object>,
  )} })`;
}

export function graphqlSchemaVariableStatement(parameters: {
  objectTypes: readonly ObjectType[];
  objectUnionTypes: ObjectUnionType[];
}): Maybe<Code> {
  const objectTypes = parameters.objectTypes.filter(
    (objectType) => objectType.features.has("graphql") && !objectType.synthetic,
  );
  const objectUnionTypes = parameters.objectUnionTypes.filter(
    (objectUnionType) => objectUnionType.features.has("graphql"),
  );

  if (objectTypes.length === 0) {
    return Maybe.empty();
  }

  return Maybe.of(code`\
export const graphqlSchema = new ${imports.GraphQLSchema}({ query: ${graphqlQueryObjectType({ objectTypes, objectUnionTypes })} });
`);
}
