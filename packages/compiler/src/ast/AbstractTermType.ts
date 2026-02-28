import type { BlankNode, Literal, NamedNode } from "@rdfjs/types";
import type { NodeKind } from "@shaclmate/shacl-ast";
import { AbstractType } from "./AbstractType.js";
import { arrayEquals, setEquals, strictEquals, termEquals } from "./equals.js";

/**
 * Abstract base class of term types (BlankNodeType, IdentifierType, LiteralType, IriType, TermType).
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
  readonly hasValues: readonly ConstantTermT[];
  readonly in_: readonly ConstantTermT[];
  abstract readonly kind:
    | "BlankNodeType"
    | "IdentifierType"
    | "IriType"
    | "LiteralType"
    | "TermType";
  abstract readonly nodeKinds: ReadonlySet<NodeKind>;

  constructor({
    hasValues,
    in_,
    ...superParameters
  }: {
    hasValues: readonly ConstantTermT[];
    in_: readonly ConstantTermT[];
  } & ConstructorParameters<typeof AbstractType>[0]) {
    super(superParameters);
    this.hasValues = hasValues;
    this.in_ = in_;
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

    if (!arrayEquals(termEquals)(this.hasValues, other.hasValues)) {
      return false;
    }

    if (!arrayEquals(termEquals)(this.in_, other.in_)) {
      return false;
    }

    if (!setEquals(strictEquals)(this.nodeKinds, other.nodeKinds)) {
      return false;
    }

    return true;
  }

  override toString() {
    return `${this.kind}(nodeKinds=${[...this.nodeKinds].join(" | ")})`;
  }
}
