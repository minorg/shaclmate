import { code, conditionalOutput } from "ts-poet";
import { imports } from "../imports.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";

export const snippets_fromRdfPreferredLanguages = conditionalOutput(
  `${syntheticNamePrefix}fromRdfPreferredLanguages`,
  code`\
function ${syntheticNamePrefix}fromRdfPreferredLanguages(
  { focusResource, predicate, preferredLanguages, values }: {
    focusResource: ${imports.Resource};
    predicate: ${imports.NamedNode};
    preferredLanguages?: readonly string[];
    values: ${imports.Resource}.Values<${imports.Resource}.TermValue>
  }): ${imports.Either}<Error, ${imports.Resource}.Values<${imports.Resource}.TermValue>> {
  if (!preferredLanguages || preferredLanguages.length === 0) {
    return ${imports.Either}.of<Error, ${imports.Resource}.Values<${imports.Resource}.TermValue>>(values);
  }

  return values.chainMap(value => value.toLiteral()).map(literalValues => {
    // Return all literals for the first preferredLanguage, then all literals for the second preferredLanguage, etc.
    // Within a preferredLanguage the literals may be in any order.
    let filteredLiteralValues: ${imports.Resource}.Values<${imports.Literal}> | undefined;
    for (const preferredLanguage of preferredLanguages) {
      if (!filteredLiteralValues) {
        filteredLiteralValues = literalValues.filter(value => value.language === preferredLanguage);
      } else {
        filteredLiteralValues = filteredLiteralValues.concat(...literalValues.filter(value => value.language === preferredLanguage).toArray());
      }
    }

    return filteredLiteralValues!.map(literalValue => new ${imports.Resource}.TermValue({ focusResource, predicate, term: literalValue }));
  });
}`,
);
