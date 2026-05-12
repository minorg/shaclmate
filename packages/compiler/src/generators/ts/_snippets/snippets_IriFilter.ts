import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_IriFilter: SnippetFactory = ({
  imports,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}IriFilter`,
    code`\
interface ${syntheticNamePrefix}IriFilter {
  readonly in?: readonly ${this.imports.NamedNode}[];
}`,
  );
