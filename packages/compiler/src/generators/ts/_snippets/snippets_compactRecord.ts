import { imports } from "../imports.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";
import { snippets_EqualsResult } from "./snippets_EqualsResult.js";

export const snippets_compactRecord = conditionalOutput(
  `${syntheticNamePrefix}compactRecord`,
  code`\
/**
 * Remove undefined values from a record.
 */  
function ${syntheticNamePrefix}compactRecord<KeyT extends string, ValueT extends {}>(record: Record<KeyT, ValueT | undefined>): Record<KeyT, ValueT> {
  return \
    Object.entries(record).reduce((definedProperties, [propertyName, propertyValue]) => {
      if (propertyValue !== undefined) {
        definedProperties[propertyName as KeyT] = propertyValue as ValueT;
      }
      return definedProperties;
    }, {} as Record<KeyT, ValueT>);
}`,
);
