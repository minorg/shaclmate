import type { AbstractIntersectionType } from "../AbstractIntersectionType.js";
import type { Type } from "../Type.js";
import { type Code, code, joinCode, literalOf } from "../ts-poet-wrapper.js";

export function AbstractIntersectionType_valueSparqlConstructTriplesFunctionExpression<
  MemberTypeT extends Type,
>(this: AbstractIntersectionType<MemberTypeT>): Code {
  return code`\
({ ignoreRdfType, filter, schema, ...otherParameters }) => {
  let triples: ${this.reusables.imports.sparqljs}.Triple[] = [];

  ${joinCode(
    this.members.map(
      ({ type }, memberI) => code`\
triples = triples.concat(${type.valueSparqlConstructTriplesFunction.annotatedUsage}({ ...otherParameters, filter, ignoreRdfType: true, schema: schema.members[${literalOf(memberI)}] }));`,
    ),
  )}
  
  return triples;
}`;
}
