import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_convertToIri: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}convertToIri`,
    code`\
function ${syntheticNamePrefix}convertToIri<IriT extends string = string>(_schema: ${snippets.IriSchema}, value: IriT | ${imports.NamedNode}<IriT>): ${imports.NamedNode}<IriT> {
  switch (typeof value) {
    case "object":
      return value;
    case "string":
      return ${imports.dataFactory}.namedNode<IriT>(value);
  }
}`,
  );
