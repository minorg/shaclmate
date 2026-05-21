import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_wrap_FromRdfResourceFunction: SnippetFactory = ({
  configuration,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}wrap_FromRdfResourceFunction`,
    code`\
function ${syntheticNamePrefix}wrap_FromRdfResourceFunction<T>(_fromRdfResourceFunction: ${snippets._FromRdfResourceFunction}<T>): ${snippets.FromRdfResourceFunction}<T> {
  return (resource, options) => {
    const { context, graph, ignoreRdfType = false, ${configuration.features.has("ObjectSet") ? "objectSet, " : ""}preferredLanguages } = (options ?? {});
    return _fromRdfResourceFunction(resource, { context, graph, ignoreRdfType, ${configuration.features.has("ObjectSet") ? code`objectSet: objectSet ?? new ${syntheticNamePrefix}RdfjsDatasetObjectSet(resource.dataset), ` : ""}preferredLanguages });
  };
}`,
  );
