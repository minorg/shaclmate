import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_iriToExpandedJson: SnippetFactory = ({
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}iriToExpandedJson`,
    code`\
function ${syntheticNamePrefix}iriToExpandedJson<IriT extends string = string>(iri: IriT): ${snippets.IdentifierExpandedJson}<IriT> {
  return { "@id": ${snippets.iriToCompactedJson}(iri) };
}`,
  );
