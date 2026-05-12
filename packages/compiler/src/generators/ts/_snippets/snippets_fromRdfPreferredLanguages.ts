import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_fromRdfPreferredLanguages: SnippetFactory = ({
  imports,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}fromRdfPreferredLanguages`,
    code`\
function ${syntheticNamePrefix}fromRdfPreferredLanguages(values: ${this.imports.Resource}.Values, preferredLanguages?: readonly string[]): ${this.imports.Either}<Error, ${this.imports.Resource}.Values> {
  if (!preferredLanguages || preferredLanguages.length === 0) {
    return ${this.imports.Right}(values);
  }

  // Return all literals for the first preferredLanguage, then all literals for the second preferredLanguage, etc.
  // Within a preferredLanguage the literals may be in any order.
  let filteredValues: ${this.imports.Resource}.Value[] = [];
  for (const preferredLanguage of preferredLanguages) {
    for (const value of values) {
      value.toLiteral().ifRight(literal => {
        if (literal.language === preferredLanguage) {
          filteredValues.push(value);
        }
      });
    }
  }

  return ${this.imports.Right}(${this.imports.Resource}.Values.fromArray({ focusResource: values.focusResource, propertyPath: values.propertyPath, values: filteredValues }));
}`,
  );
