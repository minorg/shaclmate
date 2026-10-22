import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_filterIdentifier: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}filterIdentifier`,
    code`\
const ${syntheticNamePrefix}filterIdentifier: ${snippets.FilterFunction}<${snippets.IdentifierFilter}, ${imports.BlankNode} | ${imports.NamedNode}> = (filter, value) => {
  if (filter.in !== undefined && !filter.in.some(inValue => inValue.equals(value))) {
    return false;
  }

  if (filter.type !== undefined && value.termType !== filter.type) {
    return false;
  }

  return true;
}`,
  );
