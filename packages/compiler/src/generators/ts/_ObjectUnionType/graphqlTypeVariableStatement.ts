import { Maybe } from "purify-ts";
import { imports } from "../imports.js";
import type { ObjectUnionType } from "../ObjectUnionType.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { type Code, code, joinCode } from "../ts-poet-wrapper.js";

export function graphqlTypeVariableStatement(
  this: ObjectUnionType,
): Maybe<Code> {
  if (!this.features.has("graphql")) {
    return Maybe.empty();
  }

  return Maybe.of(code`\
export const ${syntheticNamePrefix}GraphQL = new ${imports.GraphQLUnionType}(${{
    description: this.comment.map(JSON.stringify).extract(),
    name: this.name,
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
