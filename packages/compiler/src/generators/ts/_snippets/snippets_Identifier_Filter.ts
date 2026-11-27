import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_Identifier_Filter: SnippetFactory = ({
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}Identifier.Filter`,
    code`\
namespace ${syntheticNamePrefix}Identifier {    
  export interface Filter {
    readonly in?: readonly ${snippets.Identifier}[];
    readonly type?: "BlankNode" | "NamedNode";
  }
}`,
  );
