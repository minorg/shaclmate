import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_BlankNode_fromRdfResourceValues: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}BlankNode.fromRdfResourceValues`,
    code`\
namespace ${syntheticNamePrefix}BlankNode {    
  export const fromRdfResourceValues: ${snippets.FromRdfResourceValuesFunction}<${imports.BlankNode}, ${snippets.BlankNode_Schema}> =
    (values) => values.chainMap(value => value.toBlankNode());
}`,
  );
