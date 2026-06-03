import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_stringFromRdfResourceValues: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}stringFromRdfResourceValues`,
    code`\
function ${syntheticNamePrefix}stringFromRdfResourceValues<T extends string>(values: ${imports.Resource}.Values, { preferredLanguages, propertySchema }: Parameters<${snippets.FromRdfResourceValuesFunction}<T, ${snippets.StringSchema}<T>>>[1]): ${imports.Either}<Error, ${imports.Resource}.Values<T>> {
  let chain = ${imports.Either}.of(values);
  if (schema.type.languageIn && schema.type.languageIn.length > 0) {
    chain = chain.chain(values => ${snippets.fromRdfLanguageIn}(values, schema.type.languageIn));
  }
  chain = chain.chain(values => ${snippets.fromRdfPreferredLanguages}(values, preferredLanguages));
  return chain.chain(values => values.chainMap(value => value.toString(schema.in)));
}`,
  );
