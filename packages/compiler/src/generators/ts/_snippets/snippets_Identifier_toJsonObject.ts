import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_Identifier_toJsonObject: SnippetFactory = ({
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}Identifier.toJsonObject`,
    code`\
namespace ${syntheticNamePrefix}Identifier {
  export const toJsonObject: ${snippets.ToJsonFunction}<${snippets.Identifier}, ${snippets.Identifier_JsonObject}> =
    (identifier) => identifier.termType === "BlankNode" ? ${snippets.BlankNode_toJsonObject}(identifier) : ${snippets.iriToJsonObject}(identifier);
}`,
  );
