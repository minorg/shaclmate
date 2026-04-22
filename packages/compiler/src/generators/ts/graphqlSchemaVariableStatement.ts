import { Maybe } from "purify-ts";
import { imports } from "./imports.js";
import type { NamedObjectType } from "./NamedObjectType.js";
import type { NamedObjectUnionType } from "./NamedObjectUnionType.js";
import { syntheticNamePrefix } from "./syntheticNamePrefix.js";
import { type Code, code } from "./ts-poet-wrapper.js";

function graphqlQueryObjectType({
  namedObjectTypes,
  namedObjectUnionTypes,
}: {
  namedObjectTypes: readonly NamedObjectType[];
  namedObjectUnionTypes: readonly NamedObjectUnionType[];
}): Code {
  return code`new ${imports.GraphQLObjectType}<null, { objectSet: ${syntheticNamePrefix}ObjectSet }>({ name: "Query", fields: ${[
    ...namedObjectTypes,
    ...namedObjectUnionTypes,
  ].reduce(
    (fields, namedObjectType) => {
      fields[namedObjectType.objectSetMethodNames.object] = {
        args: {
          identifier: {
            type: code`new ${imports.GraphQLNonNull}(${imports.GraphQLID})`,
          },
        },
        resolve: code`\
async (_source, args: { identifier: string }, { objectSet }): Promise<${namedObjectType.name}> => 
  (await ${imports.EitherAsync}<Error, ${namedObjectType.name}>(async ({ liftEither }) => 
    liftEither(await objectSet.${namedObjectType.objectSetMethodNames.object}(await liftEither(${namedObjectType.identifierTypeAlias}.fromString(args.identifier))))
  )).unsafeCoerce()`,
        type: namedObjectType.graphqlType.name,
      };

      fields[namedObjectType.objectSetMethodNames.objectIdentifiers] = {
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
  (await objectSet.${namedObjectType.objectSetMethodNames.objectIdentifiers}({ limit: args.limit !== null ? args.limit : undefined, offset: args.offset !== null ? args.offset : undefined })).unsafeCoerce().map(${namedObjectType.identifierTypeAlias}.toString)`,
        type: code`new ${imports.GraphQLNonNull}(new ${imports.GraphQLList}(${imports.GraphQLString}))`,
      };

      fields[namedObjectType.objectSetMethodNames.objects] = {
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
async (_source, args: { identifiers: readonly string[] | null; limit: number | null; offset: number | null; }, { objectSet }): Promise<readonly ${namedObjectType.name}[]> =>
(await ${imports.EitherAsync}<Error, readonly ${namedObjectType.name}[]>(async ({ liftEither }) => {
  let filter: ${namedObjectType.filterType} | undefined;
  if (args.identifiers) {
    const identifiers: ${namedObjectType.identifierTypeAlias}[] = [];
    for (const identifierArg of args.identifiers) {
      identifiers.push(await liftEither(${namedObjectType.identifierTypeAlias}.fromString(identifierArg)));
    }
    filter = { ${syntheticNamePrefix}identifier: { in: identifiers } };
  }
  return await liftEither(await objectSet.${namedObjectType.objectSetMethodNames.objects}({ filter, limit: args.limit !== null ? args.limit : undefined, offset: args.offset !== null ? args.offset : undefined }));
})).unsafeCoerce()`,
        type: code`new ${imports.GraphQLNonNull}(new ${imports.GraphQLList}(${namedObjectType.graphqlType.name}))`,
      };

      fields[namedObjectType.objectSetMethodNames.objectCount] = {
        resolve: code`\
async (_source, _args, { objectSet }): Promise<number> => (await objectSet.${namedObjectType.objectSetMethodNames.objectCount}()).unsafeCoerce()`,
        type: code`new ${imports.GraphQLNonNull}(${imports.GraphQLInt})`,
      };

      return fields;
    },
    {} as Record<string, object>,
  )} })`;
}

export function graphqlSchemaVariableStatement(parameters: {
  namedObjectTypes: readonly NamedObjectType[];
  namedObjectUnionTypes: NamedObjectUnionType[];
}): Maybe<Code> {
  const namedObjectTypes = parameters.namedObjectTypes.filter(
    (namedObjectType) =>
      namedObjectType.features.has("graphql") && !namedObjectType.synthetic,
  );
  const namedObjectUnionTypes = parameters.namedObjectUnionTypes.filter(
    (namedObjectUnionType) => namedObjectUnionType.features.has("graphql"),
  );

  if (namedObjectTypes.length === 0) {
    return Maybe.empty();
  }

  return Maybe.of(code`\
export const graphqlSchema = new ${imports.GraphQLSchema}({ query: ${graphqlQueryObjectType({ namedObjectTypes: namedObjectTypes, namedObjectUnionTypes })} });
`);
}
