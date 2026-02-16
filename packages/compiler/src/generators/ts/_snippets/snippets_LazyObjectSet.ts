import { imports } from "../imports.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_LazyObjectSet = conditionalOutput(
  `${syntheticNamePrefix}LazyObjectSet`,
  code`\
/**
 * Type of lazy properties that return a set of objects. This is a class instead of an interface so it can be instanceof'd elsewhere.
 */
export class ${syntheticNamePrefix}LazyObjectSet<ObjectIdentifierT extends ${imports.BlankNode} | ${imports.NamedNode}, PartialObjectT extends { ${syntheticNamePrefix}identifier: ObjectIdentifierT }, ResolvedObjectT extends { ${syntheticNamePrefix}identifier: ObjectIdentifierT }> {
  readonly partials: readonly PartialObjectT[];
  private readonly resolver: (identifiers: readonly ObjectIdentifierT[]) => Promise<${imports.Either}<Error, readonly ResolvedObjectT[]>>;

  constructor({ partials, resolver }: {
    partials: readonly PartialObjectT[]
    resolver: (identifiers: readonly ObjectIdentifierT[]) => Promise<${imports.Either}<Error, readonly ResolvedObjectT[]>>,
  }) {
    this.partials = partials;
    this.resolver = resolver;
  }

  get length(): number {
    return this.partials.length;
  }

  async resolve(options?: { limit?: number; offset?: number }): Promise<${imports.Either}<Error, readonly ResolvedObjectT[]>> {
    if (this.partials.length === 0) {
      return ${imports.Either}.of([]);
    }

    const limit = options?.limit ?? Number.MAX_SAFE_INTEGER;
    if (limit <= 0) {
      return ${imports.Either}.of([]);
    }

    let offset = options?.offset ?? 0;
    if (offset < 0) {
      offset = 0;
    }

    return await this.resolver(this.partials.slice(offset, offset + limit).map(partial => partial.${syntheticNamePrefix}identifier));
  }
}`,
);
