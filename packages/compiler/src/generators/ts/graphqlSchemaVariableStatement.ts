import { Maybe } from "purify-ts";

import type { NamedObjectType } from "./NamedObjectType.js";
import type { NamedObjectUnionType } from "./NamedObjectUnionType.js";
import type { TsGenerator } from "./TsGenerator.js";
import { type Code, code } from "./ts-poet-wrapper.js";

function graphqlQueryObjectType(
  this: TsGenerator,
  {
    namedObjectTypes,
    namedObjectUnionTypes,
  }: {
    namedObjectTypes: readonly NamedObjectType[];
    namedObjectUnionTypes: readonly NamedObjectUnionType[];
  },
): Code {
  const syntheticNamePrefix = this.configuration.syntheticNamePrefix;

  return code`new ${this.reusables.imports.GraphQLObjectType}<null, { objectSet: ${syntheticNamePrefix}ObjectSet }>({ name: "Query", fields: ${[
    ...namedObjectTypes,
    ...namedObjectUnionTypes,
  ].reduce(
    (fields, namedObjectType) => {
      fields[namedObjectType.objectSetMethodNames.object] = {
        args: {
          identifier: {
            type: code`new ${this.reusables.imports.GraphQLNonNull}(${this.reusables.imports.GraphQLID})`,
          },
        },
        resolve: code`\
async (_source, args: { identifier: string }, { objectSet }): Promise<${namedObjectType.name}> => 
  (await ${this.reusables.imports.EitherAsync}<Error, ${namedObjectType.name}>(async ({ liftEither }) => 
    liftEither(await objectSet.${namedObjectType.objectSetMethodNames.object}(await liftEither(${namedObjectType.identifierTypeAlias}.parse(args.identifier))))
  )).unsafeCoerce()`,
        type: namedObjectType.graphqlType.name,
      };

      fields[namedObjectType.objectSetMethodNames.objectIdentifiers] = {
        args: {
          limit: {
            type: code`${this.reusables.imports.GraphQLInt}`,
          },
          offset: {
            type: code`${this.reusables.imports.GraphQLInt}`,
          },
        },
        resolve: code`\
 async (_source, args: { limit: number | null; offset: number | null; }, { objectSet }): Promise<readonly string[]> =>
  (await objectSet.${namedObjectType.objectSetMethodNames.objectIdentifiers}({ limit: args.limit !== null ? args.limit : undefined, offset: args.offset !== null ? args.offset : undefined })).unsafeCoerce().map(${namedObjectType.identifierTypeAlias}.stringify)`,
        type: code`new ${this.reusables.imports.GraphQLNonNull}(new ${this.reusables.imports.GraphQLList}(${this.reusables.imports.GraphQLString}))`,
      };

      fields[namedObjectType.objectSetMethodNames.objects] = {
        args: {
          identifiers: {
            type: code`new ${this.reusables.imports.GraphQLList}(new ${this.reusables.imports.GraphQLNonNull}(${this.reusables.imports.GraphQLID}))`,
          },
          limit: {
            type: code`${this.reusables.imports.GraphQLInt}`,
          },
          offset: {
            type: code`${this.reusables.imports.GraphQLInt}`,
          },
        },
        resolve: code`\
async (_source, args: { identifiers: readonly string[] | null; limit: number | null; offset: number | null; }, { objectSet }): Promise<readonly ${namedObjectType.name}[]> =>
(await ${this.reusables.imports.EitherAsync}<Error, readonly ${namedObjectType.name}[]>(async ({ liftEither }) => {
  let filter: ${namedObjectType.filterType} | undefined;
  if (args.identifiers) {
    const identifiers: ${namedObjectType.identifierTypeAlias}[] = [];
    for (const identifierArg of args.identifiers) {
      identifiers.push(await liftEither(${namedObjectType.identifierTypeAlias}.parse(identifierArg)));
    }
    filter = { ${syntheticNamePrefix}identifier: { in: identifiers } };
  }
  return await liftEither(await objectSet.${namedObjectType.objectSetMethodNames.objects}({ filter, limit: args.limit !== null ? args.limit : undefined, offset: args.offset !== null ? args.offset : undefined }));
})).unsafeCoerce()`,
        type: code`new ${this.reusables.imports.GraphQLNonNull}(new ${this.reusables.imports.GraphQLList}(${namedObjectType.graphqlType.name}))`,
      };

      fields[namedObjectType.objectSetMethodNames.objectCount] = {
        resolve: code`\
async (_source, _args, { objectSet }): Promise<number> => (await objectSet.${namedObjectType.objectSetMethodNames.objectCount}()).unsafeCoerce()`,
        type: code`new ${this.reusables.imports.GraphQLNonNull}(${this.reusables.imports.GraphQLInt})`,
      };

      return fields;
    },
    {} as Record<string, object>,
  )} })`;
}

export function graphqlSchemaVariableStatement(
  this: TsGenerator,
  {
    namedObjectTypes,
    namedObjectUnionTypes,
  }: {
    namedObjectTypes: readonly NamedObjectType[];
    namedObjectUnionTypes: NamedObjectUnionType[];
  },
): Maybe<Code> {
  if (!this.configuration.features.has("graphql")) {
    return Maybe.empty();
  }

  namedObjectTypes = namedObjectTypes.filter(
    (namedObjectType) => !namedObjectType.synthetic,
  );
  if (namedObjectTypes.length === 0) {
    return Maybe.empty();
  }

  namedObjectUnionTypes = namedObjectUnionTypes.filter(
    (namedObjectUnionType) => !namedObjectUnionType.synthetic,
  );

  return Maybe.of(code`\
export const graphqlSchema = new ${this.reusables.imports.GraphQLSchema}({ query: ${graphqlQueryObjectType.call(this, { namedObjectTypes: namedObjectTypes, namedObjectUnionTypes })} });
`);
}
