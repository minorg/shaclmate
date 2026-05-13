import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_wrap_FromRdfResourceFunction: SnippetFactory = ({
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}wrap_FromRdfResourceFunction`,
    code`\
function ${syntheticNamePrefix}wrap_FromRdfResourceFunction<T>(_fromRdfResourceFunction: ${snippets._FromRdfResourceFunction}<T>): ${snippets.FromRdfResourceFunction}<T> {
  return (resource, options) => {
    let { context, graph, ignoreRdfType = false, objectSet, preferredLanguages } = (options ?? {});
    if (!objectSet) { objectSet = new ${syntheticNamePrefix}RdfjsDatasetObjectSet(resource.dataset); };
    return _fromRdfResourceFunction(resource, { context, graph, ignoreRdfType, objectSet, preferredLanguages });
  };
}`,
  );
