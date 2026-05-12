import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_IriSchema: SnippetFactory = ({
  imports,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}IriSchema`,
    code`\
interface ${syntheticNamePrefix}IriSchema {
  readonly in?: readonly ${this.imports.NamedNode}[];
  readonly kind: "Iri";
}`,
  );
