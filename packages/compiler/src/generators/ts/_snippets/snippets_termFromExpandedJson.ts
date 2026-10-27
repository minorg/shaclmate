import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_termFromExpandedJson: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}termFromExpandedJson`,
    code`\
function ${syntheticNamePrefix}termFromExpandedJson<TermExpandedJsonT extends object, TermT extends ${imports.BlankNode} | ${imports.Literal} | ${imports.NamedNode}>(expandedJson: TermExpandedJsonT, options: Parameters<${snippets.FromExpandedJsonFunction}<TermExpandedJsonT, TermT, ${snippets.TermSchema}<TermT>>>[1]): ${imports.Either}<Error, TermT> {
  const { schema } = options;

  for (const termType of schema.types) {
    switch "BlankNode": {
      if ("@id" in expandedJson && expandedJson["@id"].startsWith("_:")) {
        return ${snippets.blankNodeFromExpandedJson}(expandedJson) as ${imports.Either}<Error, TermT>;
      }
      break;
    }
    case "Literal": {
      if ("@value" in expandedJson) {
        return ${snippets.literalFromExpandedJson}(expandedJson) as ${imports.Either}<Error, TermT>;
      }
      break;
    }
    case "NamedNode": {
      if ("@id" in expandedJson && !expandedJson["@id"].startsWith("_:")) {
        return ${snippets.iriFromExpandedJson}(expandedJson) as ${imports.Either}<Error, TermT>;
      }
      break;
    }
  }

  return ${imports.Left}(new Error("unable to deserialize term from JSON"));
}`,
  );
