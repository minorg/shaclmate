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
const ${syntheticNamePrefix}termToExpandedJson: ${snippets.ToExpandedJsonFunction}<${snippets.IdentifierExpandedJson} | ${snippets.LiteralExpandedJson}, ${imports.BlankNode} | ${imports.Literal} | ${imports.NamedNode}> =
  (term) => {
    switch (term.termType) {
      case "BlankNode":
        return ${snippets.blankNodeToExpandedJson}(term);
      case "NamedNode":
        return ${snippets.iriToExpandedJson}(term);
      case "Literal":
        return ${snippets.literalToExpandedJson}(term);
    }
  }
}`,
  );
