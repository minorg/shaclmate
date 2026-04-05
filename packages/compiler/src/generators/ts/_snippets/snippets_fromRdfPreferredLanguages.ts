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
    values: ${imports.Resource}.Values
  }): ${imports.Either}<Error, ${imports.Resource}.Values> {
  if (!preferredLanguages || preferredLanguages.length === 0) {
    return ${imports.Either}.of<Error, ${imports.Resource}.Values>(values);
  }

  // Return all literals for the first preferredLanguage, then all literals for the second preferredLanguage, etc.
  // Within a preferredLanguage the literals may be in any order.
  let filteredValues: ${imports.Resource}.Value[] = [];
  for (const preferredLanguage of preferredLanguages) {
    for (const value of values) {
      value.toLiteral().ifRight(literal => {
        if (literal.language === preferredLanguage) {
          filteredValues.push(value);
        }
      });
    }
  }

  return ${imports.Resource}.Values.fromArray({ focusResource, propertyPath: predicate, values: filteredValues });
}`,
);
