import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_termFromRdfResourceValues: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}termFromRdfResourceValues`,
    code`\
function ${syntheticNamePrefix}termFromRdfResourceValues<TermT extends ${imports.BlankNode} | ${imports.Literal} | ${imports.NamedNode}>(values: ${imports.Resource}.Values, options: Parameters<${snippets.FromRdfResourceValuesFunction}<TermT, ${snippets.TermSchema}<TermT>>>[1]): ${imports.Either}<Error, ${imports.Resource}.Values<TermT>> {
  const { focusResource, propertyPath, schema } = options;
  return ${snippets.termLikeFromRdfResourceValues}(values, options).chain(values => values.chainMap(value => value.toTerm().chain(term => {
    if (schema.in && schema.in.length > 0 && !schema.in.some(in_ => in_.equals(term))) {
      return ${imports.Left}(new ${imports.Resource}.MistypedTermValueError({ actualValue: term, expectedValueType: "Term in", focusResource, propertyPath }));
    }

    if (!schema.types.some(type => term.termType === type)) {
      return ${imports.Left}(new ${imports.Resource}.MistypedTermValueError({ actualValue: term, expectedValueType: "Term types", focusResource, propertyPath }));
    }

    return ${imports.Right}(term as TermT);
  })));
}`,
  );
