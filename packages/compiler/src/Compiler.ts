import type { Either } from "purify-ts";
import type { Logger } from "ts-log";
import type { TsFeature } from "./enums/TsFeature.js";
import type { Generator } from "./generators/Generator.js";
import type { ShapesGraph } from "./input/ShapesGraph.js";
import { ShapesGraphToAstTransformer } from "./ShapesGraphToAstTransformer.js";

export class Compiler {
  private readonly generator: Generator;
  private readonly logger: Logger;
  private readonly tsFeaturesDefault?: ReadonlySet<TsFeature>;

  constructor({
    generator,
    logger,
  }: {
    generator: Generator;
    logger: Logger;
    tsFeaturesDefault?: ReadonlySet<TsFeature>;
  }) {
    this.generator = generator;
    this.logger = logger;
  }

  compile(shapesGraph: ShapesGraph): Either<Error, string> {
    return new ShapesGraphToAstTransformer({
      logger: this.logger,
      shapesGraph,
      tsFeaturesDefault: this.tsFeaturesDefault,
    })
      .transform()
      .map((ast) => this.generator.generate(ast));
  }
}
