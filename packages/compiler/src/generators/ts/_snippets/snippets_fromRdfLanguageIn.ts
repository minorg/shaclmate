import { imports } from "../imports.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_fromRdfLanguageIn = conditionalOutput(
  `${syntheticNamePrefix}fromRdfLanguageIn`,
  code`\
function ${syntheticNamePrefix}fromRdfLanguageIn(
  { focusResource, languageIn, predicate, values }: {
    focusResource: ${imports.Resource};
    languageIn: readonly string[];
    predicate: ${imports.NamedNode};
    values: ${imports.Resource}.Values
  }): ${imports.Either}<Error, ${imports.Resource}.Values> {
    return values.chainMap(value => value.toLiteral().chain(literal =>
      languageIn.includes(literal.language) ?
        ${imports.Right}(value) :
        ${imports.Left}(new ${imports.Resource}.MistypedTermValueError(${{
          actualValue: code`literal`,
          expectedValueType: "Literal",
          focusResource: code`focusResource`,
          propertyPath: code`predicate`,
        }}))
    ));
}`,
);
