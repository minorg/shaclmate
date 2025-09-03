import type * as rdfjs from "@rdfjs/types";
import type { Maybe } from "purify-ts";
import type {} from "ts-morph";
import { Memoize } from "typescript-memoize";
import type { Type } from "../Type.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { tsComment } from "../tsComment.js";
import { Property } from "./Property.js";

export abstract class ShaclProperty extends Property<Type> {
  protected readonly comment: Maybe<string>;
  protected readonly description: Maybe<string>;
  protected readonly label: Maybe<string>;

  readonly path: rdfjs.NamedNode;

  constructor({
    comment,
    description,
    label,
    path,
    ...superParameters
  }: {
    comment: Maybe<string>;
    description: Maybe<string>;
    label: Maybe<string>;
    path: rdfjs.NamedNode;
    type: Type;
  } & ConstructorParameters<typeof Property>[0]) {
    super(superParameters);
    this.comment = comment;
    this.description = description;
    this.label = label;
    this.path = path;
  }

  protected get declarationComment(): string | undefined {
    return this.comment
      .alt(this.description)
      .alt(this.label)
      .map(tsComment)
      .extract();
  }

  @Memoize()
  protected get predicate(): string {
    return `${this.objectType.staticModuleName}.${syntheticNamePrefix}properties.${this.name}["identifier"]`;
  }
}
