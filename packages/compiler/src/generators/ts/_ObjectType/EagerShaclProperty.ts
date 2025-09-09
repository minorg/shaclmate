import { Maybe } from "purify-ts";
import type {} from "ts-morph";

import { Memoize } from "typescript-memoize";
import type { Type } from "../Type.js";
import { ShaclProperty } from "./ShaclProperty.js";

export class EagerShaclProperty<
  TypeT extends Type,
> extends ShaclProperty<TypeT> {
  override readonly mutable: boolean;
  override readonly recursive: boolean;

  constructor({
    mutable,
    recursive,
    ...superParameters
  }: {
    mutable: boolean;
    recursive: boolean;
  } & ConstructorParameters<typeof ShaclProperty<TypeT>>[0]) {
    super(superParameters);
    this.mutable = mutable;
    this.recursive = recursive;
  }

  @Memoize()
  override get graphqlField(): ShaclProperty<TypeT>["graphqlField"] {
    return Maybe.of({
      description: this.comment.map(JSON.stringify).extract(),
      name: this.name,
      resolve: `(source) => ${this.type.graphqlResolveExpression({ variables: { value: `source.${this.name}` } })}`,
      type: this.type.graphqlName,
    });
  }
}
