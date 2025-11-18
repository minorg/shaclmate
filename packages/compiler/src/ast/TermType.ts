import type { BlankNode, Literal, NamedNode } from "@rdfjs/types";
import type { NodeKind } from "@shaclmate/shacl-ast";
import type { Maybe } from "purify-ts";

/**
 * Parent interface of term types in the ASTs (e.g., identifiers, identifiers).
 *
 * ConstantTermT is the type of sh:defaultValue, sh:hasValue, and sh:in.
 * RuntimeTermT is the type of values at runtime.
 *
 * The two are differentiated because identifiers can have BlankNode or NamedNode values at runtime but only NamedNode values for sh:defaultValue et al.
 */
export abstract class TermType<
  ConstantTermT extends Literal | NamedNode = Literal | NamedNode,
  _RuntimeTermT extends BlankNode | Literal | NamedNode =
    | BlankNode
    | Literal
    | NamedNode,
> {
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
  }: {
    defaultValue: Maybe<ConstantTermT>;
    hasValues: readonly ConstantTermT[];
    in_: readonly ConstantTermT[];
    nodeKinds: ReadonlySet<NodeKind>;
  }) {
    this.defaultValue = defaultValue;
    this.hasValues = hasValues;
    this.in_ = in_;
    this.nodeKinds = nodeKinds;
  }
}
