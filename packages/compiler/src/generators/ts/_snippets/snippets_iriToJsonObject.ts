import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_iriToJsonObject: SnippetFactory = ({
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}iriToJsonObject`,
    code`\
function ${syntheticNamePrefix}iriToJsonObject<IriT extends string = string>(iri: IriT): ${snippets.IdentifierJsonObject}<IriT> {
  return { "@id": ${snippets.iriToJsonString}(iri) };
}`,
  );
