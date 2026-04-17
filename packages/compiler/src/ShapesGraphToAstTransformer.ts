import type PrefixMap from "@rdfjs/prefix-map/PrefixMap.js";
import TermMap from "@rdfjs/term-map";
import type * as rdfjs from "@rdfjs/types";
import { dash } from "@tpluscode/rdf-ns-builders";
import { Either } from "purify-ts";
import { CurieFactory } from "./_ShapesGraphToAstTransformer/CurieFactory.js";
import { nodeShapeTsFeatures } from "./_ShapesGraphToAstTransformer/nodeShapeTsFeatures.js";
import { shapeIdentifier } from "./_ShapesGraphToAstTransformer/shapeIdentifier.js";
import { transformNodeShapeToAstType } from "./_ShapesGraphToAstTransformer/transformNodeShapeToAstType.js";
import type * as ast from "./ast/index.js";
import type { TsFeature } from "./enums/TsFeature.js";
import type * as input from "./input/index.js";

export class ShapesGraphToAstTransformer {
  // Members are protected so they're accessible to the bound functions
  protected readonly curieFactory: CurieFactory;
  protected readonly nodeShapeAstTypesByIdentifier: TermMap<
    rdfjs.BlankNode | rdfjs.NamedNode,
    ast.Type
  > = new TermMap();
  protected nodeShapeTsFeatures = nodeShapeTsFeatures;
  protected shapeIdentifier = shapeIdentifier;
  protected readonly shapesGraph: input.ShapesGraph;
  protected tsFeaturesDefault: ReadonlySet<TsFeature>;

  constructor({
    iriPrefixMap,
    shapesGraph,
    tsFeaturesDefault,
  }: {
    iriPrefixMap: PrefixMap;
    shapesGraph: input.ShapesGraph;
    tsFeaturesDefault?: ReadonlySet<TsFeature>;
  }) {
    this.curieFactory = new CurieFactory({ prefixMap: iriPrefixMap });
    this.shapesGraph = shapesGraph;
    this.tsFeaturesDefault =
      tsFeaturesDefault ??
      new Set(["create", "equals", "hash", "json", "rdf"] as const);
  }

  transform(): Either<Error, ast.Ast> {
    const astNamedIntersectionTypes: ast.IntersectionType[] = [];
    const astObjectTypes: ast.ObjectType[] = [];
    const syntheticAstObjectTypesByName: Record<string, ast.ObjectType> = {};
    const astNamedUnionTypes: ast.UnionType[] = [];

    for (const nodeShape of this.shapesGraph.nodeShapes) {
      if (nodeShape.identifier.termType !== "NamedNode") {
        continue;
      }

      if (nodeShape.identifier.value.startsWith(dash[""].value)) {
        continue;
      }

      const nodeShapeAstTypeEither = transformNodeShapeToAstType.call(
        this,
        nodeShape,
      );
      if (nodeShapeAstTypeEither.isLeft()) {
        return nodeShapeAstTypeEither;
      }
      const nodeShapeAstType = nodeShapeAstTypeEither.unsafeCoerce();

      switch (nodeShapeAstType.kind) {
        case "IntersectionType":
          if (nodeShapeAstType.isNamed) {
            astNamedIntersectionTypes.push(nodeShapeAstType);
          }
          break;
        case "ObjectType": {
          astObjectTypes.push(nodeShapeAstType);
          for (const property of nodeShapeAstType.properties) {
            switch (property.type.kind) {
              case "LazyObjectOptionType":
              case "LazyObjectSetType":
              case "LazyObjectType": {
                const partialItemType =
                  property.type.partialType.kind === "ObjectType" ||
                  property.type.partialType.kind === "UnionType"
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
        case "UnionType":
          if (nodeShapeAstType.isNamed) {
            astNamedUnionTypes.push(nodeShapeAstType);
          }
          break;
        default:
          break;
      }
    }

    return Either.of({
      objectIntersectionTypes: astNamedIntersectionTypes,
      objectTypes: astObjectTypes.concat(
        Object.values(syntheticAstObjectTypesByName),
      ),
      objectUnionTypes: astNamedUnionTypes,
    });
  }
}
