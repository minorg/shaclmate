import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_validateArray: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}validateArray`,
    code`\
function ${syntheticNamePrefix}validateArray<ItemValueT, Readonly extends boolean>(validateItem: ${snippets.ValidationFunction}<ItemSchemaT, ItemValueT>, _readonly: Readonly) {
  type EitherR = Readonly extends true ? ReadonlyArray<ItemValueT> : Array<ItemValueT>;
  return (schema: ItemSchemaT, value: readonly ItemValueT[]): ${imports.Either}<Error, EitherR> => {
    if (schema.minCount !== undefined && value.length < schema.minCount) {
      return ${imports.Left}(new Error(\`value has length (\${value.length}) less than minCount (\${schema.minCount})\`)) as ${imports.Either}<Error, EitherR>;
    }

    return ${imports.Either}.sequence(value.map(validateItem)) as ${imports.Either}<Error, EitherR>;
  }
}`,
  );
