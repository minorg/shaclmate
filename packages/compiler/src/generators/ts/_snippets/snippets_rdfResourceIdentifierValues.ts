import { rdf } from "@tpluscode/rdf-ns-builders";
import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_rdfResourceIdentifierValues: SnippetFactory = ({
  imports,
  rdfjsTermExpression,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}rdfResourceIdentifierValues`,
    code`\
function ${syntheticNamePrefix}rdfResourceIdentifierValues(resource: ${imports.Resource}): ${imports.Resource}.Values {
  return new ${imports.Resource}.Value({
    dataFactory: ${imports.dataFactory},
    focusResource: resource,
    propertyPath: ${rdfjsTermExpression(rdf.subject)},
    term: resource.identifier,
  }).toValues();
}`,
  );
