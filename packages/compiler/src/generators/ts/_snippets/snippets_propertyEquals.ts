import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_propertyEquals: SnippetFactory = ({
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}propertyEquals`,
    code`\
function ${syntheticNamePrefix}propertyEquals<ObjectT, PropertyValueT>(
  property: Readonly<{ equalsFunction: ${snippets.EqualsFunction}<PropertyValueT>; name: string; }>,
  left: readonly [ObjectT, PropertyValueT],
  right: readonly [ObjectT, PropertyValueT]
): ${snippets.EqualsResult} {
  return property.equalsFunction(left[1], right[1])
    .mapLeft(propertyValuesUnequal => ({ left: left[0], right: right[0], propertyName: property.name, propertyValuesUnequal, type: "property" as const }));
}`,
  );
