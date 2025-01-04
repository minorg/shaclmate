import { PropertyShape as CorePropertyShape } from "@shaclmate/shacl-ast";
import { Either, Left, type Maybe } from "purify-ts";
import type { PropertyVisibility } from "../enums/index.js";
import { shaclmate } from "../vocabularies/index.js";
import type { Shape } from "./Shape.js";
import { extern } from "./extern.js";
import type { NodeShape, Ontology, PropertyGroup } from "./index.js";
import { shaclmateName } from "./shaclmateName.js";

export class PropertyShape extends CorePropertyShape<
  NodeShape,
  Ontology,
  PropertyGroup,
  any,
  Shape
> {
  get extern(): Maybe<boolean> {
    return extern.bind(this)();
  }

  get shaclmateName(): Maybe<string> {
    return shaclmateName.bind(this)();
  }

  get visibility(): PropertyVisibility {
    return this.resource
      .value(shaclmate.visibility)
      .chain((value) => value.toIri())
      .chain((iri) => {
        if (iri.equals(shaclmate._Visibility_Private)) {
          return Either.of("private" as const);
        }
        if (iri.equals(shaclmate._Visibility_Protected)) {
          return Either.of("protected" as const);
        }
        if (iri.equals(shaclmate._Visibility_Public)) {
          return Either.of("public" as const);
        }
        return Left(new Error(`unknown visibility: ${iri.value}`));
      })
      .orDefault("public" as const);
  }
}
