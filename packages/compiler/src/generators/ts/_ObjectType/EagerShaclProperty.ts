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
      args: Maybe.empty(),
      description: this.comment.map(JSON.stringify),
      name: this.name,
      resolve: `(source, _args) => ${this.type.graphqlResolveExpression({ variables: { args: "_args", value: `source.${this.name}` } })}`,
      type: this.type.graphqlName.toString(),
    });
  }
}
