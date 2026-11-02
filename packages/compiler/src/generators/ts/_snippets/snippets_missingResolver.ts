import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_missingResolver: SnippetFactory = ({
  imports,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}missingResolver`,
    code`async function ${syntheticNamePrefix}missingResolver<ResolvedT>(): Promise<${imports.Either}<Error, ResolvedT>> { return ${imports.Left}(new Error("unable to resolve partial")); }`,
  );
