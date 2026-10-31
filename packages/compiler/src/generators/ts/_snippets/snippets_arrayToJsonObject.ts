import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_arrayToJsonObject: SnippetFactory = ({
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}arrayToJsonObject`,
    code`\
function ${syntheticNamePrefix}arrayToJsonObject<ItemT, ItemJsonObjectT>(itemToJsonObject: ${snippets.ToJsonObjectFunction}<ItemJsonObjectT, ItemT, ItemSchemaT>, key: "@list" | "@set"): ${snippets.ToJsonObjectFunction}<ItemT[], ItemJsonObjectT[]> {
  return (values) => {
    const valuesJsonObject = values.map(itemToJsonObject);
    return key === "@list" ? { "@list": valuesJsonObject } : { "@set": valuesJsonObject };
  }
}`,
  );
