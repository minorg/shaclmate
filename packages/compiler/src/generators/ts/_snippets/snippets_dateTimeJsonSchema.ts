import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_dateTimeJsonSchema: SnippetFactory = ({
  imports,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}dateTimeJsonSchema`,
    code`const ${syntheticNamePrefix}dateTimeJsonSchema = ${imports.z}.coerce.date().transform((v) => v.toISOString());`,
  );
