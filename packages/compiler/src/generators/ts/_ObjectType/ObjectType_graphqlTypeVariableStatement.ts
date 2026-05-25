import { Maybe } from "purify-ts";
import type { ObjectType } from "../ObjectType.js";
import { type Code, code } from "../ts-poet-wrapper.js";

export function ObjectType_graphqlTypeVariableStatement(
  this: ObjectType,
): Maybe<Code> {
  if (!this.configuration.features.has("GraphQL")) {
    return Maybe.empty();
  }

  if (this.synthetic) {
    return Maybe.empty();
  }

  return Maybe.of(code`\
export const GraphQL = new ${this.reusables.imports.GraphQLObjectType}<${this.expression}, { objectSet: ${this.configuration.syntheticNamePrefix}ObjectSet }>(${{
    description: this.comment.extract(),
    fields: code`() => (${this.properties.reduce(
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
            description: field.description.extract(),
            name: field.name,
            resolve: field.resolve,
            type: field.type,
          };
        });
        return fields;
      },
      {} as Record<string, object>,
    )})`,
    name: this.alias.unsafeCoerce(),
  }});`);
}
