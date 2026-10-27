import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_blankNodeFromRdfResourceValues: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}blankNodeFromRdfResourceValues`,
    code`\
const ${syntheticNamePrefix}blankNodeFromRdfResourceValues: ${snippets.FromRdfResourceValuesFunction}<${imports.BlankNode}, ${snippets.BlankNodeSchema}> =
  (values) => values.chainMap(value => value.toBlankNode());`,
  );
