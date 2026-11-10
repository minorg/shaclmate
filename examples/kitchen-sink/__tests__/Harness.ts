import type { NamedNode, Variable } from "@rdfjs/types";
import type { Resource } from "@rdfx/resource";
import type {
  $EqualsFunction,
  $FromJsonObjectFunction,
  $FromRdfResourceFunction,
  $HashFunction,
  $ToJsonFunction,
  $ToRdfResourceFunction,
  $ToStringFunction,
} from "../src/index.js";

export class Harness<
  T extends {
    readonly $identifier?: () => Resource.Identifier;
    readonly $type: string;
  },
> {
  readonly shapeName: string;

  constructor(
    readonly instance: T,
    readonly staticSide: Readonly<{
      equals: $EqualsFunction<T>;
      fromJson: $FromJsonObjectFunction<any, T, undefined>;
      fromRdfResource: $FromRdfResourceFunction<T>;
      hash: $HashFunction<T>;
      sparqlConstructQueryString: (parameters: {
        subject: NamedNode | Variable;
      }) => string;
      toJson: $ToJsonFunction<T, any>;
      toRdfResource: $ToRdfResourceFunction<Resource.Identifier, T>;
      $toString: $ToStringFunction<T>;
    }>,
    shapeName?: string,
  ) {
    this.shapeName = shapeName ?? instance.$type;
  }
}
