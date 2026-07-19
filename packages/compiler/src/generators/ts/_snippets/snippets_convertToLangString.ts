import { rdf } from "@tpluscode/rdf-ns-builders";
import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_convertToLangString: SnippetFactory = ({
  imports,
  rdfjsTermExpression,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}convertToLangString`,
    code`\
const ${syntheticNamePrefix}convertToLangString: ${snippets.ConversionFunction}<${imports.Literal}, ${imports.Literal}> = (value) => {
  if (!value.datatype.equals(${rdfjsTermExpression(rdf.langString)})) {
    return ${imports.Left}(new Error(\`expected Literal to have rdf:langString datatype, not \${value.datatype.value}\`));
  }

  if (value.language.length === 0) {
    return ${imports.Left}(new Error("expected Literal to have non-empty language"));
  }

  return ${imports.Either}.of(value);
}`,
  );
