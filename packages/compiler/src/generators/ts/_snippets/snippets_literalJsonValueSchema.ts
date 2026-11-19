import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_literalJsonValueSchema: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}literalJsonValueSchema`,
    code`\
const ${syntheticNamePrefix}literalJsonValueSchema = \
  ${imports.z}.union([
    ${imports.z}.boolean(),
    ${imports.z}.number(),
    ${snippets.LiteralJsonObject}.schema,
    ${imports.z}.string(),
  ]).transform((v): ${snippets.LiteralJsonObject} => {
    if (typeof v === "object") {
      return v;
    }

    const literal = ${snippets.literalFactory}.primitive(v);
    return { "@type": literal.datatype.value, "@value": literal.value };
}) as unknown as ${imports.z}.ZodType<${snippets.LiteralJsonObject}, boolean | number | ${snippets.LiteralJsonObject} | string>;`,
  );
