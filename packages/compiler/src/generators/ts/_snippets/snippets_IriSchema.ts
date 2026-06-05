import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_IriSchema: SnippetFactory = ({
  imports,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}IriSchema`,
    code`\
interface ${syntheticNamePrefix}IriSchema<IriT extends string = string> {
  readonly hasValues?: readonly ${imports.NamedNode}[];
  readonly in?: readonly ${imports.NamedNode}<IriT>[];
  readonly kind: "Iri";
}`,
  );
