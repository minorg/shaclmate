import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_Identifier_fromRdfResourceValues: SnippetFactory = ({
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}Identifier.fromRdfResourceValues`,
    code`\
namespace ${syntheticNamePrefix}Identifier {
  export const fromRdfResourceValues: ${snippets.FromRdfResourceValuesFunction}<${snippets.Identifier}, ${snippets.Identifier_Schema}> =
    (values, options) => ${snippets.termLikeFromRdfResourceValues}(values, options).chain(values => values.chainMap(value => value.toIdentifier()));
}`,
  );
