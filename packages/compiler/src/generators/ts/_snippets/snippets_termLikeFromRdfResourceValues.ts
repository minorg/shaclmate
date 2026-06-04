import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_termLikeFromRdfResourceValues: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}termLikeFromRdfResourceValues`,
    code`\
const ${syntheticNamePrefix}termLikeFromRdfResourceValues:
  ${snippets.FromRdfResourceValuesFunction}<${imports.Resource}.Value, {
    readonly hasValues?: readonly (${imports.Literal} | ${imports.NamedNode})[];
    readonly languageIn?: readonly string[];
  }> = (values, { preferredLanguages, schema: { hasValues, languageIn } }) => {
    let chain = ${imports.Either}.of<Error, ${imports.Resource}.Values>(values);

    if (hasValues && hasValues.length > 0) {
      chain = chain.chain(values => ${imports.Either}.sequence(hasValues.map(hasValue => values.find(value => value.term.equals(hasValue)))).map(() => values));
    }

    if (languageIn && languageIn.length > 0) {
      chain = chain.chain(values => values.chainMap(value => value.toLiteral().chain(literal =>
        languageIn.includes(literal.language) ?
          ${imports.Right}(value) :
          ${imports.Left}(new ${imports.Resource}.MistypedTermValueError(${{
            actualValue: code`literal`,
            expectedValueType: "Literal",
            focusResource: code`value.focusResource`,
            propertyPath: code`value.propertyPath`,
          }}))
      )));
    }

    if (preferredLanguages && preferredLanguages.length > 0) {
      chain = chain.chain(values => {
        // Return all literals for the first preferredLanguage, then all literals for the second preferredLanguage, etc.
        // Within a preferredLanguage the literals may be in any order.
        const filteredValues: ${imports.Resource}.Value[] = [];
        for (const preferredLanguage of preferredLanguages) {
          for (const value of values) {
            value.toLiteral().ifRight(literal => {
              if (literal.language === preferredLanguage) {
                filteredValues.push(value);
              }
            });
          }
        }

        return ${imports.Right}(${imports.Resource}.Values.fromArray({ focusResource: values.focusResource, propertyPath: values.propertyPath, values: filteredValues }));
      });
    }

    return chain;
  };`,
  );
