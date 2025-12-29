import type { Maybe } from "purify-ts";
import type * as generated from "./generated.js";
import type { OntologyLike } from "./OntologyLike.js";
import { Shape } from "./Shape.js";
import type { ShapesGraph } from "./ShapesGraph.js";

export class NodeShape<
  NodeShapeT extends ShapeT,
  OntologyT extends OntologyLike,
  PropertyGroupT,
  PropertyShapeT extends ShapeT,
  ShapeT,
> extends Shape<NodeShapeT, OntologyT, PropertyGroupT, PropertyShapeT, ShapeT> {
  readonly constraints: NodeShape.Constraints<
    NodeShapeT,
    OntologyT,
    PropertyGroupT,
    PropertyShapeT,
    ShapeT
  >;

  constructor(
    generatedShaclCoreNodeShape: Omit<generated.ShaclCoreNodeShape, "$type">,
    shapesGraph: ShapesGraph<
      NodeShapeT,
      OntologyT,
      PropertyGroupT,
      PropertyShapeT,
      ShapeT
    >,
  ) {
    super(generatedShaclCoreNodeShape, shapesGraph);
    this.constraints = new NodeShape.Constraints(
      generatedShaclCoreNodeShape,
      shapesGraph,
    );
  }

  override toString(): string {
    return `NodeShape(node=${this.identifier.value})`;
  }
}

export namespace NodeShape {
  export class Constraints<
    NodeShapeT extends ShapeT,
    OntologyT extends OntologyLike,
    PropertyGroupT,
    PropertyShapeT extends ShapeT,
    ShapeT,
  > extends Shape.Constraints<
    NodeShapeT,
    OntologyT,
    PropertyGroupT,
    PropertyShapeT,
    ShapeT
  > {
    constructor(
      private readonly generatedShaclCoreNodeShape: Omit<
        generated.ShaclCoreNodeShape,
        "$type"
      >,
      shapesGraph: ShapesGraph<
        NodeShapeT,
        OntologyT,
        PropertyGroupT,
        PropertyShapeT,
        ShapeT
      >,
    ) {
      super(generatedShaclCoreNodeShape, shapesGraph);
    }

    get closed(): Maybe<boolean> {
      return this.generatedShaclCoreNodeShape.closed;
    }

    get properties(): readonly PropertyShapeT[] {
      return this.generatedShaclCoreNodeShape.properties.flatMap((identifier) =>
        this.shapesGraph.propertyShapeByIdentifier(identifier).toList(),
      );
    }
  }
}
