import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_filterBlankNode: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}filterBlankNode`,
    code`\
const ${syntheticNamePrefix}filterBlankNode: ${snippets.FilterFunction}<${snippets.BlankNodeFilter}, ${imports.BlankNode}> = () => true;`,
  );
