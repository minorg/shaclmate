import type { DiscriminatedUnionType } from "../DiscriminatedUnionType.js";
import type { Type } from "../Type.js";
import { type Code, code, joinCode } from "../ts-poet-wrapper.js";

export function DiscriminatedUnionType_toRdfResourceValuesFunctionExpression<
  MemberTypeT extends Type,
>(this: DiscriminatedUnionType<MemberTypeT>): Code {
  return code`\
  (((value, _options): (${joinCode(
    [...this.toRdfResourceValueTypes].map((toRdfResourceValueType) => {
      switch (toRdfResourceValueType) {
        case "BlankNode":
          return code`${this.reusables.imports.BlankNode}`;
        case "Literal":
          return code`${this.reusables.imports.Literal}`;
        case "NamedNode":
          return code`${this.reusables.imports.NamedNode}`;
        default:
          toRdfResourceValueType satisfies never;
          throw new Error();
      }
    }),
    { on: " | " },
  )})[] => {
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
  }) satisfies ${this.reusables.snippets.ToRdfResourceValuesFunction}<${this.expression}>)`;
}
