import type { DiscriminatedUnionType } from "../DiscriminatedUnionType.js";
import type { Type } from "../Type.js";
import { type Code, code, joinCode, literalOf } from "../ts-poet-wrapper.js";

export function DiscriminatedUnionType_valueSparqlWherePatternsFunctionExpression<
  MemberTypeT extends Type,
>(this: DiscriminatedUnionType<MemberTypeT>): Code {
  return code`\
((({ filter, schema, ...otherParameters }) => {
  const unionPatterns: ${this.reusables.imports.sparqljs}.GroupPattern[] = [];

  ${joinCode(
    this.members.map(
      ({ type, primaryDiscriminantValue }) => code`\
unionPatterns.push({ patterns: ${type.valueSparqlWherePatternsFunction}({ ...otherParameters, filter: filter?.on?.[${literalOf(primaryDiscriminantValue)}], ignoreRdfType: false, schema: schema.members[${literalOf(primaryDiscriminantValue)}].type }).concat(), type: "group" });`,
    ),
  )}
  
  return [{ patterns: unionPatterns, type: "union" }];
}) satisfies ${this.reusables.snippets.ValueSparqlWherePatternsFunction}<${this.filterType}, ${this.schemaType}>)`;
}
