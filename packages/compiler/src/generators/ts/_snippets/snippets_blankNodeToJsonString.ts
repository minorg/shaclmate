import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_blankNodeToJsonString: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}blankNodeToJsonString`,
    code`\
const ${syntheticNamePrefix}blankNodeToJsonString: ${snippets.ToJsonValueFunction}<${imports.BlankNode}, string> =
  (blankNode) => \`_:\${blankNode.value}\`;`,
  );
