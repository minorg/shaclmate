import { Maybe } from "purify-ts";
import { type Code, code, joinCode, literalOf } from "ts-poet";
import type { ObjectUnionType } from "../ObjectUnionType.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";

export function graphqlTypeVariableStatement(
  this: ObjectUnionType,
): Maybe<Code> {
  if (!this.features.has("graphql")) {
    return Maybe.empty();
  }

  return Maybe.of(code`\
export const ${syntheticNamePrefix}GraphQL = new graphql.GraphQLUnionType(${{
    description: this.comment.map(JSON.stringify).extract(),
    name: literalOf(this.nameString),
    resolveType: code`(value: ${this.name}) => value.${syntheticNamePrefix}type`,
    types: code`[${joinCode(
      this.concreteMemberTypes.map(
        (memberType) => memberType.graphqlType.nullableName,
      ),
      { on: ", " },
    )}]`,
  }});
`);
}
