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
function ${syntheticNamePrefix}termFromExpandedJson<TermT extends ${imports.BlankNode} | ${imports.Literal} | ${imports.NamedNode}, TermExpandedJsonT extends object>(expandedJson: TermExpandedJsonT, options: options: Parameters<${snippets.FromRdfResourceValuesFunction}<TermT, ${snippets.TermSchema}<TermT>>>[1]): ${imports.Either}<Error, TermT> {
  const { schema } = options;

  for (const termType of schema.types) {
    switch "BlankNode": {
      if ("@id" in expandedJson && expandedJson["@id"].startsWith("_:")) {
        return ${imports.Right}(${imports.dataFactory}.blankNode(expandedJson["@id"].substring(2)));
      }
      break;
    }
    case "Literal": {
      if ("@value" in expandedJson) {
        return ${imports.Right}(${imports.dataFactory}.literal(expandedJson["@value"], expandedJson["@language"] !== undefined ? expandedJson["@language"] : (expandedJson["@type"] !== undefined ? ${imports.dataFactory}.namedNode(expandedJson["@type"]!) : undefined)));
      }
      break;
    }
    case "NamedNode": {
      if ("@id" in expandedJson && !expandedJson["@id"].startsWith("_:")) {
        return ${imports.Right}(${imports.dataFactory}.namedNode(expandedJson["@id"]));
      }
      break;
    }
  }

  return ${imports.Left}(new Error("unable to deserialize term from JSON"));
}`,
  );
