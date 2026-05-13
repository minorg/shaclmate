import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_wrap_ToRdfResourceFunction: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}wrap_ToRdfResourceFunction`,
    code`\
function ${syntheticNamePrefix}wrap_ToRdfResourceFunction<T>(_toRdfResourceFunction: ${snippets._ToRdfResourceFunction}<T>): ${snippets.ToRdfResourceFunction}<T> {
  return (value, options) => {
    let { graph, ignoreRdfType = false, resourceSet } = (options ?? {});
    if (!resourceSet) {
      resourceSet = new ${imports.ResourceSet}({ dataFactory: ${imports.dataFactory}, dataset: ${imports.datasetFactory}.dataset() });
    }
    const resource = resourceSet.resource(value.${syntheticNamePrefix}identifier());
    _toRdfResourceFunction({ graph, ignoreRdfType, resourceSet, value });
    return resource;
  };
}`,
  );
