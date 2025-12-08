import type { BlankNode, Literal, NamedNode } from "@rdfjs/types";
import type { NodeKind } from "@shaclmate/shacl-ast";
import type { Maybe } from "purify-ts";
import { AbstractType } from "./AbstractType.js";
import {
  arrayEquals,
  maybeEquals,
  setEquals,
  strictEquals,
  termEquals,
} from "./equals.js";

/**
 * Abstract base class of term types (IdentifierType, LiteralType, TermType).
 *
 * ConstantTermT is the type of sh:defaultValue, sh:hasValue, and sh:in.
 * RuntimeTermT is the type of values at runtime.
 *
 * The two are differentiated because identifiers can have BlankNode or NamedNode values at runtime but only NamedNode values for sh:defaultValue et al.
 */
export abstract class AbstractTermType<
  ConstantTermT extends Literal | NamedNode = Literal | NamedNode,
  _RuntimeTermT extends BlankNode | Literal | NamedNode =
    | BlankNode
    | Literal
    | NamedNode,
> extends AbstractType {
  readonly defaultValue: Maybe<ConstantTermT>;
  readonly hasValues: readonly ConstantTermT[];
  readonly in_: readonly ConstantTermT[];
  abstract readonly kind: "IdentifierType" | "LiteralType" | "TermType";
  readonly nodeKinds: ReadonlySet<_RuntimeTermT["termType"]>;

  constructor({
    defaultValue,
    hasValues,
    in_,
    nodeKinds,
    ...superParameters
  }: {
    defaultValue: Maybe<ConstantTermT>;
    hasValues: readonly ConstantTermT[];
    in_: readonly ConstantTermT[];
    nodeKinds: ReadonlySet<NodeKind>;
  } & ConstructorParameters<typeof AbstractType>[0]) {
    super(superParameters);
    this.defaultValue = defaultValue;
    this.hasValues = hasValues;
    this.in_ = in_;
    this.nodeKinds = nodeKinds;
  }

  override equals(
    other: AbstractTermType<ConstantTermT, _RuntimeTermT>,
  ): boolean {
    if (!super.equals(other)) {
      return false;
    }

    if (this.kind !== other.kind) {
      return false;
    }

    if (!maybeEquals(this.defaultValue, other.defaultValue, termEquals)) {
      return false;
    }

    if (!arrayEquals(this.hasValues, other.hasValues, termEquals)) {
      return false;
    }

    if (!arrayEquals(this.in_, other.in_, termEquals)) {
      return false;
    }

    if (!setEquals(this.nodeKinds, other.nodeKinds, strictEquals)) {
      return false;
    }

    return true;
  }

  override toString() {
    return `${this.kind}(nodeKinds=${[...this.nodeKinds].join(" | ")})`;
  }
}
