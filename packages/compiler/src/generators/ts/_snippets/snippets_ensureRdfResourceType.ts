import { rdf } from "@tpluscode/rdf-ns-builders";
import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_ensureRdfResourceType: SnippetFactory = ({
  imports,
  rdfjsTermExpression,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}ensureRdfResourceType`,
    code`\
function ${syntheticNamePrefix}ensureRdfResourceType(resource: ${imports.Resource}, types: readonly ${imports.NamedNode}[], options: { graph: Exclude<${imports.Quad_Graph}, ${imports.Variable}> | undefined }): ${imports.Either}<Error, undefined> {
  return resource.value(${rdfjsTermExpression(rdf.type)}, options).chain(actualRdfTypeValue => actualRdfTypeValue.toIri()).chain(actualRdfType => {
    // Check the expected type and its known subtypes
    for (const type of types) {
      if (resource.isInstanceOf(type, options)) {
        return ${imports.Right}(undefined);
      }
    }

    return ${imports.Left}(new Error(\`\${resource.identifier} has unexpected RDF type (actual: \${actualRdfType}, expected one of \${types})\`));
  });
}`,
  );
