import PrefixMap from "@rdfjs/prefix-map/PrefixMap.js";
import type { Either } from "purify-ts";
import type { Generator } from "./generators/Generator.js";
import type { ShapesGraph } from "./input/ShapesGraph.js";
import { ShapesGraphToAstTransformer } from "./ShapesGraphToAstTransformer.js";

export class Compiler {
  private readonly generator: Generator;
  private readonly iriPrefixMap: PrefixMap;

  constructor({
    generator,
    iriPrefixMap,
  }: { generator: Generator; iriPrefixMap?: PrefixMap }) {
    this.generator = generator;
    this.iriPrefixMap = iriPrefixMap ?? new PrefixMap();
  }

  compile(shapesGraph: ShapesGraph): Either<Error, string> {
    const astEither = new ShapesGraphToAstTransformer({
      iriPrefixMap: this.iriPrefixMap,
      shapesGraph,
    }).transform();

    return astEither.map((ast) => this.generator.generate(ast));
  }
}
