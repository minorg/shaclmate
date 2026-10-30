import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_maybeToJsonValue: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}maybeToJsonValue`,
    code`\
function ${syntheticNamePrefix}maybeToJsonValue<ItemT, ItemJsonValueT>(itemToJsonValue: ${snippets.ToJsonValueFunction}<ItemJsonValueT, ItemT, ItemSchemaT>): ${snippets.ToJsonValueFunction}<${imports.Maybe}<ItemT>, ItemJsonValueT | undefined> {
  return (value) => value.map(value => itemToJsonValue(value)).extract();
}`,
  );
