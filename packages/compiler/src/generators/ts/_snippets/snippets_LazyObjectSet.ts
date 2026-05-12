import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_LazyObjectSet: SnippetFactory = ({
  imports,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}LazyObjectSet`,
    code`\
/**
 * Type of lazy properties that return a set of objects. This is a class instead of an interface so it can be instanceof'd elsewhere.
 */
export class ${syntheticNamePrefix}LazyObjectSet<ObjectIdentifierT extends ${this.imports.BlankNode} | ${this.imports.NamedNode}, PartialObjectT extends { ${syntheticNamePrefix}identifier: () => ObjectIdentifierT }, ResolvedObjectT extends { ${syntheticNamePrefix}identifier: () => ObjectIdentifierT }> {
  readonly partials: readonly PartialObjectT[];
  private readonly resolver: (identifiers: readonly ObjectIdentifierT[], options?: { preferredLanguages?: readonly string[] }) => Promise<${this.imports.Either}<Error, readonly ResolvedObjectT[]>>;

  constructor({ partials, resolver }: {
    partials: readonly PartialObjectT[]
    resolver: (identifiers: readonly ObjectIdentifierT[], options?: { preferredLanguages?: readonly string[] }) => Promise<${this.imports.Either}<Error, readonly ResolvedObjectT[]>>,
  }) {
    this.partials = partials;
    this.resolver = resolver;
  }

  get length(): number {
    return this.partials.length;
  }

  async resolve(options?: { limit?: number; offset?: number; preferredLanguages?: readonly string[] }): Promise<${this.imports.Either}<Error, readonly ResolvedObjectT[]>> {
    if (this.partials.length === 0) {
      return ${this.imports.Right}([]);
    }

    const limit = options?.limit ?? Number.MAX_SAFE_INTEGER;
    if (limit <= 0) {
      return ${this.imports.Right}([]);
    }

    let offset = options?.offset ?? 0;
    if (offset < 0) {
      offset = 0;
    }

    return await this.resolver(this.partials.slice(offset, offset + limit).map(partial => partial.${syntheticNamePrefix}identifier()), { preferredLanguages: options?.preferredLanguages });
  }
}`,
  );
