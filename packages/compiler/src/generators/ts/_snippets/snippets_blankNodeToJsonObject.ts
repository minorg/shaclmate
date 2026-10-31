import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_blankNodeToJsonObject: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}blankNodeToJsonObject`,
    code`\
const ${syntheticNamePrefix}blankNodeToJsonObject: ${snippets.ToJsonObjectFunction}<${imports.BlankNode}, ${snippets.IdentifierJsonObject}> =
  (blankNode) => ({ "@id": ${snippets.blankNodeToJsonString}(blankNode) });`,
  );
