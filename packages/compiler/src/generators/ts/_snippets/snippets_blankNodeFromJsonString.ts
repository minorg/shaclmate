import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_blankNodeFromJsonString: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}blankNodeFromJsonString`,
    code`\
const ${syntheticNamePrefix}blankNodeFromJsonString: ${snippets.FromJsonValueFunction}<string, ${imports.BlankNode}, object> = 
  (jsonValue) => ${imports.Right}(${imports.dataFactory}.blankNode(jsonValue.substring(2)));`,
  );
