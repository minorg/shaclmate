import type { AbstractDiscriminatedUnionType } from "../AbstractDiscriminatedUnionType.js";
import type { Type } from "../Type.js";
import { type Code, code, joinCode } from "../ts-poet-wrapper.js";

export function AbstractDiscriminatedUnionType_toRdfResourceValuesFunctionExpression<
  MemberTypeT extends Type,
>(this: AbstractDiscriminatedUnionType<MemberTypeT>): Code {
  return code`\
(value, _options): (${this.toRdfResourceValueTypesExpression})[] => {
  ${joinCode(
    this.members.map(
      ({ type, unwrap, typeCheck }) =>
        code`if (${typeCheck(code`value`)}) { return ${type.toRdfResourceValuesExpression(
          {
            variables: {
              graph: code`_options.graph`,
              propertyPath: code`_options.propertyPath`,
              resource: code`_options.resource`,
              resourceSet: code`_options.resourceSet`,
              value: unwrap(code`value`),
            },
          },
        )}; }`,
    ),
  )}

  throw new Error("unable to serialize to RDF");
}`;
}
