import type PrefixMap from "@rdfjs/prefix-map/PrefixMap.js";
import TermMap from "@rdfjs/term-map";
import type * as rdfjs from "@rdfjs/types";
import { dash } from "@tpluscode/rdf-ns-builders";
import { Either } from "purify-ts";
import { CurieFactory } from "./_ShapesGraphToAstTransformer/CurieFactory.js";
import * as _ShapesGraphToAstTransformer from "./_ShapesGraphToAstTransformer/index.js";
import type * as ast from "./ast/index.js";
import type * as input from "./input/index.js";
import { logger } from "./logger.js";

export class ShapesGraphToAstTransformer {
  // Members are protected so they're accessible to the bound functions
  protected readonly curieFactory: CurieFactory;
  protected readonly nodeShapeAstTypesByIdentifier: TermMap<
    rdfjs.BlankNode | rdfjs.NamedNode,
    _ShapesGraphToAstTransformer.NodeShapeAstType
  > = new TermMap();
  protected readonly shapesGraph: input.ShapesGraph;
  protected shapeIdentifier = _ShapesGraphToAstTransformer.shapeIdentifier;
  protected transformNodeShapeToAstType =
    _ShapesGraphToAstTransformer.transformNodeShapeToAstType;
  protected transformPropertyShapeToAstObjectTypeProperty =
    _ShapesGraphToAstTransformer.transformPropertyShapeToAstObjectTypeProperty;
  protected transformShapeToAstCompositeType =
    _ShapesGraphToAstTransformer.transformShapeToAstCompositeType;
  protected transformShapeToAstIdentifierType =
    _ShapesGraphToAstTransformer.transformShapeToAstIdentifierType;
  protected transformShapeToAstLiteralType =
    _ShapesGraphToAstTransformer.transformShapeToAstLiteralType;
  protected transformShapeToAstTermType =
    _ShapesGraphToAstTransformer.transformShapeToAstTermType;
  protected transformShapeToAstType =
    _ShapesGraphToAstTransformer.transformShapeToAstType;

  constructor({
    iriPrefixMap,
    shapesGraph,
  }: {
    iriPrefixMap: PrefixMap;
    shapesGraph: input.ShapesGraph;
  }) {
    this.curieFactory = new CurieFactory({ prefixMap: iriPrefixMap });
    this.shapesGraph = shapesGraph;
  }

  transform(): Either<Error, ast.Ast> {
    const nodeShapeAstObjectIntersectionTypes: ast.ObjectIntersectionType[] =
      [];
    const nodeShapeAstObjectTypes: ast.ObjectType[] = [];
    const syntheticAstObjectTypesByName: Record<string, ast.ObjectType> = {};
    const nodeShapeAstObjectUnionTypes: ast.ObjectUnionType[] = [];

    for (const nodeShape of this.shapesGraph.nodeShapes) {
      if (nodeShape.identifier.termType !== "NamedNode") {
        continue;
      }

      if (nodeShape.identifier.value.startsWith(dash[""].value)) {
        continue;
      }

      const nodeShapeAstTypeEither =
        this.transformNodeShapeToAstType(nodeShape);
      if (nodeShapeAstTypeEither.isLeft()) {
        logger.warn((nodeShapeAstTypeEither.extract() as Error).message);
        continue;
      }
      const nodeShapeAstType = nodeShapeAstTypeEither.unsafeCoerce();

      switch (nodeShapeAstType.kind) {
        case "ListType":
          break; // Ignore
        case "ObjectIntersectionType":
          nodeShapeAstObjectIntersectionTypes.push(nodeShapeAstType);
          break;
        case "ObjectType": {
          nodeShapeAstObjectTypes.push(nodeShapeAstType);
          for (const property of nodeShapeAstType.properties) {
            switch (property.type.kind) {
              case "LazyObjectOptionType":
              case "LazyObjectSetType":
              case "LazyObjectType": {
                const partialItemType =
                  property.type.partialType.kind === "ObjectType" ||
                  property.type.partialType.kind === "ObjectUnionType"
                    ? property.type.partialType
                    : property.type.partialType.itemType;

                if (
                  partialItemType.kind === "ObjectType" &&
                  partialItemType.synthetic
                ) {
                  const partialItemTypeName =
                    partialItemType.name.unsafeCoerce();
                  if (!syntheticAstObjectTypesByName[partialItemTypeName]) {
                    syntheticAstObjectTypesByName[partialItemTypeName] =
                      partialItemType as ast.ObjectType;
                  }
                }
              }
            }
          }

          break;
        }
        case "ObjectUnionType":
          nodeShapeAstObjectUnionTypes.push(nodeShapeAstType);
          break;
        default:
          nodeShapeAstType satisfies never;
      }
    }

    return Either.of({
      objectIntersectionTypes: nodeShapeAstObjectIntersectionTypes,
      objectTypes: nodeShapeAstObjectTypes.concat(
        Object.values(syntheticAstObjectTypesByName),
      ),
      objectUnionTypes: nodeShapeAstObjectUnionTypes,
    });
  }
}
