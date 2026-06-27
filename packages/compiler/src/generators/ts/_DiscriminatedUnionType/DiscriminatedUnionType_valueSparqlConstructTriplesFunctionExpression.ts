import type { DiscriminatedUnionType } from "../DiscriminatedUnionType.js";
import type { Type } from "../Type.js";
import { type Code, code, joinCode, literalOf } from "../ts-poet-wrapper.js";

export function DiscriminatedUnionType_valueSparqlConstructTriplesFunctionExpression<
  MemberTypeT extends Type,
>(this: DiscriminatedUnionType<MemberTypeT>): Code {
  return code`\
((({ ignoreRdfType, filter, schema, ...otherParameters }) => {
  let triples: ${this.reusables.imports.sparqljs}.Triple[] = [];

  ${joinCode(
    this.members.map(
      ({ type, primaryDiscriminantValue }) => code`\
triples = triples.concat(${type.valueSparqlConstructTriplesFunction}({ ...otherParameters, filter: filter?.on?.[${literalOf(primaryDiscriminantValue)}], ignoreRdfType: false, schema: schema.members[${literalOf(primaryDiscriminantValue)}].type }));`,
    ),
  )}
  
  return triples;
}) satisfies ${this.reusables.snippets.ValueSparqlConstructTriplesFunction}<${this.filterType}, ${this.schemaType}>)`;
}
