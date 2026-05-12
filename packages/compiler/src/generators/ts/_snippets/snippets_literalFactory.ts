import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_literalFactory: SnippetFactory = ({
  imports,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}literalFactory`,
    code`const ${syntheticNamePrefix}literalFactory = new ${imports.LiteralFactory}({ dataFactory: ${imports.dataFactory} });`,
  );
