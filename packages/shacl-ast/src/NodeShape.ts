import { Either, type Maybe } from "purify-ts";
import { Resource } from "rdfjs-resource";
import { Memoize } from "typescript-memoize";
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
    generatedNodeShape: Omit<generated.NodeShape, "$type">,
    shapesGraph: ShapesGraph<
      NodeShapeT,
      OntologyT,
      PropertyGroupT,
      PropertyShapeT,
      ShapeT
    >,
  ) {
    super(generatedNodeShape, shapesGraph);
    this.constraints = new NodeShape.Constraints(
      generatedNodeShape,
      shapesGraph,
    );
  }

  @Memoize()
  override toString(): string {
    return `NodeShape(identifier=${Resource.Identifier.toString(this.identifier)})`;
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
      private readonly generatedNodeShape: Omit<generated.NodeShape, "$type">,
      shapesGraph: ShapesGraph<
        NodeShapeT,
        OntologyT,
        PropertyGroupT,
        PropertyShapeT,
        ShapeT
      >,
    ) {
      super(generatedNodeShape, shapesGraph);
    }

    get closed(): Maybe<boolean> {
      return this.generatedNodeShape.closed;
    }

    @Memoize()
    get properties(): Either<Error, readonly PropertyShapeT[]> {
      return Either.sequence(
        this.generatedNodeShape.properties.map((identifier) =>
          this.shapesGraph.propertyShape(identifier),
        ),
      );
    }
  }
}
