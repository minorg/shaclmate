import type PrefixMap from "@rdfjs/prefix-map/PrefixMap.js";
import TermMap from "@rdfjs/term-map";
import type * as rdfjs from "@rdfjs/types";
import { dash } from "@tpluscode/rdf-ns-builders";
import { Either } from "purify-ts";
import * as _ShapesGraphToAstTransformer from "./_ShapesGraphToAstTransformer/index.js";
import type * as ast from "./ast/index.js";
import type * as input from "./input/index.js";

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
  protected transformPropertyShapeToAstCompositeType =
    _ShapesGraphToAstTransformer.transformPropertyShapeToAstCompositeType;
  protected transformPropertyShapeToAstIdentifierType =
    _ShapesGraphToAstTransformer.transformPropertyShapeToAstIdentifierType;
  protected transformPropertyShapeToAstLiteralType =
    _ShapesGraphToAstTransformer.transformPropertyShapeToAstLiteralType;
  protected transformPropertyShapeToAstObjectTypeProperty =
    _ShapesGraphToAstTransformer.transformPropertyShapeToAstObjectTypeProperty;
  protected transformPropertyShapeToAstTermType =
    _ShapesGraphToAstTransformer.transformPropertyShapeToAstTermType;
  protected transformPropertyShapeToAstType =
    _ShapesGraphToAstTransformer.transformPropertyShapeToAstType;

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
            property.stubType
              .map((stubType) =>
                stubType.kind === "ObjectType" ||
                stubType.kind === "ObjectUnionType"
                  ? stubType
                  : stubType.itemType,
              )
              .filter((stubItemType) => stubItemType.kind === "ObjectType")
              .filter((stubItemType) => stubItemType.synthetic)
              .ifJust((stubItemType) => {
                const stubItemTypeName =
                  stubItemType.name.syntheticName.unsafeCoerce();
                if (!syntheticAstObjectTypesByName[stubItemTypeName]) {
                  syntheticAstObjectTypesByName[stubItemTypeName] =
                    stubItemType as ast.ObjectType;
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

    return Either.of({
      objectIntersectionTypes: nodeShapeAstObjectIntersectionTypes,
      objectTypes: nodeShapeAstObjectTypes.concat(
        Object.values(syntheticAstObjectTypesByName),
      ),
      objectUnionTypes: nodeShapeAstObjectUnionTypes,
    });
  }
}
