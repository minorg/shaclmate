import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_dateTimeFromRdfResourceValues: SnippetFactory = ({
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}dateTimeFromRdfResourceValues`,
    code`\
const ${syntheticNamePrefix}dateTimeFromRdfResourceValues: ${snippets.FromRdfResourceValuesFunction}<Date, ${snippets.DateSchema}> =
  (values, options) => ${snippets.termLikeFromRdfResourceValues}(values, options).chain(values => values.chainMap(value => options.schema.in ? value.toDateTime(options.schema.in) : value.toDateTime()));`,
  );
