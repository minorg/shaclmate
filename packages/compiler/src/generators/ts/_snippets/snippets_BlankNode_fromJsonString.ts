import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_BlankNode_fromJsonString: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}BlankNode.fromJsonString`,
    code`\
namespace ${syntheticNamePrefix}BlankNode {    
  export const fromJsonString: ${snippets.FromJsonFunction}<string, ${imports.BlankNode}, undefined> = 
    (jsonValue) => ${imports.Right}(${imports.dataFactory}.blankNode(jsonValue.substring(2)));
}`,
  );
