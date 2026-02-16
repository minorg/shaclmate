import { imports } from "../imports.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_LazyObject = conditionalOutput(
  `${syntheticNamePrefix}LazyObject`,
  code`\
/**
 * Type of lazy properties that return a single required object. This is a class instead of an interface so it can be instanceof'd elsewhere.
 */
export class ${syntheticNamePrefix}LazyObject<ObjectIdentifierT extends ${imports.BlankNode} | ${imports.NamedNode}, PartialObjectT extends { ${syntheticNamePrefix}identifier: ObjectIdentifierT }, ResolvedObjectT extends { ${syntheticNamePrefix}identifier: ObjectIdentifierT }> {
  readonly partial: PartialObjectT;
  private readonly resolver: (identifier: ObjectIdentifierT) => Promise<${imports.Either}<Error, ResolvedObjectT>>;

  constructor({ partial, resolver }: {
    partial: PartialObjectT
    resolver: (identifier: ObjectIdentifierT) => Promise<${imports.Either}<Error, ResolvedObjectT>>,
  }) {
    this.partial = partial;
    this.resolver = resolver;
  }

  resolve(): Promise<${imports.Either}<Error, ResolvedObjectT>> {
    return this.resolver(this.partial.${syntheticNamePrefix}identifier);
  }
}`,
);
