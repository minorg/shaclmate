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
function ${syntheticNamePrefix}filterIri(filter: ${this.snippets.IriFilter}, value: ${this.imports.NamedNode}) {
  if (filter.in !== undefined && !filter.in.some(inValue => inValue.equals(value))) {
    return false;
  }

  return true;
}`,
  );
