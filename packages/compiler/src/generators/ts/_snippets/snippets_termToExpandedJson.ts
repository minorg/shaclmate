import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_termToExpandedJson: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}termToExpandedJson`,
    code`\
function ${syntheticNamePrefix}termToExpandedJson(term: ${imports.BlankNode} | ${imports.Literal} | ${imports.NamedNode}): ${snippets.IdentifierExpandedJson} | ${snippets.LiteralExpandedJson} {
  switch (term.termType) {
    case "BlankNode":
      return { "@id": \`_:\${term.value}\` };
    case "NamedNode":
      return { "@id": term.value };
    case "Literal":
      return ${snippets.literalToExpandedJson}(term);
  }
}`,
  );
