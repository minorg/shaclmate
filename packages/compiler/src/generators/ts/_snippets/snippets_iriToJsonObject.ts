import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_iriToJsonObject: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}iriToJsonObject`,
    code`\
function ${syntheticNamePrefix}iriToJsonObject<IriT extends string = string>(iri: ${imports.NamedNode}<IriT>): ${snippets.IdentifierJsonObject}<IriT> {
  return { "@id": ${snippets.iriToJsonString}(iri) };
}`,
  );
