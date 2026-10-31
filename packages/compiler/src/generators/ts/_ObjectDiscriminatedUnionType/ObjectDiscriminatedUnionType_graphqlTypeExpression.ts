import type { ObjectDiscriminatedUnionType } from "../ObjectDiscriminatedUnionType.js";
import { type Code, code, joinCode } from "../ts-poet-wrapper.js";

export function ObjectDiscriminatedUnionType_graphqlTypeExpression(
  this: ObjectDiscriminatedUnionType,
): Code {
  const name = this.name.unsafeCoerce();

  return code`new ${this.reusables.imports.GraphQLUnionType}(${{
    description: this.comment.map(JSON.stringify).extract(),
    name: name,
    resolveType: code`(value: ${name}) => value.${this.configuration.syntheticNamePrefix}type`,
    types: code`[${joinCode(
      this.members.map((member) => member.type.graphqlType.nullableExpression),
      { on: ", " },
    )}]`,
  }});`;
}
