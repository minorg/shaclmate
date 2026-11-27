import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_BlankNode_convert: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}BlankNode.convert`,
    code`\
namespace ${syntheticNamePrefix}BlankNode {
  export const convert: ${snippets.ConversionFunction}<${imports.BlankNode} | undefined, ${imports.BlankNode}> = (value) => {
    switch (typeof value) {
      case "object":
        return ${imports.Either}.of(value);
      case "undefined":
        return ${imports.Either}.of(${imports.dataFactory}.blankNode());
    }
  }
}`,
  );
