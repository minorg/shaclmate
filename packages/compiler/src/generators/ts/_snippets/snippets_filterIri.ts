import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_filterIri: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}filterIri`,
    code`\
const ${syntheticNamePrefix}filterIri: ${snippets.FilterFunction}<${snippets.IriFilter}, ${imports.NamedNode}> = (filter, value) => {
  if (filter.in !== undefined && !filter.in.some(inValue => inValue.equals(value))) {
    return false;
  }

  return true;
}`,
  );
