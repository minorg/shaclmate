import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_termToJsonObject: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}termToJsonObject`,
    code`\
const ${syntheticNamePrefix}termToJsonObject: ${snippets.ToJsonFunction}<${imports.BlankNode} | ${imports.Literal} | ${imports.NamedNode}, ${snippets.TermJsonObject}> =
  (term) => {
    switch (term.termType) {
      case "BlankNode":
        return ${snippets.blankNodeToJsonObject}(term);
      case "NamedNode":
        return ${snippets.iriToJsonObject}(term);
      case "Literal":
        return ${snippets.literalToJsonObject}(term);
    }
  };`,
  );
