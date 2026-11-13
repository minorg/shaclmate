import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_dateJsonSchema: SnippetFactory = ({
  imports,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}dateJsonSchema`,
    code`const ${syntheticNamePrefix}dateJsonSchema = ${imports.z}.coerce.date().transform((v) => v.toISOString().slice(0, 10));`,
  );
