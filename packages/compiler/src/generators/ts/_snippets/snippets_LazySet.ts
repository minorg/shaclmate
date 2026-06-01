import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_LazySet: SnippetFactory = ({
  imports,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}LazySet`,
    code`\
/**
 * Type of lazy properties that return a set of values. This is a class instead of an interface so it can be instanceof'd elsewhere.
 */
export class ${syntheticNamePrefix}LazySet<PartialT, ResolvedT> {
  readonly partials: readonly PartialT[];
  private readonly resolver: (partials: readonly PartialT[], options?: { preferredLanguages?: readonly string[] }) => Promise<${imports.Either}<Error, readonly ResolvedT[]>>;

  constructor({ partials, resolver }: {
    partials: readonly PartialT[]
    resolver: (partials: readonly PartialT, options?: { preferredLanguages?: readonly string[] }) => Promise<${imports.Either}<Error, readonly ResolvedT[]>>,
  }) {
    this.partials = partials;
    this.resolver = resolver;
  }

  get length(): number {
    return this.partials.length;
  }

  async resolve(options?: { limit?: number; offset?: number; preferredLanguages?: readonly string[] }): Promise<${imports.Either}<Error, readonly ResolvedT[]>> {
    if (this.partials.length === 0) {
      return ${imports.Right}([]);
    }

    const limit = options?.limit ?? Number.MAX_SAFE_INTEGER;
    if (limit <= 0) {
      return ${imports.Right}([]);
    }

    let offset = options?.offset ?? 0;
    if (offset < 0) {
      offset = 0;
    }

    return await this.resolver(this.partials.slice(offset, offset + limit), { preferredLanguages: options?.preferredLanguages });
  }
}`,
  );
