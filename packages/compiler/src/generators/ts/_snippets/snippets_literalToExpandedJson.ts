import { xsd } from "@tpluscode/rdf-ns-builders";
import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_literalToExpandedJson: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}literalToExpandedJson`,
    code`\
const ${syntheticNamePrefix}literalToExpandedJson: ${snippets.ToExpandedJsonFunction}<${imports.Literal}, ${snippets.LiteralExpandedJson}> =
  (literal) => {
    const expandedJson: Partial<${snippets.LiteralExpandedJson}> = { "@value": term.value };
    if (term.language.length > 0) {
      expandedJson["@language"] = term.language;
    }
    if (term.datatype.value !== "${xsd.string.value}") {
      expandedJson["@type"] = term.datatype.value;
    }
    return expandedJson;
  }`,
  );
