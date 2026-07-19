import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_NamespaceBuilder: SnippetFactory = ({
  imports,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}NamespaceBuilder`,
    code`\
/**
 * NamespaceBuilder type excerpted from @rdfjs/namespace (MIT license) in lieu of a type import.
 */
type ${syntheticNamePrefix}NamespaceBuilder<TermNames extends string = any> = Record<TermNames, NamedNode> & {
    (property?: TemplateStringsArray | TermNames): ${imports.NamedNode};
};`,
  );
