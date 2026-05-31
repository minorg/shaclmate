import { owl, rdfs } from "@tpluscode/rdf-ns-builders";
import { Either, Left, Maybe } from "purify-ts";
import { invariant } from "ts-invariant";
import * as ast from "../ast/index.js";
import { Eithers } from "../Eithers.js";
import type * as input from "../input/index.js";
import type { ShapesGraphToAstTransformer } from "../ShapesGraphToAstTransformer.js";
import { defaultNodeShapeNodeKinds } from "./defaultNodeShapeNodeKinds.js";
import type { ShapeStack } from "./ShapeStack.js";
import { shapeAstTypeName } from "./shapeAstTypeName.js";
import { shapeNodeKinds } from "./shapeNodeKinds.js";
import { transformPropertyShapeToAstStructTypeProperty } from "./transformPropertyShapeToAstStructTypeProperty.js";
import { transformShapeToAstType } from "./transformShapeToAstType.js";

function isStructTypePropertyRequired(property: {
  type: ast.StructType.Property["type"];
}): boolean {
  switch (property.type.kind) {
    case "DefaultValue":
      return false;
    case "LazyOption":
      return false;
    case "LazySet":
      return property.type.partialType.minCount > 0n;
    case "Option":
      return false;
    case "Set":
      return property.type.minCount > 0;
    case "Union":
      return property.type.members.every((member) =>
        isStructTypePropertyRequired({ type: member.type }),
      );
    case "BlankNode":
    case "Identifier":
    case "Iri":
    case "Lazy":
    case "List":
    case "Literal":
    case "Struct":
    case "Term":
      return true;
    case "Intersection":
      throw new Error("unsupported");
    default:
      property.type satisfies never;
      throw new Error("should never reach this point");
  }
}

export function transformShapeToAstStructType(
  this: ShapesGraphToAstTransformer,
  shape: input.Shape,
  shapeStack: ShapeStack,
): Either<Error, Maybe<ast.Type>> {
  shapeStack.push(shape);
  try {
    // If the shape has an sh:node itself then transform that instead
    if (shape.node.isJust()) {
      return this.shapesGraph
        .nodeShape(shape.node.unsafeCoerce())
        .chain((nodeShape) =>
          transformShapeToAstType.call(this, nodeShape, shapeStack),
        )
        .map(Maybe.of);
    }

    if (shape.$type !== "NodeShape") {
      return Either.of(Maybe.empty());
    }

    const nodeShape = shape;

    if (
      nodeShape.and.orDefault([]).length > 0 ||
      nodeShape.xone.orDefault([]).length > 0
    ) {
      return Either.of(Maybe.empty());
    }

    if (nodeShape.properties.length === 0) {
      // A node shape must have sh:property to be considered a StructType
      return Either.of(Maybe.empty());
    }

    if (nodeShape.$identifier().termType !== "NamedNode") {
      return Either.of(Maybe.empty());
    }

    return Eithers.chain2(
      shapeNodeKinds.call(this, nodeShape, { defaultNodeShapeNodeKinds }),
      Either.sequence(
        nodeShape.properties.map((propertyShapeIdentifier) =>
          this.shapesGraph.propertyShape(propertyShapeIdentifier),
        ),
      ),
    ).chain<Error, Maybe<ast.StructType>>(([nodeKinds, propertyShapes]) => {
      const nodeShapeIdentifier = nodeShape.$identifier();

      const isClass =
        nodeShape.subClassOf.length > 0 ||
        nodeShape.types.some(
          (type) => type.equals(owl.Class) || type.equals(rdfs.Class),
        );

      let fromRdfType = nodeShape.fromRdfType.alt(nodeShape.rdfType);
      if (isClass && nodeShapeIdentifier.termType === "NamedNode") {
        fromRdfType = fromRdfType.alt(Maybe.of(nodeShapeIdentifier));
      }
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
        shapeIdentifier: nodeShape.$identifier(),
      };
      if (nodeKinds.size === 2) {
        invariant(nodeShape.in_.isNothing());
        identifierType = new ast.IdentifierType(identifierTypeProperties);
      } else {
        switch ([...nodeKinds][0]) {
          case "BlankNode":
            invariant(nodeShape.in_.isNothing());
            identifierType = new ast.BlankNodeType(identifierTypeProperties);
            break;
          case "IRI":
            identifierType = new ast.IriType({
              ...identifierTypeProperties,
              hasValues: [],
              in_: nodeShape.in_
                .orDefault([])
                .filter((_) => _.termType === "NamedNode"),
            });
            break;
          default:
            throw new Error("should never happen");
        }
      }
      invariant(identifierType);

      // Put a placeholder in the cache to deal with cyclic references
      // Remove the placeholder if the transformation fails.
      // If this node shape's properties (directly or indirectly) refer to the node shape itself,
      // we'll return this placeholder.
      const objectType = new ast.StructType({
        comment: nodeShape.comment,
        extern: nodeShape.extern.orDefault(false),
        fromRdfType,
        label: nodeShape.label,
        identifierType,
        name: shapeAstTypeName(nodeShape),
        shapeIdentifier: nodeShape.$identifier(),
        synthetic: false,
        toRdfTypes,
        tsImports: nodeShape.tsImports,
      });

      this.cachedAstTypesByShapeIdentifier.set(
        nodeShape.$identifier(),
        objectType,
      );

      return (() => {
        // Populate properties
        for (const propertyShape of propertyShapes) {
          const propertyEither =
            transformPropertyShapeToAstStructTypeProperty.call(this, {
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
          !objectType.extern &&
          objectType.fromRdfType.isNothing() &&
          !objectType.properties.some(isStructTypePropertyRequired)
        ) {
          return Left(
            new Error(
              `${nodeShape} has no required properties and no implicitly required rdf:type`,
            ),
          );
        }

        objectType.sortProperties();

        return Either.of<Error, Maybe<ast.StructType>>(Maybe.of(objectType));
      })().ifLeft(() => {
        this.cachedAstTypesByShapeIdentifier.delete(nodeShape.$identifier());
      });
    });
  } finally {
    shapeStack.pop(shape);
  }
}
