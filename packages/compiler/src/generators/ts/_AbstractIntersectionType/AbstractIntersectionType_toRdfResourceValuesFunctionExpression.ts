import type { AbstractIntersectionType } from "../AbstractIntersectionType.js";
import type { Type } from "../Type.js";
import { type Code, code, joinCode } from "../ts-poet-wrapper.js";

export function AbstractIntersectionType_toRdfResourceValuesFunctionExpression<
  MemberTypeT extends Type,
>(this: AbstractIntersectionType<MemberTypeT>): Code {
  return code`\
  (value, _options) => {
    let rdfResourceValues: (${this.toRdfResourceValueTypesExpression})[] = [];
  ${joinCode(
    this.members.map(
      ({ type }) =>
        code`rdfResourceValues = rdfResourceValues.concat(${type.toRdfResourceValuesExpression(
          {
            variables: {
              graph: code`_options.graph`,
              propertyPath: code`_options.propertyPath`,
              resource: code`_options.resource`,
              resourceSet: code`_options.resourceSet`,
              value: code`value`,
            },
          },
        )});`,
    ),
  )}
    return rdfResourceValues;
  }`;
}
