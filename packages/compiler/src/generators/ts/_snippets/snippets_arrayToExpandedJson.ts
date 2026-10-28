import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_arrayToExpandedJson: SnippetFactory = ({
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}arrayToExpandedJson`,
    code`\
function ${syntheticNamePrefix}arrayToExpandedJson<ItemT, ItemExpandedJsonT>(itemToExpandedJson: ${snippets.ToExpandedJsonFunction}<ItemExpandedJsonT, ItemT, ItemSchemaT>, key: "@list" | "@set"): ${snippets.ToExpandedJsonFunction}<ItemT[], ItemExpandedJsonT[]> {
  return (values) => {
    const valuesExpandedJson = values.map(itemToExpandedJson);
    return key === "@list" ? { "@list": valuesExpandedJson } : { "@set": valuesExpandedJson };
  }
}`,
  );
