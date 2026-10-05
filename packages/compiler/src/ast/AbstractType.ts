import type { NodeKind } from "@shaclmate/shacl-ast";
import type { Maybe } from "purify-ts";
import { AbstractConstruct } from "./AbstractConstruct.js";
import { maybeEquals, strictEquals } from "./equals.js";

/**
 * Abstract base class for Types.
 */
export abstract class AbstractType extends AbstractConstruct {
  /**
   * Type discriminant
   */
  abstract readonly kind: string;

  /**
   * Name of this type, from shaclmate:name or sh:name.
   */
  readonly name: Maybe<string>;

  /**
   * The range of node kinds of this type.
   *
   * For example, a struct type has blank and IRI node kinds, while a string type has a Literal node kind.
   */
  abstract readonly nodeKinds: ReadonlySet<NodeKind>;

  /**
   * Does this type directly or indirectly reference itself?
   */
  abstract readonly recursive: boolean;

  constructor({
    name,
    ...superParameters
  }: {
    name: Maybe<string>;
  } & ConstructorParameters<typeof AbstractConstruct>[0]) {
    super(superParameters);
    this.name = name;
  }

  override equals(other: AbstractType): boolean {
    if (!super.equals(other)) {
      return false;
    }

    if (!maybeEquals(strictEquals)(this.name, other.name)) {
      return false;
    }

    return true;
  }

  override toJSON() {
    return {
      ...super.toJSON(),
      kind: this.kind,
      name: this.name.extract(),
      recursive: this.recursive ? true : undefined,
    };
  }
}
