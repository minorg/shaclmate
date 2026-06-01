import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_Lazy: SnippetFactory = ({
  imports,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}Lazy`,
    code`\
/**
 * Type of lazy properties that return a single required value. This is a class instead of an interface so it can be instanceof'd elsewhere.
 */
export class ${syntheticNamePrefix}Lazy<PartialT, ResolvedT> {
  readonly partial: PartialT;
  private readonly resolver: (partial: PartialT, options?: { preferredLanguages?: readonly string[] }) => Promise<${imports.Either}<Error, ResolvedT>>;

  constructor({ partial, resolver }: {
    partial: PartialT
    resolver: (partial: PartialT, options?: { preferredLanguages?: readonly string[] }) => Promise<${imports.Either}<Error, ResolvedT>>,
  }) {
    this.partial = partial;
    this.resolver = resolver;
  }

  resolve(options?: { preferredLanguages?: readonly string[] }): Promise<${imports.Either}<Error, ResolvedT>> {
    return this.resolver(this.partial, options);
  }
}`,
  );
