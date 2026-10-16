import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_wrap_ToRdfResourceFunction: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) => {
  const functionName = `${syntheticNamePrefix}wrap_ToRdfResourceFunction`;
  const identifierPropertyName = `${syntheticNamePrefix}identifier`;

  return conditionalOutput(
    functionName,
    code`\
function ${functionName}<
  IdentifierT extends ${imports.Resource}.Identifier,
  ObjectT extends { ${identifierPropertyName}: () => IdentifierT },
>(
  _toRdfResourceFunction: ${syntheticNamePrefix}_ToRdfResourceFunction<IdentifierT, ObjectT>,
): ${syntheticNamePrefix}ToRdfResourceFunction<ObjectT, IdentifierT>;
function ${functionName}<
  _IdentifierT extends ${imports.BlankNode},
  ObjectT extends object,
>(
  _toRdfResourceFunction: ${syntheticNamePrefix}_ToRdfResourceFunction<${imports.BlankNode}, ObjectT>,
): ${syntheticNamePrefix}ToRdfResourceFunction<ObjectT, ${imports.BlankNode}>;
function ${functionName}<IdentifierT extends ${imports.Resource}.Identifier, ObjectT extends object & { ${identifierPropertyName}?: () => IdentifierT }>(_toRdfResourceFunction: ${snippets._ToRdfResourceFunction}<IdentifierT, ObjectT>): ${snippets.ToRdfResourceFunction}<ObjectT, IdentifierT> {
  return (object, options) => {
    let { graph, ignoreRdfType = false, resourceSet } = (options ?? {});
    if (!resourceSet) {
      resourceSet = new ${imports.ResourceSet}({ dataFactory: ${imports.dataFactory}, dataset: ${imports.datasetFactory}.dataset() });
    }
    const resource = (
      object.${identifierPropertyName}
        ? resourceSet.resource(object.${identifierPropertyName}())
        : resourceSet.resource(${imports.dataFactory}.blankNode())
    ) as ${imports.Resource}<IdentifierT>;
    _toRdfResourceFunction({ graph, ignoreRdfType, object, resource, resourceSet });
    return resource;
  };
}`,
  );
};
