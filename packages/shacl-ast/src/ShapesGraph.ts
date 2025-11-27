import type TermMap from "@rdfjs/term-map";
import type { BlankNode, NamedNode } from "@rdfjs/types";
import { Maybe } from "purify-ts";
import { Memoize } from "typescript-memoize";
import type { OntologyLike } from "./OntologyLike.js";

export class ShapesGraph<
  NodeShapeT extends ShapeT,
  OntologyT extends OntologyLike,
  PropertyGroupT,
  PropertyShapeT extends ShapeT,
  ShapeT,
> {
  private readonly nodeShapesByIdentifier: TermMap<
    BlankNode | NamedNode,
    NodeShapeT
  >;
  private readonly ontologiesByIdentifier: TermMap<
    BlankNode | NamedNode,
    OntologyT
  >;
  private readonly propertyGroupsByIdentifier: TermMap<
    BlankNode | NamedNode,
    PropertyGroupT
  >;
  private readonly propertyShapesByIdentifier: TermMap<
    BlankNode | NamedNode,
    PropertyShapeT
  >;

  constructor(parameters: {
    nodeShapesByIdentifier: TermMap<BlankNode | NamedNode, NodeShapeT>;
    ontologiesByIdentifier: TermMap<BlankNode | NamedNode, OntologyT>;
    propertyGroupsByIdentifier: TermMap<BlankNode | NamedNode, PropertyGroupT>;
    propertyShapesByIdentifier: TermMap<BlankNode | NamedNode, PropertyShapeT>;
  }) {
    this.nodeShapesByIdentifier = parameters.nodeShapesByIdentifier;
    this.ontologiesByIdentifier = parameters.ontologiesByIdentifier;
    this.propertyGroupsByIdentifier = parameters.propertyGroupsByIdentifier;
    this.propertyShapesByIdentifier = parameters.propertyShapesByIdentifier;
  }

  @Memoize()
  get nodeShapes(): readonly NodeShapeT[] {
    return [...this.nodeShapesByIdentifier.values()];
  }

  nodeShapeByIdentifier(
    nodeShapeNode: BlankNode | NamedNode,
  ): Maybe<NodeShapeT> {
    return Maybe.fromNullable(this.nodeShapesByIdentifier.get(nodeShapeNode));
  }

  @Memoize()
  get ontologies(): readonly OntologyT[] {
    return [...this.ontologiesByIdentifier.values()];
  }

  ontologyByIdentifier(identifier: BlankNode | NamedNode): Maybe<OntologyT> {
    return Maybe.fromNullable(this.ontologiesByIdentifier.get(identifier));
  }

  propertyGroupByIdentifier(
    identifier: BlankNode | NamedNode,
  ): Maybe<PropertyGroupT> {
    return Maybe.fromNullable(this.propertyGroupsByIdentifier.get(identifier));
  }

  @Memoize()
  get propertyGroups(): readonly PropertyGroupT[] {
    return [...this.propertyGroupsByIdentifier.values()];
  }

  propertyShapeByIdentifier(
    identifier: BlankNode | NamedNode,
  ): Maybe<PropertyShapeT> {
    return Maybe.fromNullable(this.propertyShapesByIdentifier.get(identifier));
  }

  @Memoize()
  get propertyShapes(): readonly PropertyShapeT[] {
    return [...this.propertyShapesByIdentifier.values()];
  }

  shapeByIdentifier(identifier: BlankNode | NamedNode): Maybe<ShapeT> {
    const nodeShape = this.nodeShapeByIdentifier(identifier);
    if (nodeShape.isJust()) {
      return nodeShape;
    }
    return this.propertyShapeByIdentifier(identifier);
  }
}
