import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_validateMaybe: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}validateMaybe`,
    code`\
function ${syntheticNamePrefix}validateMaybe<ItemSchemaT, ItemValueT>(validateItem: ${snippets.ValidationFunction}<ItemSchemaT, ItemValueT>) {
  return (schema: ${snippets.MaybeSchema}<ItemSchemaT>, valueMaybe: ${imports.Maybe}<ItemValueT>): ${imports.Either}<Error, ${imports.Maybe}<ItemValueT>> =>
    valueMaybe.map(value => validateItem(schema.item(), value).map(() => valueMaybe)).orDefault(${imports.Either}.of(valueMaybe));
}`,
  );
