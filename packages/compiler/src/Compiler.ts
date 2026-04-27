import type { Either } from "purify-ts";
import type { TsFeature } from "./enums/TsFeature.js";
import type { Generator } from "./generators/Generator.js";
import type { ShapesGraph } from "./input/ShapesGraph.js";
import { ShapesGraphToAstTransformer } from "./ShapesGraphToAstTransformer.js";

export class Compiler {
  private readonly generator: Generator;
  private readonly tsFeaturesDefault?: ReadonlySet<TsFeature>;

  constructor({
    generator,
  }: { generator: Generator; tsFeaturesDefault?: ReadonlySet<TsFeature> }) {
    this.generator = generator;
  }

  compile(shapesGraph: ShapesGraph): Either<Error, string> {
    return new ShapesGraphToAstTransformer({
      shapesGraph,
      tsFeaturesDefault: this.tsFeaturesDefault,
    })
      .transform()
      .map((ast) => this.generator.generate(ast));
  }
}
