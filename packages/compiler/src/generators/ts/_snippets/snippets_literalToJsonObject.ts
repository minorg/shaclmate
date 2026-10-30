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
const ${syntheticNamePrefix}literalToJsonObject: ${snippets.ToJsonObjectFunction}<${imports.Literal}, ${snippets.LiteralJsonObject}> =
  (literal) => {
    const jsonObject: Partial<${snippets.LiteralJsonObject}> = { "@value": term.value };
    if (term.language.length > 0) {
      jsonObject["@language"] = term.language;
    }
    if (term.datatype.value !== "${xsd.string.value}") {
      jsonObject["@type"] = term.datatype.value;
    }
    return jsonObject;
  }`,
  );
