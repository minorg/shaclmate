import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_BlankNode_fromJsonObject: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}BlankNode.fromJsonObject`,
    code`\
namespace ${syntheticNamePrefix}BlankNode {
  export const fromJsonObject: ${snippets.FromJsonFunction}<${snippets.IdentifierJsonObject}, ${imports.BlankNode}, undefined> = 
    (jsonObject) => ${snippets.BlankNode_fromJsonString}(jsonObject["@id"]);
}`,
  );
