import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_dateFromRdfResourceValues: SnippetFactory = ({
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}dateFromRdfResourceValues`,
    code`\
const ${syntheticNamePrefix}dateFromRdfResourceValues: ${snippets.FromRdfResourceValuesFunction}<Date, ${snippets.DateSchema}> = 
  (values, options) => ${snippets.termLikeFromRdfResourceValues}(values, options).chain(values => values.chainMap(value => options.schema.in ? value.toDate(options.schema.in) : value.toDate()));`,
  );
