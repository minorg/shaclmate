import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_Identifier_toJsonString: SnippetFactory = ({
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}Identifier.toJsonString`,
    code`\
namespace ${syntheticNamePrefix}Identifier {
  export const toJsonString: ${snippets.ToJsonFunction}<${snippets.Identifier}, string> =
    (identifier) => identifier.termType === "BlankNode" ? ${snippets.BlankNode_toJsonString}(identifier) : ${snippets.iriToJsonString}(identifier);
}`,
  );
