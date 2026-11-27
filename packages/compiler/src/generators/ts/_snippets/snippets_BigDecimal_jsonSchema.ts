import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_BigDecimal_jsonSchema: SnippetFactory = ({
  imports,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}BigDecimal.jsonSchema`,
    code`\
namespace ${syntheticNamePrefix}BigDecimal {
  export const jsonSchema = ${imports.z}.union([${imports.z}.string(), ${imports.z}.number()]).transform((v, ctx) => {
    try {
      const d = new ${imports.BigDecimal}(v);
      if (!d.isFinite()) {
        throw new Error("not finite");
      }
      return d.toFixed();
    } catch {
      ctx.issues.push({ code: "custom", message: "Invalid decimal", input: v });
      return ${imports.z}.NEVER;
    }
  }) as unknown as ${imports.z}.ZodType<string, string>;
}`,
  );
