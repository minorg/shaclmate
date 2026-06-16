import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_LangStringSchema: SnippetFactory = ({
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}LangStringSchema`,
    code`\
type ${syntheticNamePrefix}LangStringSchema = Omit<${snippets.LiteralSchema}, "kind"> & { readonly kind: "LangString"; };`,
  );
