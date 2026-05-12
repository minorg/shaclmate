import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_compactRecord: SnippetFactory = ({
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}compactRecord`,
    code`\
/**
 * Remove undefined values from a record.
 */  
function ${syntheticNamePrefix}compactRecord<KeyT extends string, ValueT extends {}>(record: Record<KeyT, ValueT | undefined>): Record<KeyT, ValueT> {
  return \
    globalThis.Object.entries(record).reduce((definedProperties, [propertyName, propertyValue]) => {
      if (propertyValue !== undefined) {
        definedProperties[propertyName as KeyT] = propertyValue as ValueT;
      }
      return definedProperties;
    }, {} as Record<KeyT, ValueT>);
}`,
  );
