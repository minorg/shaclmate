import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_parseIdentifier: SnippetFactory = ({
  imports,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}parseIdentifier`,
    code`\
const ${syntheticNamePrefix}parseIdentifier = ${imports.NTriplesIdentifier}.parser(${imports.dataFactory});`,
  );
