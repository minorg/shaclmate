import type { AbstractIntersectionType } from "../AbstractIntersectionType.js";
import type { Type } from "../Type.js";
import { type Code, code, joinCode, literalOf } from "../ts-poet-wrapper.js";

export function AbstractIntersectionType_valueSparqlWherePatternsFunctionExpression<
  MemberTypeT extends Type,
>(this: AbstractIntersectionType<MemberTypeT>): Code {
  return code`\
({ filter, schema, ...otherParameters }) => {
  let intersectionPatterns: ${this.reusables.snippets.SparqlPattern}[] = [];

  ${joinCode(
    this.members.map(
      ({ type }, memberI) => code`\
intersectionPatterns = intersectionPatterns.concat(${type.valueSparqlWherePatternsFunction.annotatedUsage}({ ...otherParameters, filter, ignoreRdfType: true, schema: schema.members[${literalOf(memberI)}] }));`,
    ),
  )}
  
  return intersectionPatterns;
}`;
}
