import type { NamedNode } from "@rdfjs/types";
import { Either, Left, Maybe } from "purify-ts";
import { invariant } from "ts-invariant";
import * as ast from "../ast/index.js";
import { Eithers } from "../Eithers.js";
import type * as input from "../input/index.js";
import type { ShapesGraphToAstTransformer } from "../ShapesGraphToAstTransformer.js";
import { defaultNodeShapeNodeKinds } from "./defaultNodeShapeNodeKinds.js";
import { nodeShapeIdentifierMintingStrategy } from "./nodeShapeIdentifierMintingStrategy.js";
import { nodeShapeTsFeatures } from "./nodeShapeTsFeatures.js";
import { ShapeStack } from "./ShapeStack.js";
import { shapeAstTypeName } from "./shapeAstTypeName.js";
import { shapeNodeKinds } from "./shapeNodeKinds.js";
import { transformPropertyShapeToAstObjectTypeProperty } from "./transformPropertyShapeToAstObjectTypeProperty.js";
import { transformShapeToAstType } from "./transformShapeToAstType.js";

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

export function transformShapeToAstObjectType(
  this: ShapesGraphToAstTransformer,
  shape: input.Shape,
  shapeStack: ShapeStack,
): Either<Error, Maybe<ast.ObjectType>> {
  shapeStack.push(shape);
  try {
    if (shape.kind !== "NodeShape") {
      return Either.of(Maybe.empty());
    }
    const nodeShape = shape;

    if (nodeShape.identifier.termType !== "NamedNode") {
      return Either.of(Maybe.empty());
    }

    return Eithers.chain2(
      nodeShape.constraints.and,
      nodeShape.constraints.xone,
    ).chain(([andShapes, xoneShapes]) => {
      if (andShapes.length > 0 || xoneShapes.length > 0) {
        return Either.of(Maybe.empty());
      }

      return Eithers.chain9(
        nodeShape.ancestorNodeShapes,
        nodeShape.childNodeShapes,
        nodeShape.descendantNodeShapes,
        nodeShape.parentNodeShapes,
        nodeShapeIdentifierMintingStrategy(nodeShape),
        shapeNodeKinds(nodeShape, { defaultNodeShapeNodeKinds }),
        nodeShape.constraints.properties,
        nodeShapeTsFeatures.call(this, nodeShape),
        nodeShape.tsObjectDeclarationType.isJust()
          ? Either.of(nodeShape.tsObjectDeclarationType)
          : nodeShape.isDefinedBy.map((ontology) =>
              ontology.chain((ontology) => ontology.tsObjectDeclarationType),
            ),
      ).chain<Error, Maybe<ast.ObjectType>>(
        ([
          ancestorNodeShapes,
          childNodeShapes,
          descendantNodeShapes,
          parentNodeShapes,
          identifierMintingStrategy,
          nodeKinds,
          propertyShapes,
          tsFeatures,
          tsObjectDeclarationType,
        ]) => {
          const abstract = nodeShape.abstract.orDefault(false);

          const export_ = nodeShape.export.orDefault(true);

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
              if (
                !toRdfTypes.some((toRdfType) => toRdfType.equals(fromRdfType))
              ) {
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
            | ast.IriType;
          const identifierTypeProperties = {
            comment: Maybe.empty(),
            label: Maybe.empty(),
            name: Maybe.empty(),
            shapeIdentifier: nodeShape.identifier,
          };
          if (nodeKinds.size === 2) {
            invariant(nodeShape.identifierIn.length === 0);
            identifierType = new ast.IdentifierType(identifierTypeProperties);
          } else {
            switch ([...nodeKinds][0]) {
              case "BlankNode":
                invariant(nodeShape.identifierIn.length === 0);
                identifierType = new ast.BlankNodeType(
                  identifierTypeProperties,
                );
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
          invariant(identifierType);

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
            name: shapeAstTypeName(nodeShape),
            shapeIdentifier: nodeShape.identifier,
            synthetic: false,
            toRdfTypes,
            tsFeatures,
            tsImports: nodeShape.tsImports,
            tsObjectDeclarationType: tsObjectDeclarationType.orDefault("class"),
          });

          this.cachedAstTypesByShapeIdentifier.set(
            nodeShape.identifier,
            objectType,
          );

          return (() => {
            // Populate ancestor and descendant object types
            const relatedObjectTypes = (
              relatedNodeShapes: readonly input.NodeShape[],
            ): readonly ast.ObjectType[] => {
              return relatedNodeShapes
                .flatMap((relatedNodeShape) =>
                  transformShapeToAstType
                    .call(this, relatedNodeShape, new ShapeStack())
                    .toMaybe()
                    .toList(),
                )
                .filter((astType) => astType.kind === "ObjectType");
            };
            objectType.addAncestorObjectTypes(
              ...relatedObjectTypes(ancestorNodeShapes),
            );
            objectType.addChildObjectTypes(
              ...relatedObjectTypes(childNodeShapes),
            );
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

            return Either.of<Error, Maybe<ast.ObjectType>>(
              Maybe.of(objectType),
            );
          })().ifLeft(() => {
            this.cachedAstTypesByShapeIdentifier.delete(nodeShape.identifier);
          });
        },
      );
    });
  } finally {
    shapeStack.pop(shape);
  }
}
