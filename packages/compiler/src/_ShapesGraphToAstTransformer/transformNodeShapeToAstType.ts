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
import type { ShapesGraphToAstTransformer } from "../ShapesGraphToAstTransformer.js";
import { nodeShapeIdentifierMintingStrategy } from "./nodeShapeIdentifierMintingStrategy.js";
import { shapeName } from "./shapeName.js";
import { shapeNodeKinds } from "./shapeNodeKinds.js";
import { transformPropertyShapeToAstObjectTypeProperty } from "./transformPropertyShapeToAstObjectTypeProperty.js";
import { transformShapeToAstCompoundType } from "./transformShapeToAstCompoundType.js";

const defaultNodeShapeNodeKinds: ReadonlySet<NodeKind> = new Set([
  "BlankNode",
  "IRI",
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
    case "IriType":
    case "LazyObjectType":
    case "ListType":
    case "LiteralType":
    case "ObjectType":
    case "TermType":
      return true;
    case "IntersectionType":
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

const astListTypePlaceholderItemType = new ast.BlankNodeType({
  comment: Maybe.empty(),
  label: Maybe.empty(),
  name: Maybe.empty(),
  shapeIdentifier: dataFactory.blankNode(),
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
      identifierNodeKind: nodeKinds.has("BlankNode") ? "BlankNode" : "IRI",
      itemType: astListTypePlaceholderItemType,
      label: nodeShape.label,
      mutable: nodeShape.mutable.orDefault(false),
      name: Maybe.empty(),
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
                      nodeShape.identifier,
                    )
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

export function transformNodeShapeToAstType(
  this: ShapesGraphToAstTransformer,
  nodeShape: input.NodeShape,
): Either<Error, ast.Type> {
  {
    const type = this.nodeShapeAstTypesByIdentifier.get(nodeShape.identifier);
    if (type) {
      return Either.of(type);
    }
  }

  if (nodeShape.isList) {
    return transformNodeShapeToAstListType.call(this, nodeShape);
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
    this.nodeShapeTsFeatures(nodeShape),
    nodeShape.tsObjectDeclarationType.isJust()
      ? Either.of(nodeShape.tsObjectDeclarationType)
      : nodeShape.isDefinedBy.map((ontology) =>
          ontology.chain((ontology) => ontology.tsObjectDeclarationType),
        ),
    nodeShape.constraints.xone,
  ).chain<Error, ast.Type>(
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
        return transformShapeToAstCompoundType.call(this, {
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

      let identifierType: ast.BlankNodeType | ast.IdentifierType | ast.IriType;
      const identifierTypeProperties = {
        comment: Maybe.empty(),
        label: Maybe.empty(),
        name: Maybe.empty(),
        shapeIdentifier: this.shapeIdentifier(nodeShape),
      };
      if (nodeKinds.size === 2) {
        invariant(nodeShape.identifierIn.length === 0);
        identifierType = new ast.IdentifierType(identifierTypeProperties);
      } else {
        switch ([...nodeKinds][0]) {
          case "BlankNode":
            invariant(nodeShape.identifierIn.length === 0);
            identifierType = new ast.BlankNodeType(identifierTypeProperties);
            break;
          case "IRI":
            identifierType = new ast.IriType({
              ...identifierTypeProperties,
              hasValues: [],
              in_: nodeShape.identifierIn,
            });
            break;
          case "Literal":
            throw new Error("should never happen");
        }
      }

      // Put a placeholder in the cache to deal with cyclic references
      // Remove the placeholder if the transformation fails.
      // If this node shape's properties (directly or indirectly) refer to the node shape itself,
      // we'll return this placeholder.
      const objectType = new ast.ObjectType({
        abstract,
        comment: nodeShape.comment,
        export_,
        extern: nodeShape.extern.orDefault(false),
        fromRdfType,
        label: nodeShape.label,
        identifierType,
        identifierMintingStrategy,
        name: shapeName(nodeShape),
        shapeIdentifier: this.shapeIdentifier(nodeShape),
        synthetic: false,
        toRdfTypes,
        tsFeatures,
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
            transformNodeShapeToAstType
              .call(this, relatedNodeShape)
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
            transformPropertyShapeToAstObjectTypeProperty.call(this, {
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
