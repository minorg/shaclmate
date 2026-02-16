import { imports } from "../imports.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_LazyObjectOption = conditionalOutput(
  `${syntheticNamePrefix}LazyObjectOption`,
  code`\
/**
 * Type of lazy properties that return a single optional object. This is a class instead of an interface so it can be instanceof'd elsewhere.
 */
export class ${syntheticNamePrefix}LazyObjectOption<ObjectIdentifierT extends ${imports.BlankNode} | ${imports.NamedNode}, PartialObjectT extends { ${syntheticNamePrefix}identifier: ObjectIdentifierT }, ResolvedObjectT extends { ${syntheticNamePrefix}identifier: ObjectIdentifierT }> {
  readonly partial: ${imports.Maybe}<PartialObjectT>;
  private readonly resolver: (identifier: ObjectIdentifierT) => Promise<${imports.Either}<Error, ResolvedObjectT>>;

  constructor({ partial, resolver }: {
    partial: ${imports.Maybe}<PartialObjectT>
    resolver: (identifier: ObjectIdentifierT) => Promise<${imports.Either}<Error, ResolvedObjectT>>,
  }) {
    this.partial = partial;
    this.resolver = resolver;
  }

  async resolve(): Promise<${imports.Either}<Error, ${imports.Maybe}<ResolvedObjectT>>> {
    if (this.partial.isNothing()) {
      return ${imports.Either}.of(${imports.Maybe}.empty());
    }
    return (await this.resolver(this.partial.unsafeCoerce().${syntheticNamePrefix}identifier)).map(${imports.Maybe}.of);
  }
}`,
);
