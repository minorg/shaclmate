import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_iriToJsonString: SnippetFactory = ({
  imports,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}iriToJsonString`,
    code`\
function ${syntheticNamePrefix}iriToJsonString<IriT extends string = string>(iri: ${imports.NamedNode}<IriT>): IriT {
  return iri.value;
}`,
  );
