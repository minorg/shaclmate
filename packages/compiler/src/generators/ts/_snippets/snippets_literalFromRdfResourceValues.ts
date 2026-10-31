import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_literalFromRdfResourceValues: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}literalFromRdfResourceValues`,
    code`\
const ${syntheticNamePrefix}literalFromRdfResourceValues: ${snippets.FromRdfResourceValuesFunction}<${imports.Literal}, ${snippets.LiteralSchema}> =
  (values, options) => ${snippets.termLikeFromRdfResourceValues}(values, options).chain(values => values.chainMap(value => value.toLiteral(options.schema.in)));`,
  );
