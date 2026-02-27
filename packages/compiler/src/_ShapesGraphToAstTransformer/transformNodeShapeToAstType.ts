import dataFactory from "@rdfjs/data-model";
import type { NamedNode } from "@rdfjs/types";
import type { NodeKind } from "@shaclmate/shacl-ast";
import { rdf } from "@tpluscode/rdf-ns-builders";
import { Either, Left, Maybe } from "purify-ts";
import { invariant } from "ts-invariant";
import * as ast from "../ast/index.js";
import { Eithers } from "../Eithers.js";
import type { TsFeature } from "../enums/TsFeature.js";
import type * as input from "../input/index.js";
import { tsFeaturesDefault } from "../input/tsFeatures.js";
import type { ShapesGraphToAstTransformer } from "../ShapesGraphToAstTransformer.js";
import type { NodeShapeAstType } from "./NodeShapeAstType.js";
import { nodeShapeIdentifierMintingStrategy } from "./nodeShapeIdentifierMintingStrategy.js";
import { nodeShapeTsFeatures } from "./nodeShapeTsFeatures.js";
import { shapeNodeKinds } from "./shapeNodeKinds.js";

const defaultNodeShapeNodeKinds: ReadonlySet<NodeKind> = new Set([
  "BlankNode",
  "NamedNode",
]);

function isObjectTypePropertyRequired(property: {
  type: ast.ObjectType.Property["type"];
}): boolean {
  switch (property.type.kind) {
    case "DefaultValueType":
      return false;
    case "LazyObjectOptionType":
      return false;
    case "LazyObjectSetType":
      return property.type.partialType.minCount > 0;
    case "OptionType":
      return false;
    case "SetType":
      return property.type.minCount > 0;
    case "UnionType":
      return property.type.memberTypes.every((memberType) =>
        isObjectTypePropertyRequired({ type: memberType }),
      );
    case "BlankNodeType":
    case "IdentifierType":
    case "LazyObjectType":
    case "ListType":
    case "LiteralType":
    case "NamedNodeType":
    case "ObjectType":
    case "ObjectUnionType":
    case "PlaceholderType":
    case "TermType":
      return true;
    case "IntersectionType":
    case "ObjectIntersectionType":
      throw new Error("unsupported");
    default:
      property.type satisfies never;
      throw new Error("should never reach this point");
  }
}

const listPropertiesObjectType = new ast.ObjectType({
  abstract: false,
  export_: false,
  extern: false,
  comment: Maybe.empty(),
  label: Maybe.empty(),
  identifierMintingStrategy: Maybe.empty(),
  identifierType: new ast.IdentifierType({
    comment: Maybe.empty(),
    label: Maybe.empty(),
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
    shapeNodeKinds(nodeShape, { defaultNodeShapeNodeKinds }),
    nodeShape.constraints.xone,
  ).chain(([identifierMintingStrategy, nodeKinds, xone]) => {
    // Put a placeholder in the cache to deal with cyclic references
    // Remove the placeholder if the transformation fails.
    const listType = new ast.ListType({
      comment: nodeShape.comment,
      identifierNodeKind: nodeKinds.has("BlankNode")
        ? "BlankNode"
        : "NamedNode",
      itemType: ast.PlaceholderType.instance as ast.ListType.ItemType,
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
          shape.kind === "NodeShape" &&
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
            if (propertyShape.path.$type !== "PredicatePath") {
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

          return this.transformPropertyShapeToAstObjectTypeProperty({
            // Just need a dummy ast.ObjectType here to get the properties transformed.
            objectType: listPropertiesObjectType,
            propertyShape: firstPropertyShape,
          }).chain((firstProperty) => {
            if (!ast.ListType.isItemType(firstProperty.type)) {
              return Left(
                new Error(
                  `${nodeShape}: ${firstProperty.type.kind} is not a valid list item type`,
                ),
              );
            }

            listType.itemType = firstProperty.type;

            return this.transformPropertyShapeToAstObjectTypeProperty({
              // Just need a dummy ast.ObjectType here to get the properties transformed.
              objectType: listPropertiesObjectType,
              propertyShape: restPropertyShape,
            }).chain((restProperty) => {
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

              return Either.of<Error, ast.ListType>(listType);
            });
          });
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
    nodeShapeTsFeatures(nodeShape),
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
      if (compoundTypeShape.kind !== "NodeShape") {
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
    return Either.sequence(
      compoundTypeNodeShapes.map((memberNodeShape) =>
        this.transformNodeShapeToAstType(memberNodeShape).chain((memberType) =>
          compoundType.addMemberType(memberType),
        ),
      ),
    )
      .map(() => compoundType)
      .ifLeft(() => {
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
    shapeNodeKinds(nodeShape, { defaultNodeShapeNodeKinds }),
    nodeShape.constraints.properties,
    nodeShapeTsFeatures(nodeShape),
    nodeShape.tsObjectDeclarationType.isJust()
      ? Either.of(nodeShape.tsObjectDeclarationType)
      : nodeShape.isDefinedBy.map((ontology) =>
          ontology.chain((ontology) => ontology.tsObjectDeclarationType),
        ),
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

      let fromRdfType: Maybe<NamedNode>;
      let toRdfTypes: NamedNode[];
      if (!abstract) {
        fromRdfType = nodeShape.fromRdfType.alt(nodeShape.rdfType);
        if (
          nodeShape.isClass &&
          nodeShape.identifier.termType === "NamedNode"
        ) {
          fromRdfType = fromRdfType.alt(Maybe.of(nodeShape.identifier));
        }
        toRdfTypes = nodeShape.toRdfTypes.concat();
        if (toRdfTypes.length === 0) {
          toRdfTypes.push(...nodeShape.rdfType.toList());
        }
        // Ensure toRdfTypes has fromRdfType
        fromRdfType.ifJust((fromRdfType) => {
          if (!toRdfTypes.some((toRdfType) => toRdfType.equals(fromRdfType))) {
            toRdfTypes.push(fromRdfType);
          }
        });
      } else {
        fromRdfType = Maybe.empty();
        toRdfTypes = [];
      }

      if (nodeKinds.has("Literal")) {
        return Left(
          new Error(`${nodeShape} should not have a nodeKind "Literal"`),
        );
      }

      let identifierType:
        | ast.BlankNodeType
        | ast.IdentifierType
        | ast.NamedNodeType;
      if (nodeKinds.size === 2) {
        invariant(nodeShape.identifierIn.length === 0);
        identifierType = new ast.IdentifierType({
          comment: Maybe.empty(),
          label: Maybe.empty(),
        });
      } else {
        switch ([...nodeKinds][0]) {
          case "BlankNode":
            invariant(nodeShape.identifierIn.length === 0);
            identifierType = new ast.BlankNodeType({
              comment: Maybe.empty(),
              label: Maybe.empty(),
            });
            break;
          case "Literal":
            throw new Error("should never happen");
          case "NamedNode":
            identifierType = new ast.NamedNodeType({
              comment: Maybe.empty(),
              hasValues: [],
              in_: nodeShape.identifierIn,
              label: Maybe.empty(),
            });
            break;
        }
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
        identifierType,
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
          const propertyEither =
            this.transformPropertyShapeToAstObjectTypeProperty({
              objectType,
              propertyShape,
            });
          if (propertyEither.isLeft()) {
            return propertyEither;
          }
          propertyEither.ifRight((property) => {
            objectType.addProperties(property);
          });
        }

        if (
          !objectType.abstract &&
          !objectType.extern &&
          objectType.fromRdfType.isNothing() &&
          !objectType.properties.some(isObjectTypePropertyRequired)
        ) {
          return Left(
            new Error(
              `${nodeShape} has no required properties and no implicitly required rdf:type`,
            ),
          );
        }

        objectType.sortProperties();

        return Either.of<Error, ast.ObjectType>(objectType);
      })().ifLeft(() => {
        this.nodeShapeAstTypesByIdentifier.delete(nodeShape.identifier);
      });
    },
  );
}
