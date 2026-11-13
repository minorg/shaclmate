import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_bigIntJsonSchema: SnippetFactory = ({
  imports,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}bigIntJsonSchema`,
    code`\
const ${syntheticNamePrefix}bigIntJsonSchema = ${imports.z}.union([${imports.z}.string().regex(/^-?\d+$/), ${imports.z}.number().int()]).transform((v) => BigInt(v).toString()) as unknown as ${imports.z}.ZodType<string, string>;`,
  );
