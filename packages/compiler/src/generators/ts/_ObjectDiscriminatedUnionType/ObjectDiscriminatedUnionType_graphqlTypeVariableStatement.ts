import type { ObjectDiscriminatedUnionType } from "../ObjectDiscriminatedUnionType.js";
import { singleEntryRecord } from "../singleEntryRecord.js";
import { type Code, code, joinCode } from "../ts-poet-wrapper.js";

export function ObjectDiscriminatedUnionType_graphqlTypeVariableStatement(
  this: ObjectDiscriminatedUnionType,
): Record<string, Code> {
  if (!this.configuration.features.has("GraphQL")) {
    return {};
  }

  const name = this.name.unsafeCoerce();

  return singleEntryRecord(
    `GraphQL`,
    code`\
export const GraphQL = new ${this.reusables.imports.GraphQLUnionType}(${{
      description: this.comment.map(JSON.stringify).extract(),
      name: name,
      resolveType: code`(value: ${name}) => value.${this.configuration.syntheticNamePrefix}type`,
      types: code`[${joinCode(
        this.members.map(
          (member) => member.type.graphqlType.nullableExpression,
        ),
        { on: ", " },
      )}]`,
    }});`,
  );
}
