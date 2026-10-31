import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_maybeToJsonObject: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}maybeToJsonObject`,
    code`\
function ${syntheticNamePrefix}maybeToJsonObject<ItemT, ItemJsonObjectT>(itemToJsonObject: ${snippets.ToJsonObjectFunction}<ItemJsonObjectT, ItemT, ItemSchemaT>): ${snippets.ToJsonObjectFunction}<${imports.Maybe}<ItemT>, ItemJsonObjectT | undefined> {
  return (value) => value.map(value => itemToJsonObject(value)).extract();
}`,
  );
