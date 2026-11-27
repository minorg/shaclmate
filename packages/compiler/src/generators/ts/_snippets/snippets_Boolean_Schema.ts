import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_Boolean_Schema: SnippetFactory = ({
  imports,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}Boolean.Schema`,
    code`\
namespace ${syntheticNamePrefix}Boolean {
  export interface Schema<BooleanT extends boolean> {
    readonly datatype: ${imports.NamedNode};
    readonly hasValues?: readonly ${imports.Literal}[];
    readonly in?: readonly BooleanT[];
    readonly kind: "Boolean";
  }
}`,
  );
