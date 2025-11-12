import type PrefixMap from "@rdfjs/prefix-map/PrefixMap.js";
import TermMap from "@rdfjs/term-map";
import type * as rdfjs from "@rdfjs/types";
import { dash } from "@tpluscode/rdf-ns-builders";
import { Either } from "purify-ts";
import * as _ShapesGraphToAstTransformer from "./_ShapesGraphToAstTransformer/index.js";
import * as ast from "./ast/index.js";
import type * as input from "./input/index.js";
import { logger } from "./logger.js";

export class ShapesGraphToAstTransformer {
  // Members are protected so they're accessible to the bound functions
  protected readonly astObjectTypePropertiesByIdentifier: TermMap<
    rdfjs.BlankNode | rdfjs.NamedNode,
    ast.ObjectType.Property
  > = new TermMap();
  protected readonly iriLocalParts: Record<string, Record<string, number>> = {};
  protected readonly iriPrefixMap: PrefixMap;
  protected readonly nodeShapeAstTypesByIdentifier: TermMap<
    rdfjs.BlankNode | rdfjs.NamedNode,
    _ShapesGraphToAstTransformer.NodeShapeAstType
  > = new TermMap();
  protected shapeAstName = _ShapesGraphToAstTransformer.shapeAstName;
  protected readonly shapesGraph: input.ShapesGraph;
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
    this.iriPrefixMap = iriPrefixMap;
    this.shapesGraph = shapesGraph;
  }

  transform(): Either<Error, ast.Ast> {
    const nodeShapeAstObjectIntersectionTypes: ast.ObjectIntersectionType[] =
      [];
    const nodeShapeAstObjectTypes: ast.ObjectType[] = [];
    const syntheticAstObjectTypesByName: Record<string, ast.ObjectType> = {};
    const nodeShapeAstObjectUnionTypes: ast.ObjectUnionType[] = [];

    // First pass: transform all node shapes
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
            property.partialType
              .map((partialType) =>
                partialType.kind === "ObjectType" ||
                partialType.kind === "ObjectUnionType"
                  ? partialType
                  : partialType.itemType,
              )
              .filter(
                (partialItemType) => partialItemType.kind === "ObjectType",
              )
              .filter((partialItemType) => partialItemType.synthetic)
              .ifJust((partialItemType) => {
                const partialItemTypeName =
                  partialItemType.name.syntheticName.unsafeCoerce();
                if (!syntheticAstObjectTypesByName[partialItemTypeName]) {
                  syntheticAstObjectTypesByName[partialItemTypeName] =
                    partialItemType as ast.ObjectType;
                }
              });
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

    // Second pass: check whether any AST object type properties are recursive
    // Everything must be transformed first in the first pass for this to work.
    for (const astObjectType of nodeShapeAstObjectTypes) {
      for (const astObjectTypeProperty of astObjectType.properties) {
        astObjectTypeProperty.recursive =
          _ShapesGraphToAstTransformer.isAstObjectTypePropertyRecursive(
            astObjectType,
            astObjectTypeProperty,
          );
        if (astObjectTypeProperty.recursive) {
          logger.debug(
            "object type %s property %s is recursive",
            ast.Type.toString(astObjectType),
            ast.ObjectType.Property.toString(astObjectTypeProperty),
          );
        }
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
