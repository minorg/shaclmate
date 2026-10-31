import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_filterString: SnippetFactory = ({
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}filterString`,
    code`\
const ${syntheticNamePrefix}filterString: ${snippets.FilterFunction}<${snippets.StringFilter}, string> = (filter, value) => {
  if (filter.in !== undefined && !filter.in.some(inValue => inValue === value)) {
    return false;
  }

  if (filter.maxLength !== undefined && value.length > filter.maxLength) {
    return false;
  }

  if (filter.minLength !== undefined && value.length < filter.minLength) {
    return false;
  }

  return true;
}`,
  );
