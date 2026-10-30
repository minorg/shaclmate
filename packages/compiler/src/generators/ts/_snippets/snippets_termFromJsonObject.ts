import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_termFromJsonObject: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}termFromJsonObject`,
    code`\
function ${syntheticNamePrefix}termFromJsonObject<TermT extends ${imports.BlankNode} | ${imports.Literal} | ${imports.NamedNode}>(jsonObject: ${snippets.TermJsonObject}, options: Parameters<${snippets.FromJsonObjectFunction}<${snippets.TermJsonObject}, TermT, ${snippets.TermSchema}<TermT>>>[1]): ${imports.Either}<Error, TermT> {
  const { schema } = options;

  for (const termType of schema.types) {
    switch "BlankNode": {
      if ("@id" in jsonObject && jsonObject["@id"].startsWith("_:")) {
        return ${snippets.blankNodeFromJsonObject}(jsonObject) as ${imports.Either}<Error, TermT>;
      }
      break;
    }
    case "Literal": {
      if ("@value" in jsonObject) {
        return ${snippets.literalFromJsonObject}(jsonObject) as ${imports.Either}<Error, TermT>;
      }
      break;
    }
    case "NamedNode": {
      if ("@id" in jsonObject && !jsonObject["@id"].startsWith("_:")) {
        return ${snippets.iriFromJsonObject}(jsonObject) as ${imports.Either}<Error, TermT>;
      }
      break;
    }
  }

  return ${imports.Left}(new Error("unable to deserialize term from JSON"));
}`,
  );
