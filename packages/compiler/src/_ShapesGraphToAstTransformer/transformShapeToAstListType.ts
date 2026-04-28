import dataFactory from "@rdfjs/data-model";
import { rdf } from "@tpluscode/rdf-ns-builders";
import { Either, Left, Maybe } from "purify-ts";
import * as ast from "../ast/index.js";
import { Eithers } from "../Eithers.js";
import type { TsFeature } from "../enums/TsFeature.js";
import type * as input from "../input/index.js";
import type { ShapesGraphToAstTransformer } from "../ShapesGraphToAstTransformer.js";
import { defaultNodeShapeNodeKinds } from "./defaultNodeShapeNodeKinds.js";
import { nodeShapeIdentifierMintingStrategy } from "./nodeShapeIdentifierMintingStrategy.js";
import type { ShapeStack } from "./ShapeStack.js";
import { shapeAstTypeName } from "./shapeAstTypeName.js";
import { shapeNodeKinds } from "./shapeNodeKinds.js";
import { transformPropertyShapeToAstObjectTypeProperty } from "./transformPropertyShapeToAstObjectTypeProperty.js";

const listPropertiesObjectType = new ast.ObjectType({
  abstract: false,
  extern: false,
  comment: Maybe.empty(),
  label: Maybe.empty(),
  identifierMintingStrategy: Maybe.empty(),
  identifierType: new ast.IdentifierType({
    comment: Maybe.empty(),
    label: Maybe.empty(),
    name: Maybe.empty(),
    shapeIdentifier: dataFactory.blankNode(),
  }),
  fromRdfType: Maybe.empty(),
  name: Maybe.empty(),
  toRdfTypes: [],
  tsFeatures: new Set<TsFeature>([]),
  tsObjectDeclarationType: "class",
  shapeIdentifier: dataFactory.blankNode(),
  synthetic: true,
  tsImports: [],
});

const astListTypePlaceholderItemType = new ast.BlankNodeType({
  comment: Maybe.empty(),
  label: Maybe.empty(),
  name: Maybe.empty(),
  shapeIdentifier: dataFactory.blankNode(),
});

const empty = Either.of<Error, Maybe<ast.ListType>>(Maybe.empty());

/**
 * Is an ast.ObjectType actually the shape of an RDF list?
 * If so, return the type of its rdf:first.
 */
export function transformShapeToAstListType(
  this: ShapesGraphToAstTransformer,
  shape: input.Shape,
  shapeStack: ShapeStack,
): Either<Error, Maybe<ast.ListType>> {
  shapeStack.push(shape);
  try {
    if (shape.$type !== "NodeShape") {
      return empty;
    }
    const nodeShape = shape;

    return Eithers.chain3(
      nodeShapeIdentifierMintingStrategy.call(this, nodeShape),
      shapeNodeKinds.call(this, nodeShape, { defaultNodeShapeNodeKinds }),
      Either.sequence(
        nodeShape.xone
          .orDefault([])
          .map((shapeIdentifier) => this.shapesGraph.shape(shapeIdentifier)),
      ),
    ).chain(([identifierMintingStrategy, nodeKinds, xone]) => {
      // Put a placeholder in the cache to deal with cyclic references
      // Remove the placeholder if the transformation fails.
      const listType = new ast.ListType<ast.ListType.ItemType>({
        comment: nodeShape.comment,
        identifierNodeKind: nodeKinds.has("BlankNode") ? "BlankNode" : "IRI",
        itemType: astListTypePlaceholderItemType,
        label: nodeShape.label,
        mutable: nodeShape.mutable.orDefault(false),
        name: shapeAstTypeName(nodeShape),
        identifierMintingStrategy,
        shapeIdentifier: nodeShape.$identifier,
        toRdfTypes: nodeShape.toRdfTypes,
      });

      this.cachedAstTypesByShapeIdentifier.set(nodeShape.$identifier, listType);

      return (() => {
        let emptyListShape: input.Shape | undefined;
        let nonEmptyListShape: input.NodeShape | undefined;
        for (const shape of xone) {
          if (
            shape.hasValues.length === 1 &&
            shape.hasValues[0].equals(rdf.nil)
          ) {
            emptyListShape = shape;
          } else if (
            shape.$type === "NodeShape" &&
            shape.properties.length >= 2
          ) {
            nonEmptyListShape = shape;
          }
        }

        if (!emptyListShape || !nonEmptyListShape) {
          return empty;
        }

        return Either.sequence(
          nonEmptyListShape.properties.map((propertyShapeIdentifier) =>
            this.shapesGraph.propertyShape(propertyShapeIdentifier),
          ),
        ).chain((nonEmptyListShapeProperties) => {
          let firstPropertyShape: input.PropertyShape | undefined;
          let restPropertyShape: input.PropertyShape | undefined;
          for (const propertyShape of nonEmptyListShapeProperties) {
            if (propertyShape.path.termType !== "NamedNode") {
              continue;
            }
            if (propertyShape.path.equals(rdf.first)) {
              firstPropertyShape = propertyShape;
            } else if (propertyShape.path.equals(rdf.rest)) {
              restPropertyShape = propertyShape;
            }
          }

          if (!firstPropertyShape) {
            return empty;
          }
          if (
            firstPropertyShape.maxCount.extract() !== 1 ||
            firstPropertyShape.minCount.extract() !== 1
          ) {
            return Left(
              new Error(
                `${nodeShape} non-empty list shape rdf:first property shape does not have sh:maxCount=1 and/or sh:minCount=1`,
              ),
            );
          }

          if (!restPropertyShape) {
            return empty;
          }
          if (
            restPropertyShape.maxCount.extract() !== 1 ||
            restPropertyShape.minCount.extract() !== 1
          ) {
            return Left(
              new Error(
                `${nodeShape} non-empty list shape rdf:rest property shape does not have sh:maxCount=1 and/or sh:minCount=1`,
              ),
            );
          }

          return transformPropertyShapeToAstObjectTypeProperty
            .call(this, {
              // Just need a dummy ast.ObjectType here to get the properties transformed.
              objectType: listPropertiesObjectType,
              propertyShape: firstPropertyShape,
            })
            .chain((firstProperty) => {
              if (!ast.ListType.isItemType(firstProperty.type)) {
                return Left(
                  new Error(
                    `${nodeShape}: ${firstProperty.type.kind} is not a valid list item type`,
                  ),
                );
              }

              listType.itemType = firstProperty.type;

              return transformPropertyShapeToAstObjectTypeProperty
                .call(this, {
                  // Just need a dummy ast.ObjectType here to get the properties transformed.
                  objectType: listPropertiesObjectType,
                  propertyShape: restPropertyShape,
                })
                .chain((restProperty) => {
                  if (
                    restProperty.type.kind !== "ListType" ||
                    !restProperty.type.shapeIdentifier.equals(
                      nodeShape.$identifier,
                    )
                  ) {
                    return Left(
                      new Error(
                        `${nodeShape} rdf:rest property is not recursive into the node shape`,
                      ),
                    );
                  }

                  return Either.of<Error, Maybe<ast.ListType>>(
                    Maybe.of(listType),
                  );
                });
            });
        });
      })().ifLeft(() => {
        this.cachedAstTypesByShapeIdentifier.delete(nodeShape.$identifier);
      });
    });
  } finally {
    shapeStack.pop(shape);
  }
}
