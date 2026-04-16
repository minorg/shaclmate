import { Maybe } from "purify-ts";
import { imports } from "../imports.js";
import type { ObjectUnionType } from "../ObjectUnionType.js";
import { snippets } from "../snippets.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { type Code, code } from "../ts-poet-wrapper.js";

export function ObjectUnionType_fromRdfFunctionDeclaration(
  this: ObjectUnionType,
): Maybe<Code> {
  if (!this.features.has("rdf")) {
    return Maybe.empty();
  }

  return Maybe.of(code`\
export function ${syntheticNamePrefix}fromRdf(resource: ${imports.Resource}, options?: ${snippets.FromRdfOptions}): ${imports.Either}<Error, ${this.name}> {
  return ${this.concreteMemberTypes.reduce(
    (expression, memberType) => {
      const memberTypeExpression = code`(${memberType.staticModuleName}.${syntheticNamePrefix}fromRdf(resource, { ...options, ignoreRdfType: false }) as ${imports.Either}<Error, ${this.name}>)`;
      return expression !== null
        ? code`${expression}.altLazy(() => ${memberTypeExpression})`
        : memberTypeExpression;
    },
    null as Code | null,
  )};
}`);
}
