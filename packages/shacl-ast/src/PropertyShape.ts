import type { Literal, NamedNode } from "@rdfjs/types";
import { Either, type Maybe } from "purify-ts";
import { PropertyPath, Resource } from "rdfjs-resource";
import { Memoize } from "typescript-memoize";
import type * as generated from "./generated.js";
import type { OntologyLike } from "./OntologyLike.js";
import { Shape } from "./Shape.js";
import type { ShapesGraph } from "./ShapesGraph.js";

export class PropertyShape<
  NodeShapeT extends ShapeT,
  OntologyT extends OntologyLike,
  PropertyGroupT,
  PropertyShapeT extends ShapeT,
  ShapeT,
> extends Shape<NodeShapeT, OntologyT, PropertyGroupT, PropertyShapeT, ShapeT> {
  readonly constraints: Shape.Constraints<
    NodeShapeT,
    OntologyT,
    PropertyGroupT,
    PropertyShapeT,
    ShapeT
  >;

  constructor(
    private readonly generatedPropertyShape: Omit<
      generated.PropertyShape,
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
    super(generatedPropertyShape, shapesGraph);
    this.constraints = new Shape.Constraints(
      generatedPropertyShape,
      shapesGraph,
    );
  }

  get defaultValue(): Maybe<Literal | NamedNode> {
    return this.generatedPropertyShape.defaultValue;
  }

  get descriptions(): readonly string[] {
    return this.generatedPropertyShape.descriptions;
  }

  @Memoize()
  get groups(): Either<Error, readonly PropertyGroupT[]> {
    return Either.sequence(
      this.generatedPropertyShape.groups.map((identifier) =>
        this.shapesGraph.propertyGroupByIdentifier(identifier),
      ),
    );
  }

  get names(): readonly string[] {
    return this.generatedPropertyShape.names;
  }

  get order(): Maybe<number> {
    return this.generatedPropertyShape.order;
  }

  get path(): PropertyPath {
    return this.generatedPropertyShape.path;
  }

  @Memoize()
  override toString(): string {
    return `PropertyShape(${[
      `identifier=${Resource.Identifier.toString(this.identifier)}`,
      `path=${PropertyPath.toString(this.path)}`,
    ].join(", ")})`;
  }
}
