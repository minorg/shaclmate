import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_Identifier_Schema: SnippetFactory = ({
  imports,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}Identifier.Schema`,
    code`\
namespace ${syntheticNamePrefix}Identifier {
  export interface Schema {
    readonly hasValues?: readonly ${imports.NamedNode}[];
    readonly kind: "Identifier";
  }
}`,
  );
