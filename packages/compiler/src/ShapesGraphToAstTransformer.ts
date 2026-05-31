import TermMap from "@rdfjs/term-map";
import type { BlankNode, NamedNode } from "@rdfjs/types";
import { dash } from "@tpluscode/rdf-ns-builders";
import { Either } from "purify-ts";
import { invariant } from "ts-invariant";
import type { Logger } from "ts-log";
import { ShapeStack } from "./_ShapesGraphToAstTransformer/ShapeStack.js";
import { transformShapeToAstType } from "./_ShapesGraphToAstTransformer/transformShapeToAstType.js";
import type * as ast from "./ast/index.js";
import type * as input from "./input/index.js";

export class ShapesGraphToAstTransformer {
  // Members are protected so they're accessible to functions in other files
  protected readonly cachedAstTypesByShapeIdentifier: TermMap<
    BlankNode | NamedNode,
    ast.Type
  > = new TermMap();
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
    const astNamedTypes: (
      | ast.IntersectionType
      | ast.StructType
      | ast.UnionType
    )[] = [];
    const syntheticAstStructTypesByName: Record<string, ast.StructType> = {};

    for (const nodeShape of this.shapesGraph.nodeShapes) {
      if (nodeShape.$identifier().termType !== "NamedNode") {
        continue;
      }

      if (nodeShape.$identifier().value.startsWith(dash[""].value)) {
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

      switch (nodeShapeAstType.kind) {
        case "Intersection":
        case "Union":
          if (nodeShapeAstType.name.isJust()) {
            astNamedTypes.push(nodeShapeAstType);
          }
          break;
        case "Struct": {
          invariant(
            nodeShapeAstType.name.isJust(),
            `node shape missing name: ${nodeShapeAstType.shapeIdentifier}`,
          );
          astNamedTypes.push(nodeShapeAstType);
          for (const property of nodeShapeAstType.properties) {
            switch (property.type.kind) {
              case "LazyOption":
              case "LazySet":
              case "Lazy": {
                const partialItemType =
                  property.type.partialType.kind === "Struct" ||
                  property.type.partialType.kind === "Union"
                    ? property.type.partialType
                    : property.type.partialType.itemType;

                if (
                  partialItemType.kind === "Struct" &&
                  partialItemType.synthetic
                ) {
                  const partialItemTypeName =
                    partialItemType.name.unsafeCoerce();
                  if (!syntheticAstStructTypesByName[partialItemTypeName]) {
                    syntheticAstStructTypesByName[partialItemTypeName] =
                      partialItemType as ast.StructType;
                  }
                }
              }
            }
          }

          break;
        }
        default:
          break;
      }
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
      namedTypes: astNamedTypes.concat(
        Object.values(syntheticAstStructTypesByName),
      ),
    });
  }
}
