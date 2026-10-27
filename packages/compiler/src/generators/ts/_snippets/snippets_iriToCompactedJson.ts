import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_iriToCompactedJson: SnippetFactory = ({
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}iriToCompactedJson`,
    code`\
function ${syntheticNamePrefix}iriToCompactedJson<IriT extends string = string>(iri: IriT): IriT {
  return iri;
}`,
  );
