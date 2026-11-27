import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_Identifier_parse: SnippetFactory = ({
  imports,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}Identifier.parse`,
    code`\
namespace ${syntheticNamePrefix}Identifier {
  export const parse = ${imports.NTriplesIdentifier}.parser(${imports.dataFactory});
}`,
  );
