import type { Either } from "purify-ts";
import type { Logger } from "ts-log";
import type { Generator } from "./generators/Generator.js";
import type { ShapesGraph } from "./input/ShapesGraph.js";
import { ShapesGraphToAstTransformer } from "./ShapesGraphToAstTransformer.js";

export class Compiler {
  private readonly generator: Generator;
  private readonly logger: Logger;

  constructor({
    generator,
    logger,
  }: {
    generator: Generator;
    logger: Logger;
  }) {
    this.generator = generator;
    this.logger = logger;
  }

  compile(shapesGraph: ShapesGraph): Either<Error, string> {
    return new ShapesGraphToAstTransformer({
      logger: this.logger,
      shapesGraph,
    })
      .transform()
      .map((ast) => this.generator.generate(ast));
  }
}
