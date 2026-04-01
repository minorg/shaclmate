import { imports } from "../imports.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

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

  // Return all literals for the first preferredLanguage, then all literals for the second preferredLanguage, etc.
  // Within a preferredLanguage the literals may be in any order.
  let filteredValues: ${imports.Resource}.Values<${imports.Resource}.TermValue> = [];
  for (const preferredLanguage of preferredLanguages) {
    for (const value of values) {
      value.toLiteral().ifLeft(literal => {
        if (literal.language === preferredLanguage) {
          filteredValues.push(value);
        }
      });
    }
  }

  return ${imports.Resource}.Values.fromArray({ focusResource, predicate, values: filteredValues });
}`,
);
