import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_zValidator: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}zValidator`,
    code`\
const ${syntheticNamePrefix}zValidator = <
  T extends ${imports.ZodType},
  Target extends keyof ${imports.HonoValidationTargets},
>(
  target: Target,
  schema: T,
) =>
  ${imports.honoZodValidator}(target, schema, (result, c) => {
    if (!result.success) {
      return c.json({ ...${snippets.errorToProblemDetailsJson}(result.error), status: 400, title: "Request validation error" }), 400, { "Content-Type": "application/problem+json" });
    }
    return undefined;
  });`,
  );
