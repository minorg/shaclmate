import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_LazyOption: SnippetFactory = ({
  imports,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}LazyOption`,
    code`\
/**
 * Type of lazy properties that return a single optional value. This is a class instead of an interface so it can be instanceof'd elsewhere.
 */
export class ${syntheticNamePrefix}LazyOption<PartialT, ResolvedT> {
  readonly partial: ${imports.Maybe}<PartialT>;
  private readonly resolver: (partial: PartialT, options?: { preferredLanguages?: readonly string[] }) => Promise<${imports.Either}<Error, ResolvedT>>;

  constructor({ partial, resolver }: {
    partial: ${imports.Maybe}<PartialT>
    resolver: (partial: PartialT, options?: { preferredLanguages?: readonly string[] }) => Promise<${imports.Either}<Error, ResolvedT>>,
  }) {
    this.partial = partial;
    this.resolver = resolver;
  }

  async resolve(options?: { preferredLanguages?: readonly string[] }): Promise<${imports.Either}<Error, ${imports.Maybe}<ResolvedT>>> {
    if (this.partial.isNothing()) {
      return ${imports.Right}(${imports.Maybe}.empty());
    }
    return (await this.resolver(this.partial.unsafeCoerce(), options)).map(${imports.Maybe}.of);
  }
}`,
  );
