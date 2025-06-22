import { PropertyShape as ShaclCorePropertyShape } from "@shaclmate/shacl-ast";
import { Maybe } from "purify-ts";
import type { PropertyVisibility } from "../enums/index.js";
import type { Shape } from "./Shape.js";
import type * as generated from "./generated.js";
import type {
  NodeShape,
  Ontology,
  PropertyGroup,
  ShapesGraph,
} from "./index.js";

export class PropertyShape extends ShaclCorePropertyShape<
  NodeShape,
  Ontology,
  PropertyGroup,
  any,
  Shape
> {
  constructor(
    private readonly generatedShaclmatePropertyShape: generated.ShaclmatePropertyShape,
    shapesGraph: ShapesGraph,
  ) {
    super(
      { ...generatedShaclmatePropertyShape, uniqueLang: Maybe.empty() },
      shapesGraph,
    );
  }

  get extern(): Maybe<boolean> {
    return this.generatedShaclmatePropertyShape.extern;
  }

  get mutable(): Maybe<boolean> {
    return this.generatedShaclmatePropertyShape.mutable;
  }

  get shaclmateName(): Maybe<string> {
    return this.generatedShaclmatePropertyShape.name;
  }

  get visibility(): PropertyVisibility {
    return this.generatedShaclmatePropertyShape.visibility
      .map((iri) => {
        switch (iri.value) {
          case "http://purl.org/shaclmate/ontology#_Visibility_Private":
            return "private";
          case "http://purl.org/shaclmate/ontology#_Visibility_Protected":
            return "protected";
          case "http://purl.org/shaclmate/ontology#_Visibility_Public":
            return "public";
          default:
            throw new RangeError(iri.value);
        }
      })
      .orDefault("public" as const);
  }

  get widen(): Maybe<boolean> {
    return this.generatedShaclmatePropertyShape.widen;
  }
}
