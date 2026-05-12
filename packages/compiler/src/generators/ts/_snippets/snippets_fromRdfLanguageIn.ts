import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_fromRdfLanguageIn: SnippetFactory = ({
  imports,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}fromRdfLanguageIn`,
    code`\
function ${syntheticNamePrefix}fromRdfLanguageIn(values: ${this.imports.Resource}.Values, languageIn: readonly string[]): ${this.imports.Either}<Error, ${this.imports.Resource}.Values> {
  return values.chainMap(value => value.toLiteral().chain(literal =>
    languageIn.includes(literal.language) ?
      ${this.imports.Right}(value) :
      ${this.imports.Left}(new ${this.imports.Resource}.MistypedTermValueError(${{
        actualValue: code`literal`,
        expectedValueType: "Literal",
        focusResource: code`value.focusResource`,
        propertyPath: code`value.propertyPath`,
      }}))
  ));
}`,
  );
