import { Maybe } from "purify-ts";
import { imports } from "../imports.js";
import type { ObjectType } from "../ObjectType.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { type Code, code, literalOf } from "../ts-poet-wrapper.js";

export function graphqlTypeVariableStatement(this: ObjectType): Maybe<Code> {
  if (!this.features.has("graphql")) {
    return Maybe.empty();
  }

  if (this.synthetic) {
    return Maybe.empty();
  }

  return Maybe.of(code`\
export const ${syntheticNamePrefix}GraphQL = new ${imports.GraphQLObjectType}<${this.name}, { objectSet: ${syntheticNamePrefix}ObjectSet }>(${{
    description: this.comment.map(literalOf).extract(),
    fields: `() => (${this.properties.reduce(
      (fields, property) => {
        property.graphqlField.ifJust((field) => {
          fields[field.name] = {
            args: field.args
              .map((args) =>
                Object.entries(args).reduce(
                  (argObjects, [argName, arg]) => {
                    argObjects[argName] = arg;
                    return argObjects;
                  },
                  {} as Record<string, { type: Code }>,
                ),
              )
              .extract(),
            description: field.description.map(literalOf).extract(),
            name: literalOf(field.name),
            resolve: field.resolve,
            type: field.type,
          };
        });
        return fields;
      },
      {} as Record<string, object>,
    )})`,
    name: `"${this.name}"`,
  }}`);
}
