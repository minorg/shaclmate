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
function ${syntheticNamePrefix}maybeToJsonObject<ItemT, ItemJsonObjectT extends object>(itemToJsonObject: ${snippets.ToJsonObjectFunction}<ItemT, ItemJsonObjectT>): ${snippets.ToJsonObjectFunction}<${imports.Maybe}<ItemT>, ItemJsonObjectT | undefined> {
  return (value) => value.map(value => itemToJsonObject(value)).extract();
}`,
  );
