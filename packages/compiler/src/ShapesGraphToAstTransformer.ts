import TermMap from "@rdfjs/term-map";
import type { BlankNode, NamedNode } from "@rdfjs/types";
import { Resource } from "@rdfx/resource";
import { dash } from "@tpluscode/rdf-ns-builders";
import { Either } from "purify-ts";
import { invariant } from "ts-invariant";
import { ShapeStack } from "./_ShapesGraphToAstTransformer/ShapeStack.js";
import { transformShapeToAstType } from "./_ShapesGraphToAstTransformer/transformShapeToAstType.js";
import type * as ast from "./ast/index.js";
import type { TsFeature } from "./enums/TsFeature.js";
import type * as input from "./input/index.js";
import { logger } from "./logger.js";

interface RelatedNodeShapes {
  readonly ancestors: input.NodeShape[];
  readonly children: input.NodeShape[];
  readonly parents: input.NodeShape[];
  readonly descendants: input.NodeShape[];
}

function relatedNodeShapes(
  shapesGraph: input.ShapesGraph,
): TermMap<input.NodeShape.$Identifier, RelatedNodeShapes> {
  const immediateRelatedNodeShapes = new TermMap<
    input.NodeShape.$Identifier,
    {
      children: TermMap<input.NodeShape.$Identifier, input.NodeShape>;
      parents: TermMap<input.NodeShape.$Identifier, input.NodeShape>;
    }
  >();

  for (const childNodeShape of shapesGraph.nodeShapes) {
    let childRelatedNodeShapes = immediateRelatedNodeShapes.get(
      childNodeShape.$identifier,
    );
    if (!childRelatedNodeShapes) {
      childRelatedNodeShapes = {
        children: new TermMap(),
        parents: new TermMap(),
      };
      immediateRelatedNodeShapes.set(
        childNodeShape.$identifier,
        childRelatedNodeShapes,
      );
    }

    for (const parentClassIdentifier of childNodeShape.subClassOf) {
      shapesGraph
        .nodeShape(parentClassIdentifier)
        .ifLeft((error) => {
          logger.error(
            "%s is rdfs:subClassOf %s which is either missing or not a node shape: %s",
            childNodeShape,
            Resource.Identifier.toString(parentClassIdentifier),
            error.message,
          );
        })
        .ifRight((parentNodeShape) => {
          childRelatedNodeShapes.parents.set(
            parentNodeShape.$identifier,
            parentNodeShape,
          );

          let parentRelatedNodeShapes = immediateRelatedNodeShapes.get(
            parentNodeShape.$identifier,
          );
          if (!parentRelatedNodeShapes) {
            parentRelatedNodeShapes = {
              children: new TermMap(),
              parents: new TermMap(),
            };
            immediateRelatedNodeShapes.set(
              parentNodeShape.$identifier,
              parentRelatedNodeShapes,
            );
          }

          parentRelatedNodeShapes.children.set(
            childNodeShape.$identifier,
            childNodeShape,
          );
        });
    }
  }

  const result = new TermMap<input.NodeShape.$Identifier, RelatedNodeShapes>();

  for (const nodeShape of shapesGraph.nodeShapes) {
    const { children: childNodeShapes, parents: parentNodeShapes } =
      immediateRelatedNodeShapes.get(nodeShape.$identifier)!;

    const ancestorNodeShapes = new TermMap<
      input.NodeShape.$Identifier,
      input.NodeShape
    >();

    function recurseAncestorNodeShapes(nodeShape: input.NodeShape) {
      for (const parentNodeShape of immediateRelatedNodeShapes
        .get(nodeShape.$identifier)!
        .parents.values()) {
        if (!ancestorNodeShapes.has(parentNodeShape.$identifier)) {
          ancestorNodeShapes.set(parentNodeShape.$identifier, parentNodeShape);
          recurseAncestorNodeShapes(parentNodeShape);
        }
      }
    }
    recurseAncestorNodeShapes(nodeShape);

    const descendantNodeShapes = new TermMap<
      input.NodeShape.$Identifier,
      input.NodeShape
    >();
    function recurseDescendantNodeShapes(nodeShape: input.NodeShape) {
      for (const childNodeShape of immediateRelatedNodeShapes
        .get(nodeShape.$identifier)!
        .children.values()) {
        if (!descendantNodeShapes.has(childNodeShape.$identifier)) {
          descendantNodeShapes.set(childNodeShape.$identifier, childNodeShape);
          recurseDescendantNodeShapes(childNodeShape);
        }
      }
    }
    recurseDescendantNodeShapes(nodeShape);

    result.set(nodeShape.$identifier, {
      ancestors: [...ancestorNodeShapes.values()],
      children: [...childNodeShapes.values()],
      descendants: [...descendantNodeShapes.values()],
      parents: [...parentNodeShapes.values()],
    });
  }

  return result;
}

export class ShapesGraphToAstTransformer {
  // Members are protected so they're accessible to functions in other files
  protected readonly cachedAstTypesByShapeIdentifier: TermMap<
    BlankNode | NamedNode,
    ast.Type
  > = new TermMap();
  protected readonly shapesGraph: input.ShapesGraph;
  protected readonly relatedNodeShapesByIdentifier: TermMap<
    BlankNode | NamedNode,
    RelatedNodeShapes
  > = new TermMap();
  protected tsFeaturesDefault: ReadonlySet<TsFeature>;

  constructor({
    shapesGraph,
    tsFeaturesDefault,
  }: {
    shapesGraph: input.ShapesGraph;
    tsFeaturesDefault?: ReadonlySet<TsFeature>;
  }) {
    this.relatedNodeShapesByIdentifier = relatedNodeShapes(shapesGraph);
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
      if (nodeShape.$identifier.termType !== "NamedNode") {
        continue;
      }

      if (nodeShape.$identifier.value.startsWith(dash[""].value)) {
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
        case "IntersectionType":
          if (nodeShapeAstType.name.isJust()) {
            astNamedIntersectionTypes.push(nodeShapeAstType);
          }
          break;
        case "ObjectType": {
          invariant(
            nodeShapeAstType.name.isJust(),
            `node shape missing name: ${nodeShapeAstType.shapeIdentifier}`,
          );
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
          if (nodeShapeAstType.name.isJust()) {
            astNamedUnionTypes.push(nodeShapeAstType);
          }
          break;
        default:
          break;
      }
    }

    return Either.of({
      namedIntersectionTypes: astNamedIntersectionTypes,
      namedObjectTypes: astObjectTypes.concat(
        Object.values(syntheticAstObjectTypesByName),
      ),
      namedUnionTypes: astNamedUnionTypes,
    });
  }
}
