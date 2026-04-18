import type { Either } from "purify-ts";
import type { Generator } from "./generators/Generator.js";
import type { ShapesGraph } from "./input/ShapesGraph.js";
import { ShapesGraphToAstTransformer } from "./ShapesGraphToAstTransformer.js";

export class Compiler {
  private readonly generator: Generator;
  constructor({ generator }: { generator: Generator }) {
    this.generator = generator;
  }

  compile(shapesGraph: ShapesGraph): Either<Error, string> {
    return new ShapesGraphToAstTransformer({
      shapesGraph,
    })
      .transform()
      .map((ast) => this.generator.generate(ast));
  }
}
