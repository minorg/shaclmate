import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_ValidationFunction: SnippetFactory = ({
  imports,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}ValidationFunction`,
    code`\
type ${syntheticNamePrefix}ValidationFunction<SchemaT, ValueT> = (schema: SchemaT, value: ValueT) => ${imports.Either}<Error, ValueT>;`,
  );
