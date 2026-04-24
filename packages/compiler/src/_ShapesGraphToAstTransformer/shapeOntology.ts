import { Either, Maybe } from "purify-ts";
import type * as input from "../input/index.js";
import type { ShapesGraphToAstTransformer } from "../ShapesGraphToAstTransformer.js";

export function shapeOntology(
  this: ShapesGraphToAstTransformer,
  shape: input.Shape,
): Either<Error, Maybe<input.Ontology>> {
  if (shape.isDefinedBy.isJust()) {
    // If there's an rdfs:isDefinedBy statement on the shape then don't fall back to anything else
    return this.shapesGraph
      .ontology(shape.isDefinedBy.unsafeCoerce())
      .map(Maybe.of);
  }

  // No rdfs:isDefinedBy statement on the shape

  const ontologies = this.shapesGraph.ontologies;
  if (ontologies.length === 1) {
    // If there's a single ontology in the shapes graph, consider the shape a part of the ontology
    return Either.of(Maybe.of(ontologies[0]));
  }

  if (shape.$identifier.termType === "NamedNode") {
    const prefixOntologies = ontologies.filter(
      (ontology) =>
        ontology.$identifier.termType === "NamedNode" &&
        shape.$identifier.value.startsWith(ontology.$identifier.value),
    );
    if (prefixOntologies.length === 1) {
      // If there's a single ontology whose IRI is a prefix of this shape's IRI, consider the shape a part of the ontology
      return Either.of(Maybe.of(prefixOntologies[0]));
    }
  }

  return Either.of(Maybe.empty());
}
