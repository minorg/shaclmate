import { xsd } from "@tpluscode/rdf-ns-builders";
import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_literalToJsonObject: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}literalToJsonObject`,
    code`\
const ${syntheticNamePrefix}literalToJsonObject: ${snippets.ToJsonFunction}<${imports.Literal}, ${snippets.LiteralJsonObject}> =
  (literal) => {
    const jsonObject: ${snippets.LiteralJsonObject} = { "@value": literal.value };
    if (literal.language.length > 0) {
      jsonObject["@language"] = literal.language;
    }
    if (literal.datatype.value !== "${xsd.string.value}") {
      jsonObject["@type"] = literal.datatype.value;
    }
    return jsonObject;
  }`,
  );
