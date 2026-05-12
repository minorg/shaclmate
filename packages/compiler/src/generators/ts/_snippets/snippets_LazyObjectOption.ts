import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_LazyObjectOption: SnippetFactory = ({
  imports,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}LazyObjectOption`,
    code`\
/**
 * Type of lazy properties that return a single optional object. This is a class instead of an interface so it can be instanceof'd elsewhere.
 */
export class ${syntheticNamePrefix}LazyObjectOption<ObjectIdentifierT extends ${this.imports.BlankNode} | ${this.imports.NamedNode}, PartialObjectT extends { ${syntheticNamePrefix}identifier: () => ObjectIdentifierT }, ResolvedObjectT extends { ${syntheticNamePrefix}identifier: () => ObjectIdentifierT }> {
  readonly partial: ${this.imports.Maybe}<PartialObjectT>;
  private readonly resolver: (identifier: ObjectIdentifierT, options?: { preferredLanguages?: readonly string[] }) => Promise<${this.imports.Either}<Error, ResolvedObjectT>>;

  constructor({ partial, resolver }: {
    partial: ${this.imports.Maybe}<PartialObjectT>
    resolver: (identifier: ObjectIdentifierT, options?: { preferredLanguages?: readonly string[] }) => Promise<${this.imports.Either}<Error, ResolvedObjectT>>,
  }) {
    this.partial = partial;
    this.resolver = resolver;
  }

  async resolve(options?: { preferredLanguages?: readonly string[] }): Promise<${this.imports.Either}<Error, ${this.imports.Maybe}<ResolvedObjectT>>> {
    if (this.partial.isNothing()) {
      return ${this.imports.Right}(${this.imports.Maybe}.empty());
    }
    return (await this.resolver(this.partial.unsafeCoerce().${syntheticNamePrefix}identifier(), options)).map(${this.imports.Maybe}.of);
  }
}`,
  );
