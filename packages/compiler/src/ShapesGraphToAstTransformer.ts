import TermMap from "@rdfjs/term-map";
import type { BlankNode, NamedNode } from "@rdfjs/types";
import { Either } from "purify-ts";
import type { Logger } from "ts-log";
import { ShapeStack } from "./_ShapesGraphToAstTransformer/ShapeStack.js";
import { transformShapeToAstType } from "./_ShapesGraphToAstTransformer/transformShapeToAstType.js";
import type * as ast from "./ast/index.js";
import type * as input from "./input/index.js";

type MutableArray<T> = T extends ReadonlyArray<infer U> ? U[] : T;

export class ShapesGraphToAstTransformer {
  // Members are protected so they're accessible to functions in other files
  protected readonly cachedAstTypesByShapeIdentifier: TermMap<
    BlankNode | NamedNode,
    ast.Type
  > = new TermMap();
  protected readonly syntheticAstStructTypes: ast.StructType[] = [];
  protected readonly logger: Logger;
  protected readonly shapesGraph: input.ShapesGraph;

  constructor({
    logger,
    shapesGraph,
  }: {
    logger: Logger;
    shapesGraph: input.ShapesGraph;
  }) {
    this.logger = logger;
    this.shapesGraph = shapesGraph;
  }

  transform(): Either<Error, ast.Ast> {
    const astNamedTypes: MutableArray<ast.Ast["namedTypes"]> = [];

    for (const nodeShape of this.shapesGraph.nodeShapes) {
      if (nodeShape.$identifier().termType !== "NamedNode") {
        continue;
      }

      if (nodeShape.ignore) {
        continue;
      }

      const nodeShapeAstTypeEither = transformShapeToAstType.call(
        this,
        nodeShape,
        new ShapeStack(), // Start a new ShapeStack per named node shape
      );
      if (nodeShapeAstTypeEither.isLeft()) {
        return nodeShapeAstTypeEither;
      }

      const nodeShapeAstType = nodeShapeAstTypeEither.unsafeCoerce();

      nodeShapeAstType.name.ifJust(() => {
        astNamedTypes.push(nodeShapeAstType);
      });
    }

    return Either.of({
      lazyTypesCount: [...this.cachedAstTypesByShapeIdentifier.values()].reduce(
        (acc, astType) => {
          switch (astType.kind) {
            case "Lazy":
            case "LazyOption":
            case "LazySet":
              return acc + 1;
            default:
              return acc;
          }
        },
        0,
      ),
      namedTypes: astNamedTypes.concat(this.syntheticAstStructTypes),
    });
  }
}
