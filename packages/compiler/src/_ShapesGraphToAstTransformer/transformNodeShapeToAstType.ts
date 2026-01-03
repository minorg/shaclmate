import { rdf } from "@tpluscode/rdf-ns-builders";
import type { TsFeature } from "enums/TsFeature.js";
import { DataFactory } from "n3";
import { Either, Left, Maybe } from "purify-ts";
import { invariant } from "ts-invariant";
import * as ast from "../ast/index.js";
import { Eithers } from "../Eithers.js";
import * as input from "../input/index.js";
import { tsFeaturesDefault } from "../input/tsFeatures.js";
import { logger } from "../logger.js";
import type { ShapesGraphToAstTransformer } from "../ShapesGraphToAstTransformer.js";
import type { NodeShapeAstType } from "./NodeShapeAstType.js";
import { nodeShapeIdentifierMintingStrategy } from "./nodeShapeIdentifierMintingStrategy.js";
import { shapeNodeKinds } from "./shapeNodeKinds.js";

const listPropertiesObjectType = new ast.ObjectType({
  abstract: false,
  export_: false,
  extern: false,
  comment: Maybe.empty(),
  label: Maybe.empty(),
  identifierMintingStrategy: Maybe.empty(),
  identifierType: new ast.IdentifierType({
    comment: Maybe.empty(),
    defaultValue: Maybe.empty(),
    hasValues: [],
    label: Maybe.empty(),
    in_: [],
    nodeKinds: new Set(["BlankNode", "NamedNode"]),
  }),
  fromRdfType: Maybe.empty(),
  name: Maybe.empty(),
  toRdfTypes: [],
  tsFeatures: new Set<TsFeature>([]),
  tsObjectDeclarationType: "class",
  shapeIdentifier: DataFactory.blankNode(),
  synthetic: true,
  tsImports: [],
});

/**
 * Is an ast.ObjectType actually the shape of an RDF list?
 * If so, return the type of its rdf:first.
 */
function transformNodeShapeToAstListType(
  this: ShapesGraphToAstTransformer,
  nodeShape: input.NodeShape,
): Either<Error, ast.ListType> {
  invariant(nodeShape.isList);

  return Eithers.chain3(
    nodeShapeIdentifierMintingStrategy(nodeShape),
    shapeNodeKinds(nodeShape),
    nodeShape.constraints.xone,
  ).chain(([identifierMintingStrategy, nodeKinds, xone]) => {
    // Put a placeholder in the cache to deal with cyclic references
    // Remove the placeholder if the transformation fails.
    const listType = new ast.ListType<ast.Type>({
      comment: nodeShape.comment,
      identifierNodeKind: nodeKinds.has("BlankNode")
        ? "BlankNode"
        : "NamedNode",
      itemType: ast.PlaceholderType.instance,
      label: nodeShape.label,
      mutable: nodeShape.mutable.orDefault(false),
      identifierMintingStrategy,
      shapeIdentifier: this.shapeIdentifier(nodeShape),
      toRdfTypes: nodeShape.toRdfTypes,
    });

    this.nodeShapeAstTypesByIdentifier.set(nodeShape.identifier, listType);

    return (() => {
      let emptyListShape: input.Shape | undefined;
      let nonEmptyListShape: input.NodeShape | undefined;
      for (const shape of xone) {
        if (
          shape.constraints.hasValues.length === 1 &&
          shape.constraints.hasValues[0].equals(rdf.nil)
        ) {
          emptyListShape = shape;
        } else if (
          shape instanceof input.NodeShape &&
          shape.constraints.properties.orDefault([]).length >= 2
        ) {
          nonEmptyListShape = shape;
        }
      }

      if (!emptyListShape || !nonEmptyListShape) {
        return Left(
          new Error(
            `${nodeShape} does not have an sh:xone with exactly two shapes, one for the empty list and one for the non-empty list`,
          ),
        );
      }

      return nonEmptyListShape.constraints.properties.chain(
        (nonEmptyListShapeProperties) => {
          let firstPropertyShape: input.PropertyShape | undefined;
          let restPropertyShape: input.PropertyShape | undefined;
          for (const propertyShape of nonEmptyListShapeProperties) {
            if (propertyShape.path.kind !== "PredicatePath") {
              continue;
            }
            if (propertyShape.path.iri.equals(rdf.first)) {
              firstPropertyShape = propertyShape;
            } else if (propertyShape.path.iri.equals(rdf.rest)) {
              restPropertyShape = propertyShape;
            }
          }

          if (!firstPropertyShape) {
            return Left(
              new Error(
                `${nodeShape} has a non-empty list shape without an sh:property shape whose sh:path is rdf:first`,
              ),
            );
          }
          if (
            firstPropertyShape.constraints.maxCount.extract() !== 1 ||
            firstPropertyShape.constraints.minCount.extract() !== 1
          ) {
            return Left(
              new Error(
                `${nodeShape} non-empty list shape rdf:first property shape does not have sh:maxCount=1 and/or sh:minCount=1`,
              ),
            );
          }

          if (!restPropertyShape) {
            return Left(
              new Error(
                `${nodeShape} has a non-empty list shape without an sh:property shape whose sh:path is rdf:rest`,
              ),
            );
          }
          if (
            restPropertyShape.constraints.maxCount.extract() !== 1 ||
            restPropertyShape.constraints.minCount.extract() !== 1
          ) {
            return Left(
              new Error(
                `${nodeShape} non-empty list shape rdf:rest property shape does not have sh:maxCount=1 and/or sh:minCount=1`,
              ),
            );
          }

          const firstPropertyEither =
            this.transformPropertyShapeToAstObjectTypeProperty({
              // Just need a dummy ast.ObjectType here to get the properties transformed.
              objectType: listPropertiesObjectType,
              propertyShape: firstPropertyShape,
            });
          if (firstPropertyEither.isLeft()) {
            return firstPropertyEither;
          }
          const firstProperty = firstPropertyEither.unsafeCoerce();
          listType.itemType = firstProperty.type;

          const restPropertyEither =
            this.transformPropertyShapeToAstObjectTypeProperty({
              // Just need a dummy ast.ObjectType here to get the properties transformed.
              objectType: listPropertiesObjectType,
              propertyShape: restPropertyShape,
            });
          if (restPropertyEither.isLeft()) {
            return restPropertyEither;
          }
          const restProperty = restPropertyEither.unsafeCoerce();
          if (
            restProperty.type.kind !== "ListType" ||
            !restProperty.type.shapeIdentifier.equals(nodeShape.identifier)
          ) {
            return Left(
              new Error(
                `${nodeShape} rdf:rest property is not recursive into the node shape`,
              ),
            );
          }

          return Either.of<Error, ast.ListType<ast.Type>>(listType);
        },
      );
    })().ifLeft(() => {
      this.nodeShapeAstTypesByIdentifier.delete(nodeShape.identifier);
    });
  });
}

export function transformNodeShapeToAstObjectCompoundType(
  this: ShapesGraphToAstTransformer,
  {
    export_,
    nodeShape,
  }: {
    export_: boolean;
    nodeShape: input.NodeShape;
  },
): Either<Error, ast.ObjectIntersectionType | ast.ObjectUnionType> {
  return Eithers.chain3(
    nodeShape.constraints.and,
    nodeShape.tsFeatures,
    nodeShape.constraints.xone,
  ).chain(([andShapes, tsFeatures, xoneShapes]) => {
    let compoundTypeShapes: readonly input.Shape[];
    let compoundTypeKind:
      | ast.ObjectIntersectionType["kind"]
      | ast.ObjectUnionType["kind"];

    if (andShapes.length > 0) {
      compoundTypeShapes = andShapes;
      compoundTypeKind = "ObjectIntersectionType";
    } else if (xoneShapes.length > 0) {
      compoundTypeShapes = xoneShapes;
      compoundTypeKind = "ObjectUnionType";
    } else {
      throw new Error("should never be reached");
    }

    const compoundTypeNodeShapes: input.NodeShape[] = [];
    for (const compoundTypeShape of compoundTypeShapes) {
      if (!(compoundTypeShape instanceof input.NodeShape)) {
        return Left(
          new Error(`${nodeShape} has non-NodeShape in its logical constraint`),
        );
      }
      compoundTypeNodeShapes.push(compoundTypeShape);
    }
    if (compoundTypeNodeShapes.length === 0) {
      return Left(
        new Error(`${nodeShape} has no NodeShapes in its logical constraint`),
      );
    }

    // Put a placeholder in the cache to deal with cyclic references
    const compoundType: ast.ObjectIntersectionType | ast.ObjectUnionType = new (
      compoundTypeKind === "ObjectIntersectionType"
        ? ast.ObjectIntersectionType
        : ast.ObjectUnionType
    )({
      comment: nodeShape.comment,
      export_,
      label: nodeShape.label,
      name: nodeShape.shaclmateName,
      shapeIdentifier: this.shapeIdentifier(nodeShape),
      tsFeatures,
    });

    this.nodeShapeAstTypesByIdentifier.set(nodeShape.identifier, compoundType);
    return (() => {
      for (const memberNodeShape of compoundTypeNodeShapes) {
        const memberTypeEither =
          this.transformNodeShapeToAstType(memberNodeShape);
        if (memberTypeEither.isLeft()) {
          return memberTypeEither;
        }
        const addMemberTypeResult = compoundType.addMemberType(
          memberTypeEither.unsafeCoerce(),
        );
        if (addMemberTypeResult.isLeft()) {
          return addMemberTypeResult;
        }
      }

      return Either.of<Error, ast.ObjectIntersectionType | ast.ObjectUnionType>(
        compoundType,
      );
    })().ifLeft(() => {
      this.nodeShapeAstTypesByIdentifier.delete(nodeShape.identifier);
    });
  });
}

export function transformNodeShapeToAstType(
  this: ShapesGraphToAstTransformer,
  nodeShape: input.NodeShape,
): Either<Error, NodeShapeAstType> {
  {
    const type = this.nodeShapeAstTypesByIdentifier.get(nodeShape.identifier);
    if (type) {
      return Either.of(type);
    }
  }

  if (nodeShape.isList) {
    return transformNodeShapeToAstListType.bind(this)(nodeShape);
  }

  return Eithers.chain11(
    nodeShape.ancestorNodeShapes,
    nodeShape.childNodeShapes,
    nodeShape.descendantNodeShapes,
    nodeShape.parentNodeShapes,
    nodeShape.constraints.and,
    nodeShapeIdentifierMintingStrategy(nodeShape),
    shapeNodeKinds(nodeShape),
    nodeShape.constraints.properties,
    nodeShape.tsFeatures,
    nodeShape.tsObjectDeclarationType,
    nodeShape.constraints.xone,
  ).chain<Error, NodeShapeAstType>(
    ([
      ancestorNodeShapes,
      childNodeShapes,
      descendantNodeShapes,
      parentNodeShapes,
      andShapes,
      identifierMintingStrategy,
      nodeKinds,
      propertyShapes,
      tsFeatures,
      tsObjectDeclarationType,
      xoneShapes,
    ]) => {
      const abstract = nodeShape.abstract.orDefault(false);

      const export_ = nodeShape.export.orDefault(true);

      if (andShapes.length > 0 || xoneShapes.length > 0) {
        return transformNodeShapeToAstObjectCompoundType.bind(this)({
          export_,
          nodeShape,
        });
      }

      const fromRdfType = nodeShape.fromRdfType.alt(nodeShape.rdfType);
      const toRdfTypes = nodeShape.toRdfTypes.concat();
      if (toRdfTypes.length === 0) {
        toRdfTypes.push(...nodeShape.rdfType.toList());
      }
      // Ensure toRdfTypes has fromRdfType
      fromRdfType.ifJust((fromRdfType) => {
        if (!toRdfTypes.some((toRdfType) => toRdfType.equals(fromRdfType))) {
          toRdfTypes.push(fromRdfType);
        }
      });

      const identifierIn = nodeShape.constraints.in_.filter(
        (term) => term.termType === "NamedNode",
      );

      if (identifierMintingStrategy.isJust() && identifierIn.length > 0) {
        logger.debug(
          "%s cannot have an identifier minting strategy AND sh:in",
          nodeShape,
        );
        identifierMintingStrategy = Maybe.empty();
      }

      // Put a placeholder in the cache to deal with cyclic references
      // Remove the placeholder if the transformation fails.
      // If this node shape's properties (directly or indirectly) refer to the node shape itself,
      // we'll return this placeholder.
      const objectType = new ast.ObjectType({
        abstract,
        comment: nodeShape.comment,
        export_: export_,
        extern: nodeShape.extern.orDefault(false),
        fromRdfType,
        label: nodeShape.label,
        identifierType: new ast.IdentifierType({
          comment: Maybe.empty(),
          defaultValue: Maybe.empty(),
          hasValues: [],
          in_: identifierIn,
          label: Maybe.empty(),
          nodeKinds,
        }),
        identifierMintingStrategy,
        name: nodeShape.shaclmateName,
        shapeIdentifier: this.shapeIdentifier(nodeShape),
        synthetic: false,
        toRdfTypes,
        tsFeatures: tsFeatures.orDefault(new Set(tsFeaturesDefault)),
        tsImports: nodeShape.tsImports,
        tsObjectDeclarationType: tsObjectDeclarationType.orDefault("class"),
      });

      this.nodeShapeAstTypesByIdentifier.set(nodeShape.identifier, objectType);

      return (() => {
        // Populate ancestor and descendant object types
        const relatedObjectTypes = (
          relatedNodeShapes: readonly input.NodeShape[],
        ): readonly ast.ObjectType[] => {
          return relatedNodeShapes.flatMap((relatedNodeShape) =>
            this.transformNodeShapeToAstType(relatedNodeShape)
              .toMaybe()
              .filter((astType) => astType.kind === "ObjectType")
              .toList(),
          );
        };
        objectType.addAncestorObjectTypes(
          ...relatedObjectTypes(ancestorNodeShapes),
        );
        objectType.addChildObjectTypes(...relatedObjectTypes(childNodeShapes));
        objectType.addDescendantObjectTypes(
          ...relatedObjectTypes(descendantNodeShapes),
        );
        objectType.addParentObjectTypes(
          ...relatedObjectTypes(parentNodeShapes),
        );

        // Populate properties
        for (const propertyShape of propertyShapes) {
          this.transformPropertyShapeToAstObjectTypeProperty({
            objectType,
            propertyShape,
          })
            .ifLeft((error) => {
              logger.warn(
                "error transforming %s %s: %s",
                nodeShape,
                propertyShape,
                error.message,
              );
            })
            .ifRight((property) => {
              objectType.addProperties(property);
            });
        }

        objectType.sortProperties();

        return Either.of<Error, ast.ObjectType>(objectType);
      })().ifLeft(() => {
        this.nodeShapeAstTypesByIdentifier.delete(nodeShape.identifier);
      });
    },
  );
}
