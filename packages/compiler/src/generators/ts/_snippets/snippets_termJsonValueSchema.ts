import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_termJsonValueSchema: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}termJsonValueSchema`,
    code`\
const ${syntheticNamePrefix}termJsonValueSchema = \
  ${imports.z}.union([
    ${imports.z}.boolean(),
    ${imports.z}.number(),
    ${snippets.TermJsonObject}.schema,
    ${imports.z}.string(),
  ]).transform((v): ${snippets.TermJsonObject} => {
    if (typeof v === "object") {
      return v;
    }

    switch (typeof v) {
      case "boolean":
      case "number": {
        const literal = ${snippets.literalFactory}.primitive(v);
        return { "@type": literal.datatype.value, "@value": literal.value };
      }
      case "string": {
        if (${imports.validateAbsoluteIri}(v).isRight()) {
          return { "@id": v };
        }
        // Otherwise assume the string is a literal
        return { "@value": v };
      }
      default:
        v satisfies never;
        throw new Error("should never reach this point");
    }
  }) as unknown as ${imports.z}.ZodType<${snippets.TermJsonObject}, boolean | number | ${snippets.TermJsonObject} | string>;`,
  );
