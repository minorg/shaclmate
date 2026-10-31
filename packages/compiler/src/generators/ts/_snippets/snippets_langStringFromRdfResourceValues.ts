import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_langStringFromRdfResourceValues: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}langStringFromRdfResourceValues`,
    code`\
const ${syntheticNamePrefix}langStringFromRdfResourceValues: ${snippets.FromRdfResourceValuesFunction}<${imports.Literal}, ${snippets.LangStringSchema}> =
  (values, options) => ${snippets.termLikeFromRdfResourceValues}(values, options).chain(values => values.chainMap(value => value.toLangString(options.schema.in)));`,
  );
